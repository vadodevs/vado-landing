"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, BookmarkPlus, Check, ChevronLeft, ChevronRight, ExternalLink, Eye, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HunterSearchCompany, HunterSearchResponse } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import { LeadEngineV2LeadPreviewDialog } from "@/components/lead-engine-v2/LeadEngineV2LeadPreviewDialog";
import { normalizeDomain } from "@/lib/hunter/client";
import { trpc } from "@/lib/trpc";
import { v2LeadToSnapshotCompany } from "@/lib/lead-engine-v2/v2-lead-to-snapshot-company";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import type { TavilyV2Config } from "@/lib/lead-engine-v2/tavily-v2-options";
import type { V2IcpMatchResult } from "@/lib/lead-engine-v2/v2-icp-match-types";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const btnHunterSave =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:text-emerald-300";

type LeadEngineV2DomainsPanelProps = {
  data: HunterSearchResponse | null;
  meta: LeadEngineV2SearchMeta | null;
  loading: boolean;
  tavilyConfig: TavilyV2Config;
  tavilyAnalyzedDomains?: ReadonlySet<string>;
  tavilyEnrichments?: ReadonlyMap<string, TavilyV2StoredEnrichment>;
  tavilyRunningDomain?: string | null;
  icpVersionId?: string | null;
  icpMatches?: ReadonlyMap<string, V2IcpMatchResult>;
  onIcpMatch?: (domain: string, match: V2IcpMatchResult) => void;
  onDomainEnriched?: (enrichment: TavilyV2StoredEnrichment) => void;
  onTavilyFeedStart?: (domain: string) => void;
  onTavilyFeedEnd?: () => void;
  className?: string;
};

function isTavilyAnalyzed(domain: string, analyzed?: ReadonlySet<string>): boolean {
  if (!analyzed || analyzed.size === 0) return false;
  const key = normalizeDomain(domain) || domain.trim().toLowerCase();
  return analyzed.has(key);
}

export function LeadEngineV2DomainsPanel({
  data,
  meta,
  loading,
  tavilyConfig,
  tavilyAnalyzedDomains,
  tavilyEnrichments,
  tavilyRunningDomain,
  icpVersionId,
  icpMatches,
  onIcpMatch,
  onDomainEnriched,
  onTavilyFeedStart,
  onTavilyFeedEnd,
  className,
}: LeadEngineV2DomainsPanelProps) {
  const [previewDomain, setPreviewDomain] = useState<string | null>(null);
  const [saveSelection, setSaveSelection] = useState<Set<string>>(new Set());
  const [activeSaveDomains, setActiveSaveDomains] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const companies = data?.companies ?? [];
  const returned = data?.meta?.returned ?? companies.length;
  const totalPages = Math.max(1, Math.ceil(companies.length / ITEMS_PER_PAGE) || 1);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageCompanies = companies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const utils = trpc.useUtils();

  const domainKeys = useMemo(
    () =>
      companies
        .map((c) => normalizeDomain(c.domain))
        .filter(Boolean)
        .slice(0, 500),
    [companies]
  );

  const savedLookupQuery = trpc.hunterSavedLeads.savedDomainsLookup.useQuery(
    { icpVersionId: icpVersionId ?? "", domains: domainKeys },
    { enabled: Boolean(icpVersionId && domainKeys.length > 0) }
  );

  const savedDomainSet = useMemo(
    () => new Set(savedLookupQuery.data?.savedDomains ?? []),
    [savedLookupQuery.data]
  );

  const saveToHunterMutation = trpc.hunterSavedLeads.saveSearchSnapshot.useMutation({
    onSuccess: (r) => {
      toast.success(
        r.savedDomains === 1
          ? "1 lead guardado en Leads."
          : `${r.savedDomains} leads guardados en Leads.`
      );
      void utils.hunterSavedLeads.list.invalidate();
      void utils.hunterSavedLeads.savedDomainsLookup.invalidate();
      setSaveSelection(new Set());
    },
    onError: (e) => toast.error(e.message || "No se pudieron guardar los leads."),
  });

  useEffect(() => {
    setSaveSelection(new Set());
    setCurrentPage(1);
  }, [data, meta?.query]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const enrichmentForDomain = useCallback(
    (domain: string): TavilyV2StoredEnrichment | null | undefined => {
      if (!tavilyEnrichments) return null;
      const key = normalizeDomain(domain) || domain.trim().toLowerCase();
      return tavilyEnrichments.get(key) ?? null;
    },
    [tavilyEnrichments]
  );

  const icpMatchForDomain = useCallback(
    (domain: string): V2IcpMatchResult | null | undefined => {
      if (!icpMatches) return null;
      const key = normalizeDomain(domain) || domain.trim().toLowerCase();
      return icpMatches.get(key) ?? null;
    },
    [icpMatches]
  );

  const saveCompanies = useCallback(
    (list: HunterSearchCompany[]) => {
      if (!icpVersionId) {
        toast.error("Elige una versión de ICP activa.");
        return;
      }
      if (!meta?.query?.trim() || meta.query.trim().length < 3) {
        toast.error("Falta el contexto de búsqueda (query).");
        return;
      }
      const country = meta.country.trim().toUpperCase();
      if (country.length !== 2) {
        toast.error("País de búsqueda inválido.");
        return;
      }
      if (list.length === 0) {
        toast.error("No hay dominios para guardar.");
        return;
      }

      const snapshotCompanies = list.map((co) =>
        v2LeadToSnapshotCompany({
          company: co,
          searchMeta: meta,
          enrichment: enrichmentForDomain(co.domain),
          icpMatch: icpMatchForDomain(co.domain),
        })
      );

      const savingKeys = new Set(
        list.map((c) => normalizeDomain(c.domain)).filter(Boolean)
      );
      setActiveSaveDomains(savingKeys);

      saveToHunterMutation.mutate(
        {
          icpVersionId,
          query: meta.query.trim(),
          country,
          state: meta.state,
          city: meta.city,
          companies: snapshotCompanies,
        },
        {
          onSettled: () => setActiveSaveDomains(new Set()),
        }
      );
    },
    [
      enrichmentForDomain,
      icpMatchForDomain,
      icpVersionId,
      meta,
      saveToHunterMutation,
    ]
  );

  const saveDomains = useCallback(
    (domains: string[]) => {
      const wanted = new Set(
        domains.map((d) => normalizeDomain(d)).filter(Boolean)
      );
      const list = companies.filter((c) => wanted.has(normalizeDomain(c.domain)));
      saveCompanies(list);
    },
    [companies, saveCompanies]
  );

  const toggleSaveDomain = useCallback((domain: string) => {
    const nd = normalizeDomain(domain);
    if (!nd) return;
    setSaveSelection((prev) => {
      const next = new Set(prev);
      if (next.has(nd)) next.delete(nd);
      else next.add(nd);
      return next;
    });
  }, []);

  const saveStats = useMemo(() => {
    let selectable = 0;
    let selected = 0;
    for (const co of companies) {
      const nd = normalizeDomain(co.domain);
      if (!nd || savedDomainSet.has(nd)) continue;
      selectable++;
      if (saveSelection.has(nd)) selected++;
    }
    return { selectable, selected, total: companies.length };
  }, [companies, saveSelection, savedDomainSet]);

  const previewCompany = useMemo(
    () => companies.find((co) => co.domain === previewDomain) ?? null,
    [companies, previewDomain]
  );

  const previewEnrichment = useMemo(() => {
    if (!previewDomain || !tavilyEnrichments) return null;
    const key = normalizeDomain(previewDomain) || previewDomain.trim().toLowerCase();
    return tavilyEnrichments.get(key) ?? null;
  }, [previewDomain, tavilyEnrichments]);

  const previewIcpMatch = useMemo(() => {
    if (!previewDomain || !icpMatches) return null;
    const key = normalizeDomain(previewDomain) || previewDomain.trim().toLowerCase();
    return icpMatches.get(key) ?? null;
  }, [previewDomain, icpMatches]);

  return (
    <>
    <Card
      className={cn(
        "gap-0 py-0 flex min-h-[14rem] flex-col border-border/80 bg-card/60 transition-[box-shadow,border-color] duration-500",
        loading &&
          "border-[#3390FF]/40 shadow-[0_0_0_1px_rgba(51,144,255,0.2),0_0_14px_rgba(51,144,255,0.12)]",
        className
      )}
    >
      <div className="border-b border-border/80 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">Dominios encontrados</h2>
        {meta ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground/90">Query:</span> {meta.query}
            {meta.state || meta.city ? (
              <>
                {" "}
                · {meta.country}
                {meta.state ? ` / ${meta.state}` : ""}
                {meta.city ? ` · ${meta.city}` : ""}
              </>
            ) : (
              <> · {meta.country}</>
            )}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Elige una consulta guardada y busca con Hunter.
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Buscando en Hunter Discover…</p>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
            <Globe className="h-10 w-10 opacity-40" aria-hidden />
            <p className="text-sm">Los dominios aparecerán aquí tras la búsqueda.</p>
          </div>
        ) : companies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin dominios en esta respuesta. Prueba otra query, desactiva la deduplicación o revisa tu plan Hunter.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground tabular-nums">
              {returned} dominio{returned === 1 ? "" : "s"}
              {tavilyAnalyzedDomains && tavilyAnalyzedDomains.size > 0 ? (
                <>
                  {" "}
                  · {tavilyAnalyzedDomains.size} analizado
                  {tavilyAnalyzedDomains.size === 1 ? "" : "s"} con Tavily
                </>
              ) : null}
            </p>

            {icpVersionId ? (
              <div className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/8 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground">Guardar en Leads</p>
                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                  Incluye Hunter, Tavily e ICP cuando estén disponibles.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={saveStats.selectable === 0 || saveToHunterMutation.isPending}
                    onClick={() => {
                      const missing = companies
                        .map((c) => normalizeDomain(c.domain))
                        .filter((d) => d && !savedDomainSet.has(d));
                      setSaveSelection(new Set(missing));
                    }}
                    className={btnHunterSave}
                  >
                    Seleccionar pendientes ({saveStats.selectable})
                  </button>
                  <button
                    type="button"
                    disabled={saveStats.selected === 0 || saveToHunterMutation.isPending}
                    onClick={() => saveDomains([...saveSelection])}
                    className={btnHunterSave}
                  >
                    {saveToHunterMutation.isPending
                      ? "Guardando…"
                      : `Guardar seleccionados (${saveStats.selected})`}
                  </button>
                  <button
                    type="button"
                    disabled={saveStats.total === 0 || saveToHunterMutation.isPending}
                    onClick={() => saveDomains(companies.map((c) => c.domain))}
                    className={btnHunterSave}
                  >
                    Guardar todos ({saveStats.total})
                  </button>
                  <Link
                    href="/hunter-leads"
                    className="text-[0.7rem] text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
                  >
                    Ver Leads →
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="rounded-lg border border-border/70 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {icpVersionId ? (
                      <TableHead className="w-10">
                        <span className="sr-only">Seleccionar</span>
                      </TableHead>
                    ) : null}
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="w-10">
                      <span className="sr-only">Vista previa</span>
                    </TableHead>
                    {icpVersionId ? (
                      <TableHead className="w-10">
                        <span className="sr-only">Guardar</span>
                      </TableHead>
                    ) : null}
                    <TableHead>Dominio</TableHead>
                    <TableHead className="w-28">Tavily</TableHead>
                    <TableHead>Organización</TableHead>
                    <TableHead className="w-24 text-right">Emails*</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageCompanies.map((co, i) => {
                    const rowNumber = startIndex + i + 1;
                    const siteUrl = `https://${co.domain}`;
                    const total = co.emailsCount?.total;
                    const nd = normalizeDomain(co.domain);
                    const isSaved = nd ? savedDomainSet.has(nd) : false;
                    const analyzed = isTavilyAnalyzed(co.domain, tavilyAnalyzedDomains);
                    const running =
                      tavilyRunningDomain != null &&
                      (normalizeDomain(tavilyRunningDomain) || tavilyRunningDomain) ===
                        (normalizeDomain(co.domain) || co.domain);
                    return (
                      <TableRow
                        key={co.domain}
                        className={cn(
                          analyzed && "bg-[#5B6EE1]/5",
                          isSaved && "bg-emerald-500/5"
                        )}
                      >
                        {icpVersionId ? (
                          <TableCell className="align-middle">
                            {isSaved ? (
                              <span
                                className="block max-w-[4.5rem] text-center text-[0.55rem] font-semibold uppercase leading-tight text-emerald-600 dark:text-emerald-400"
                                title="Ya está en Leads para este ICP"
                              >
                                Guardado
                              </span>
                            ) : (
                              <Checkbox
                                checked={nd ? saveSelection.has(nd) : false}
                                onCheckedChange={() => toggleSaveDomain(co.domain)}
                                disabled={saveToHunterMutation.isPending || !nd}
                                className="border-emerald-500/50"
                                aria-label={`Seleccionar ${co.domain} para Leads`}
                              />
                            )}
                          </TableCell>
                        ) : null}
                        <TableCell className="text-muted-foreground tabular-nums">{rowNumber}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-[#B8C5FF]"
                            title="Vista previa del lead"
                            aria-label={`Vista previa de ${co.domain}`}
                            onClick={() => setPreviewDomain(co.domain)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        {icpVersionId ? (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/15 hover:text-emerald-500 dark:text-emerald-400"
                              title={
                                isSaved
                                  ? "Actualizar en Leads"
                                  : "Guardar en Leads"
                              }
                              aria-label={
                                isSaved
                                  ? `Actualizar ${co.domain} en Leads`
                                  : `Guardar ${co.domain} en Leads`
                              }
                              disabled={saveToHunterMutation.isPending}
                              onClick={() => saveDomains([co.domain])}
                            >
                              {nd && activeSaveDomains.has(nd) ? (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                              ) : (
                                <BookmarkPlus className="h-4 w-4" aria-hidden />
                              )}
                            </Button>
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <a
                            href={siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-sm text-primary hover:underline"
                          >
                            {co.domain}
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                          </a>
                        </TableCell>
                        <TableCell>
                          {running ? (
                            <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-[#B8C5FF]">
                              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                              Analizando…
                            </span>
                          ) : analyzed ? (
                            <span
                              className="inline-flex items-center gap-1 rounded-full border border-[#5B6EE1]/45 bg-[#5B6EE1]/12 px-2 py-0.5 text-[0.65rem] font-medium text-[#C5CEFF]"
                              title="Sitio analizado con Tavily"
                            >
                              <Check className="h-3 w-3 shrink-0" aria-hidden />
                              Analizado
                            </span>
                          ) : (
                            <span className="text-[0.65rem] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#E84E1D]" aria-hidden />
                            {co.organization?.trim() || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                          {total != null ? total : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {companies.length > ITEMS_PER_PAGE ? (
              <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-muted-foreground tabular-nums">
                  Página {currentPage} de {totalPages} · Total: {companies.length} dominio
                  {companies.length === 1 ? "" : "s"}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 gap-1 border-border text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 gap-1 border-border text-xs"
                  >
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Card>

    <LeadEngineV2LeadPreviewDialog
      company={previewCompany}
      searchMeta={meta}
      enrichment={previewEnrichment}
      tavilyConfig={tavilyConfig}
      tavilyRunningDomain={tavilyRunningDomain}
      icpVersionId={icpVersionId}
      icpMatch={previewIcpMatch}
      onIcpMatch={onIcpMatch}
      open={previewDomain != null}
      onClose={() => setPreviewDomain(null)}
      onDomainEnriched={onDomainEnriched}
      onFeedStart={onTavilyFeedStart}
      onFeedEnd={onTavilyFeedEnd}
    />
    </>
  );
}
