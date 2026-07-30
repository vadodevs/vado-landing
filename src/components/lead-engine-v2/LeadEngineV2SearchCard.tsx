"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useActiveIcpVersion } from "@/hooks/useActiveIcpVersion";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LeadEngineCountrySelect } from "@/components/lead-engine/LeadEngineCountrySelect";
import { LeadEngineStateSelect } from "@/components/lead-engine/LeadEngineStateSelect";
import { LeadEngineIcpPeekCard } from "@/components/lead-engine/LeadEngineIcpPeekCard";
import { coerceStateForCountry, sanitizeDiscoverQueryText } from "@/lib/lead-engine/icp-search-geo";
import { discoverQueryKey } from "@/lib/lead-engine/discover-query-utils";
import type { HunterSearchCompany, HunterSearchResponse } from "@/components/lead-engine/hunter-types";
import {
  HUNTER_DISCOVER_DEFAULT_LIMIT,
  HUNTER_DISCOVER_MAX_RESULTS,
} from "@/lib/lead-engine/hunter-constants";
import { mockHunterSearch, mockSuggestIcpQueries } from "@/lib/lead-engine-v2/mock-client-api";
import { cn } from "@/lib/utils";

const HUNTER_INPUT =
  "h-10 border-[#E84E1D]/25 bg-background/60 text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:border-[#E84E1D]/55 focus-visible:ring-2 focus-visible:ring-[#E84E1D]/35";

const EMPTY_LIBRARY: Array<{
  id: string;
  query: string;
  queryKey: string;
  rationale: string | null;
  usedAt: Date | string | null;
}> = [];

const btnGenerateQueries =
  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-[#E84E1D]/45 bg-[#E84E1D]/12 px-3 text-xs font-medium text-[#FFDDD4] hover:bg-[#E84E1D]/22 disabled:pointer-events-none disabled:opacity-50";

type LibraryFilter = "all" | "unused" | "used";

const LIBRARY_FILTER_BTNS: Array<{ id: LibraryFilter; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "unused", label: "Sin usar" },
  { id: "used", label: "Usadas" },
];

/** Pill «Nueva» solo en las primeras N sin usar (el resto basta con la barra). */
const FRESH_PILL_LIMIT = 5;

export type LeadEngineV2SearchMeta = {
  query: string;
  country: string;
  state?: string;
  city?: string;
};

type LeadEngineV2SearchCardProps = {
  onResults: (
    data: HunterSearchResponse | null,
    meta: LeadEngineV2SearchMeta | null,
    searchRunId?: string
  ) => void;
  onSearchStart?: () => void;
  onHistorySaved?: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  /** Stacked inside tools column — less chrome. */
  embedded?: boolean;
  className?: string;
};

function mergeCompanies(batches: HunterSearchCompany[]): HunterSearchCompany[] {
  const byDomain = new Map<string, HunterSearchCompany>();
  for (const company of batches) {
    const key = company.domain.trim().toLowerCase();
    if (!key || byDomain.has(key)) continue;
    byDomain.set(key, company);
  }
  return [...byDomain.values()];
}

export function LeadEngineV2SearchCard({
  onResults,
  onSearchStart,
  onHistorySaved,
  loading,
  setLoading,
  className,
}: LeadEngineV2SearchCardProps) {
  const { active, activeId, isReady, isLoading: icpLoading, isError: icpError, refetch: refetchIcp } =
    useActiveIcpVersion();
  const libraryQuery = trpc.icpDiscoverQueries.list.useQuery(
    { icpVersionId: activeId ?? "" },
    { enabled: isReady && !!activeId }
  );
  const markUsedMutation = trpc.icpDiscoverQueries.markUsed.useMutation();

  const [query, setQuery] = useState("");
  /** IDs seleccionados para búsqueda secuencial (multi). */
  const [selectedQueryIds, setSelectedQueryIds] = useState<Set<string>>(() => new Set());
  const [country, setCountry] = useState("MX");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [useLimit, setUseLimit] = useState(false);
  const [limit, setLimit] = useState(String(HUNTER_DISCOVER_DEFAULT_LIMIT));
  const [excludeSeen, setExcludeSeen] = useState(true);
  const [generatingQueries, setGeneratingQueries] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");

  const library = libraryQuery.data ?? EMPTY_LIBRARY;
  const libraryIdsKey = useMemo(() => library.map((r) => r.id).join(","), [library]);
  const hunterBusy = loading || generatingQueries;
  const freshCount = library.filter((r) => r.usedAt == null).length;
  const usedCount = library.length - freshCount;

  const visibleLibrary = useMemo(() => {
    const filtered =
      libraryFilter === "unused"
        ? library.filter((r) => r.usedAt == null)
        : libraryFilter === "used"
          ? library.filter((r) => r.usedAt != null)
          : library;
    return [...filtered].sort((a, b) => {
      const au = a.usedAt == null ? 0 : 1;
      const bu = b.usedAt == null ? 0 : 1;
      return au - bu;
    });
  }, [library, libraryFilter]);

  const freshPillIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of visibleLibrary) {
      if (row.usedAt != null) continue;
      ids.add(row.id);
      if (ids.size >= FRESH_PILL_LIMIT) break;
    }
    return ids;
  }, [visibleLibrary]);

  const selectedRows = useMemo(
    () => library.filter((r) => selectedQueryIds.has(r.id)),
    [library, selectedQueryIds]
  );

  const searchQueries = useMemo(() => {
    if (selectedRows.length > 1) {
      return selectedRows.map((r) => r.query.trim()).filter((q) => q.length >= 3);
    }
    // Una sola selección (o ninguna): prioriza el texto editable del campo.
    const manual = query.trim();
    return manual.length >= 3 ? [manual] : [];
  }, [selectedRows, query]);

  const canSearch = isReady && searchQueries.length > 0 && !loading;

  const searchBlockedReason = useMemo(() => {
    if (loading) return null;
    if (icpLoading) return "Cargando ICP…";
    if (icpError) return "No se pudo cargar el ICP. Revisa la conexión o recarga la página.";
    if (!isReady) return "Selecciona un ICP activo en el header.";
    if (searchQueries.length === 0) {
      return "Selecciona una o más queries de la biblioteca, o escribe una consulta.";
    }
    return null;
  }, [loading, icpLoading, icpError, isReady, searchQueries.length]);

  useEffect(() => {
    setState("");
  }, [country]);

  useEffect(() => {
    const validIds = new Set(libraryIdsKey ? libraryIdsKey.split(",") : []);
    setSelectedQueryIds((prev) => {
      if (validIds.size === 0) {
        return prev.size === 0 ? prev : new Set();
      }
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) return prev;
      return next;
    });
  }, [libraryIdsKey]);

  const toggleLibraryQuery = (id: string) => {
    const row = library.find((r) => r.id === id);
    if (!row) return;
    setSelectedQueryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Si es la primera/única selección, copiar al campo para editar.
    setQuery(row.query);
  };

  const selectAllLibrary = () => {
    setSelectedQueryIds(new Set(visibleLibrary.map((r) => r.id)));
  };

  const clearLibrarySelection = () => {
    setSelectedQueryIds(new Set());
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleCountryChange = (iso: string) => {
    setCountry(iso);
    setState((prev) => coerceStateForCountry(iso, prev));
  };

  const generateQueries = useCallback(async () => {
    if (!activeId || !isReady) {
      toast.error("Selecciona un ICP activo en el header.");
      return;
    }
    setGeneratingQueries(true);
    try {
      const json = await mockSuggestIcpQueries(activeId);
      if (!("kind" in json) || json.kind !== "suggestions" || !Array.isArray(json.variants) || json.variants.length === 0) {
        toast.error("Respuesta inesperada del servidor.");
        return;
      }
      const nextVariants = json.variants
        .map((v) => ({
          query: sanitizeDiscoverQueryText(v.query.trim()),
          rationale: v.rationale,
        }))
        .filter((v) => v.query.length >= 3);
      if (nextVariants.length === 0) {
        toast.error("No se recibieron queries válidas.");
        return;
      }

      const batchKeys = new Set(
        nextVariants.map((v) => discoverQueryKey(v.query)).filter((k) => k.length >= 3)
      );

      const refetched = await libraryQuery.refetch();
      const rows = refetched.data ?? [];
      // Preferir las del lote que siguen sin usar (badge Nueva).
      const newIds = rows
        .filter((r) => batchKeys.has(r.queryKey) && r.usedAt == null)
        .map((r) => r.id);
      const fallbackIds = newIds.length > 0
        ? newIds
        : rows.filter((r) => batchKeys.has(r.queryKey)).map((r) => r.id);
      if (fallbackIds.length > 0) {
        setSelectedQueryIds(new Set(fallbackIds));
        setQuery(rows.find((r) => r.id === fallbackIds[0])?.query ?? nextVariants[0]!.query);
        setLibraryFilter("unused");
      } else {
        setQuery(nextVariants[0]!.query);
      }

      const meta = json.suggestionsMeta;
      const libMsg =
        meta != null
          ? ` · ${meta.savedToLibrary} nueva(s) en biblioteca` +
            (meta.skippedAsDuplicate > 0 ? ` (${meta.skippedAsDuplicate} duplicada(s) omitida(s))` : "")
          : "";
      toast.success(`${nextVariants.length} query(s) generada(s)${libMsg}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    } finally {
      setGeneratingQueries(false);
    }
  }, [activeId, isReady, libraryQuery]);

  const runOneHunterSearch = async (
    q: string,
    c: string,
    searchLimit: number
  ): Promise<{
    data: HunterSearchResponse;
    snapshotId?: string;
    historySaveError?: string;
  }> => {
    const json = await mockHunterSearch({
      icpVersionId: activeId!,
      query: q,
      country: c,
      state: state.trim() || undefined,
      city: city.trim() || undefined,
      limit: searchLimit,
      excludeAlreadySeen: excludeSeen,
    });
    return {
      data: { companies: json.companies, meta: json.meta },
      snapshotId: json.snapshotId,
      historySaveError: json.historySaveError,
    };
  };

  const runSearch = async () => {
    if (!isReady || !activeId) {
      toast.error("Selecciona un ICP activo en el header.");
      return;
    }
    if (searchQueries.length === 0) {
      toast.error("Selecciona queries de la biblioteca o escribe una consulta (mín. 3 caracteres).");
      return;
    }
    const c = country.trim().toUpperCase();
    if (c.length !== 2) {
      toast.error("Elige un país válido.");
      return;
    }
    const searchLimit = useLimit
      ? Math.min(HUNTER_DISCOVER_MAX_RESULTS, Math.max(1, parseInt(limit, 10) || HUNTER_DISCOVER_DEFAULT_LIMIT))
      : HUNTER_DISCOVER_MAX_RESULTS;
    if (useLimit) {
      setLimit(String(searchLimit));
    }

    setLoading(true);
    onSearchStart?.();
    onResults(null, null);
    try {
      const allCompanies: HunterSearchCompany[] = [];
      let lastSnapshotId: string | undefined;
      let lastHistoryError: string | undefined;
      let failCount = 0;

      for (let i = 0; i < searchQueries.length; i++) {
        const q = searchQueries[i]!;
        try {
          const { data, snapshotId, historySaveError } = await runOneHunterSearch(
            q,
            c,
            searchLimit
          );
          allCompanies.push(...(data.companies ?? []));
          if (snapshotId) lastSnapshotId = snapshotId;
          if (historySaveError) lastHistoryError = historySaveError;
          if (searchQueries.length > 1) {
            toast.message(`Query ${i + 1}/${searchQueries.length}`, {
              description: `${data.companies?.length ?? 0} dominio(s) · ${q.slice(0, 80)}`,
            });
          }
        } catch (e) {
          failCount += 1;
          toast.error(
            `Query ${i + 1}/${searchQueries.length} falló: ${e instanceof Error ? e.message : "Error"}`
          );
        }
      }

      const companies = mergeCompanies(allCompanies);
      const metaLabel =
        searchQueries.length === 1
          ? searchQueries[0]!
          : `${searchQueries.length} queries · ${companies.length} dominios únicos`;
      const meta: LeadEngineV2SearchMeta = {
        query: metaLabel,
        country: c,
        ...(state.trim() ? { state: state.trim() } : {}),
        ...(city.trim() ? { city: city.trim() } : {}),
      };
      const data: HunterSearchResponse = {
        companies,
        meta: {
          discover: { queries: searchQueries },
          returned: companies.length,
          excludeAlreadySeen: excludeSeen,
        },
      };
      onResults(data, meta, lastSnapshotId);
      if (lastHistoryError) {
        toast.warning("No se guardó en historial", { description: lastHistoryError });
      }
      onHistorySaved?.();

      // Quitar badge «Nueva» de las queries de biblioteca que se ejecutaron.
      try {
        await markUsedMutation.mutateAsync({
          icpVersionId: activeId,
          queries: searchQueries,
        });
        await libraryQuery.refetch();
      } catch {
        // No bloquear el flujo si falla el mark; la búsqueda ya terminó.
      }

      if (companies.length === 0 && failCount === searchQueries.length) {
        toast.error("Ninguna query devolvió resultados.");
      } else {
        toast.success(
          companies.length
            ? `${companies.length} dominio(s) único(s)${searchQueries.length > 1 ? ` · ${searchQueries.length} queries` : ""}`
            : "Sin dominios nuevos (¿ya vistos o sin resultados?)"
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "gap-0 py-0 relative h-full border-[#E84E1D]/25 bg-card/95 p-4 shadow-sm transition-[box-shadow,border-color] duration-500 sm:p-5",
        loading &&
          "border-[#3390FF]/55 shadow-[0_0_0_1px_rgba(51,144,255,0.35),0_0_24px_rgba(51,144,255,0.22)] ring-1 ring-[#3390FF]/40 animate-[v2-hunter-pulse_2s_ease-in-out_infinite]",
        className
      )}
    >
      {loading ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[#3390FF]/8 via-transparent to-transparent"
          aria-hidden
        />
      ) : null}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E84E1D]/35 bg-[#1a0c08]/60">
            <Image src="/logos/hunter.svg" alt="" width={36} height={36} className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-[#FF9B77]">Hunter only</p>
            <h2 className="text-sm font-semibold text-foreground">Listas y dominios</h2>
          </div>
        </div>
        <button
          type="button"
          className={btnGenerateQueries}
          disabled={hunterBusy || !isReady}
          onClick={() => void generateQueries()}
        >
          {generatingQueries ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Generando…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-[#FF9B77]" aria-hidden />
              Generar queries
            </>
          )}
        </button>
      </div>

      {isReady && active ? (
        <LeadEngineIcpPeekCard
          name={active.name}
          description={active.description}
          contextLabel="activo"
          accent="blue"
          compact
          className="mb-3"
        />
      ) : (
        <p className="mb-3 text-xs text-muted-foreground">
          {icpError ? (
            <>
              Error al cargar ICP.{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => void refetchIcp()}
              >
                Reintentar
              </button>
            </>
          ) : (
            "Cargando ICP…"
          )}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-3">
          <div>
            <label htmlFor="v2-query" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Query{" "}
              <span className="font-normal text-muted-foreground">
                {selectedQueryIds.size > 0
                  ? `· ${selectedQueryIds.size} seleccionada(s)`
                  : "· Hunter Discover"}
              </span>
            </label>
            <Textarea
              id="v2-query"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Escribe o selecciona de la biblioteca…"
              rows={selectedQueryIds.size > 0 ? 2 : 3}
              className={cn(
                "w-full resize-y overflow-auto font-mono text-[0.8rem] leading-snug",
                selectedQueryIds.size > 0 ? "min-h-[3.25rem]" : "min-h-[4.5rem]",
                HUNTER_INPUT
              )}
              disabled={hunterBusy || !isReady || libraryQuery.isLoading}
            />
          </div>
          {libraryQuery.isLoading ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Cargando biblioteca…
            </p>
          ) : library.length === 0 ? (
            <p className="text-[0.7rem] leading-snug text-muted-foreground">
              Sin queries guardadas. Usa «Generar queries» o escribe arriba.
            </p>
          ) : (
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Biblioteca</p>
                  {freshCount > 0 ? (
                    <span className="text-[0.65rem] text-[#FF9B77]">{freshCount} sin usar</span>
                  ) : null}
                  <div
                    className="inline-flex rounded-md border border-border/60 bg-background/50 p-0.5"
                    role="tablist"
                    aria-label="Filtrar biblioteca"
                  >
                    {LIBRARY_FILTER_BTNS.map((btn) => {
                      const count =
                        btn.id === "all"
                          ? library.length
                          : btn.id === "unused"
                            ? freshCount
                            : usedCount;
                      const activeFilter = libraryFilter === btn.id;
                      return (
                        <button
                          key={btn.id}
                          type="button"
                          role="tab"
                          aria-selected={activeFilter}
                          disabled={hunterBusy}
                          onClick={() => setLibraryFilter(btn.id)}
                          className={cn(
                            "rounded px-2 py-0.5 text-[0.65rem] transition-colors disabled:opacity-50",
                            activeFilter
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {btn.label}
                          <span className="ml-1 opacity-70">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[0.65rem]">
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
                    disabled={hunterBusy || visibleLibrary.length === 0}
                    onClick={selectAllLibrary}
                  >
                    Marcar visibles
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
                    disabled={hunterBusy || selectedQueryIds.size === 0}
                    onClick={clearLibrarySelection}
                  >
                    Ninguna
                  </button>
                </div>
              </div>
              {visibleLibrary.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 px-3 py-4 text-center text-[0.75rem] text-muted-foreground">
                  {libraryFilter === "unused"
                    ? "No hay queries sin usar."
                    : libraryFilter === "used"
                      ? "Aún no has usado ninguna query."
                      : "Sin queries."}
                </p>
              ) : (
                <ul
                  className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border/50 bg-background/40 p-1.5 scrollbar-thin"
                  role="listbox"
                  aria-multiselectable
                  aria-label="Consultas Discover guardadas"
                >
                  {visibleLibrary.map((row) => {
                    const isSelected = selectedQueryIds.has(row.id);
                    const isFresh = row.usedAt == null;
                    const showPill = isFresh && freshPillIds.has(row.id);
                    return (
                      <li key={row.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={hunterBusy || !isReady}
                          onClick={() => toggleLibraryQuery(row.id)}
                          title={row.query}
                          className={cn(
                            "relative flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left text-[0.8125rem] leading-relaxed transition-colors",
                            "border border-transparent",
                            isSelected
                              ? "border-[#E84E1D]/45 bg-[#E84E1D]/15 text-foreground"
                              : isFresh
                                ? "text-foreground hover:bg-[#3390FF]/08"
                                : "text-muted-foreground/80 hover:bg-muted/35 hover:text-foreground"
                          )}
                        >
                          {isFresh ? (
                            <span
                              className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[#3390FF]/80"
                              aria-hidden
                            />
                          ) : null}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            tabIndex={-1}
                            className="mt-1 shrink-0 rounded border-[#E84E1D]/50 accent-[#E84E1D]"
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 line-clamp-2">
                            {showPill ? (
                              <span className="mr-1.5 inline-block align-middle rounded bg-[#3390FF]/20 px-1.5 py-px text-[0.6rem] font-semibold uppercase tracking-wide text-[#9DC6FF]">
                                Nueva
                              </span>
                            ) : null}
                            <span className="align-middle">{row.query}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {selectedRows.length === 1 && selectedRows[0]?.rationale ? (
                <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground line-clamp-3">
                  {selectedRows[0].rationale}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="sm:col-span-2 flex flex-wrap items-end gap-3 rounded-md border border-border/40 bg-muted/10 px-3 py-2.5">
          <div className="shrink-0">
            <label htmlFor="v2-country" className="mb-1 block text-[0.65rem] font-medium text-muted-foreground">
              País
            </label>
            <LeadEngineCountrySelect
              id="v2-country"
              value={country}
              onChange={handleCountryChange}
              flagOnly
            />
          </div>
          <div className="min-w-[9rem] flex-1">
            <label htmlFor="v2-state" className="mb-1 block text-[0.65rem] font-medium text-muted-foreground">
              Estado
            </label>
            <LeadEngineStateSelect
              id="v2-state"
              country={country.trim().toUpperCase() === "US" ? "US" : "MX"}
              value={state}
              onChange={setState}
              className={HUNTER_INPUT}
            />
          </div>
          <div className="min-w-[9rem] flex-[1.2]">
            <label htmlFor="v2-city" className="mb-1 block text-[0.65rem] font-medium text-muted-foreground">
              Ciudad
            </label>
            <Input
              id="v2-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Opcional"
              className={HUNTER_INPUT}
              disabled={hunterBusy}
            />
          </div>
        </div>

        <div className="sm:col-span-2 space-y-3 border-t border-border/40 pt-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={useLimit}
                onChange={(e) => setUseLimit(e.target.checked)}
                className="rounded border-[#E84E1D]/50 accent-[#E84E1D]"
                disabled={hunterBusy}
              />
              Limitar empresas
            </label>
            {useLimit ? (
              <Input
                id="v2-limit"
                type="number"
                min={1}
                max={HUNTER_DISCOVER_MAX_RESULTS}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className={cn(HUNTER_INPUT, "h-8 w-20")}
                disabled={hunterBusy}
                aria-label="Máx. empresas"
              />
            ) : (
              <span className="text-[0.65rem] text-muted-foreground">
                Hasta {HUNTER_DISCOVER_MAX_RESULTS}
              </span>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={excludeSeen}
                onChange={(e) => setExcludeSeen(e.target.checked)}
                className="rounded border-[#E84E1D]/50 accent-[#E84E1D]"
                disabled={hunterBusy}
              />
              No repetir dominios
            </label>
          </div>

          <Button
            type="button"
            className="w-full gap-2 border border-[#E84E1D]/50 bg-[#E84E1D]/15 text-[#FFDDD4] hover:bg-[#E84E1D]/25"
            disabled={!canSearch}
            title={searchBlockedReason ?? undefined}
            onClick={() => void runSearch()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {searchQueries.length > 1
                  ? `Buscar ${searchQueries.length} queries`
                  : "Buscar dominios"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
