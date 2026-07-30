"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import {
  TAVILY_V2_DEFAULT_CONFIG,
  TAVILY_V2_EXTRACTION_GOALS,
  TAVILY_V2_OPERATIONS,
  buildTavilyInstructionsFromGoals,
  type TavilyV2Config,
  type TavilyV2ExtractionGoal,
  type TavilyV2Operation,
} from "@/lib/lead-engine-v2/tavily-v2-options";
import { normalizeDomain } from "@/lib/hunter/client";
import { fetchTavilyEnrichmentForDomain, formatCascadeToast } from "@/lib/lead-engine-v2/fetch-tavily-enrichment";
import { cn } from "@/lib/utils";

const TAVILY_INPUT =
  "h-10 border-[#5B6EE1]/30 bg-background/60 text-foreground shadow-inner placeholder:text-muted-foreground focus-visible:border-[#5B6EE1]/55 focus-visible:ring-2 focus-visible:ring-[#5B6EE1]/35";

export type LeadEngineV2DomainRow = {
  domain: string;
  organization: string | null;
  contacts?: Array<{
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    position?: string | null;
    phone?: string | null;
    seniority?: string | null;
    department?: string | null;
  }> | null;
};

type LeadEngineV2TavilyCardProps = {
  domains: LeadEngineV2DomainRow[];
  config: TavilyV2Config;
  onConfigChange: (next: TavilyV2Config) => void;
  /** False until Hunter has completed at least one search. */
  unlocked: boolean;
  hunterLoading?: boolean;
  analyzedDomains?: ReadonlySet<string>;
  onDomainAnalyzed?: (domain: string) => void;
  onDomainEnriched?: (enrichment: TavilyV2StoredEnrichment) => void;
  onRunningChange?: (running: boolean) => void;
  onRunningDomainChange?: (domain: string | null) => void;
  embedded?: boolean;
  className?: string;
};

function toggleGoal(goals: TavilyV2ExtractionGoal[], id: TavilyV2ExtractionGoal): TavilyV2ExtractionGoal[] {
  return goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id];
}

export function LeadEngineV2TavilyCard({
  domains,
  config,
  onConfigChange,
  unlocked,
  hunterLoading = false,
  analyzedDomains,
  onDomainAnalyzed,
  onDomainEnriched,
  onRunningChange,
  onRunningDomainChange,
  className,
}: LeadEngineV2TavilyCardProps) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; domain: string } | null>(
    null
  );
  const [customInstructions, setCustomInstructions] = useState(config.instructions);

  const operationMeta = useMemo(
    () => TAVILY_V2_OPERATIONS.find((o) => o.id === config.operation),
    [config.operation]
  );

  const patch = useCallback(
    (partial: Partial<TavilyV2Config>) => {
      onConfigChange({ ...config, ...partial });
    },
    [config, onConfigChange]
  );

  const syncInstructionsFromGoals = useCallback(() => {
    const built = buildTavilyInstructionsFromGoals(config.goals, customInstructions);
    setCustomInstructions(built);
    patch({ instructions: built });
  }, [config.goals, customInstructions, patch]);

  const showCrawlOpts = config.operation === "crawl";
  const showExtractOpts = config.operation === "extract" || config.operation === "crawl";
  const showResearchOpts = config.operation === "research";

  const runEnrichment = async () => {
    if (!unlocked) {
      toast.error("Primero ejecuta una búsqueda con Hunter.");
      return;
    }
    if (domains.length === 0) {
      toast.error("Hunter no devolvió dominios. Prueba otra consulta antes de Tavily.");
      return;
    }
    if (config.goals.length === 0) {
      toast.error("Elige al menos qué extraer de cada dominio.");
      return;
    }

    const pending = domains.filter((d) => {
      const key = normalizeDomain(d.domain) || d.domain;
      return !analyzedDomains?.has(key);
    });
    const toProcess = pending.length > 0 ? pending : domains;

    setRunning(true);
    onRunningChange?.(true);
    let successCount = 0;

    try {
      for (let i = 0; i < toProcess.length; i++) {
        const row = toProcess[i]!;
        setProgress({ current: i + 1, total: toProcess.length, domain: row.domain });
        onRunningDomainChange?.(row.domain);

        const result = await fetchTavilyEnrichmentForDomain(
          row.domain,
          {
            ...config,
            instructions: customInstructions.trim() || config.instructions,
          },
          {
            organization: row.organization,
            hunterContacts: row.contacts,
          }
        );

        if (!result.ok) {
          toast.error(`${row.domain}: ${result.error}`);
          continue;
        }

        onDomainEnriched?.(result.enrichment);
        onDomainAnalyzed?.(result.enrichment.domain);
        successCount += 1;
        const cascadeMsg = formatCascadeToast(result.cascade ?? result.enrichment.cascade);
        if (cascadeMsg && toProcess.length === 1) {
          toast.message(row.domain, { description: cascadeMsg });
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === toProcess.length
            ? `Enriquecido ${successCount} dominio(s) (cascada sitio → Tavily).`
            : `Enriquecido ${successCount}/${toProcess.length} dominio(s).`
        );
      } else if (toProcess.length > 0) {
        toast.error("Ningún dominio pudo enriquecerse.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    } finally {
      setRunning(false);
      setProgress(null);
      onRunningChange?.(false);
      onRunningDomainChange?.(null);
    }
  };

  const formLocked = !unlocked || hunterLoading;

  return (
    <Card
      className={cn(
        "gap-0 py-0 relative h-full border-[#5B6EE1]/30 bg-card/95 p-4 shadow-sm transition-[box-shadow,border-color,opacity] duration-500 sm:p-5",
        !unlocked && "border-border/60 opacity-[0.85]",
        unlocked && domains.length > 0 && !running && "border-[#5B6EE1]/45 shadow-[0_0_16px_rgba(91,110,225,0.12)]",
        running &&
          "border-[#5B6EE1]/55 shadow-[0_0_0_1px_rgba(91,110,225,0.35),0_0_22px_rgba(91,110,225,0.2)] ring-1 ring-[#5B6EE1]/40",
        className
      )}
    >
      {!unlocked ? (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-background/40 backdrop-blur-[1px]" aria-hidden />
      ) : null}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#5B6EE1]/35 bg-[#1B1B3A]/80 px-1">
          <Image
            src="/logos/tavily.svg"
            alt="Tavily"
            width={72}
            height={24}
            className="h-5 w-auto object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-medium uppercase tracking-wide text-[#8B9CF5]">Enriquecer</p>
          <h2 className="text-sm font-semibold text-foreground">Sitio → Tavily</h2>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {hunterLoading
          ? "Espera a que termine la búsqueda Hunter…"
          : !unlocked
            ? "Paso bloqueado — primero «Buscar dominios» con Hunter."
            : domains.length === 0
              ? "Hunter terminó sin dominios. Ajusta la consulta y vuelve a buscar."
              : (() => {
                  const analyzedCount = domains.filter((d) =>
                    analyzedDomains?.has(normalizeDomain(d.domain) || d.domain)
                  ).length;
                  const base = `${domains.length} dominio${domains.length === 1 ? "" : "s"}: primero sitio/Hunter (C-level, emails, tel, LinkedIn); Tavily solo si falta.`;
                  if (analyzedCount > 0) {
                    return `${base} ${analyzedCount} ya analizado${analyzedCount === 1 ? "" : "s"}.`;
                  }
                  return base;
                })()}
      </p>

      {progress ? (
        <p className="mb-3 text-xs font-medium text-[#B8C5FF]">
          Analizando {progress.domain} ({progress.current}/{progress.total}) · sitio primero…
        </p>
      ) : null}

      <div className={cn("gap-0 py-0 relative space-y-3", formLocked && "pointer-events-none select-none")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="tavily-op" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Operación API
            </label>
            <Select
              id="tavily-op"
              value={config.operation}
              onChange={(e) => patch({ operation: e.target.value as TavilyV2Operation })}
              options={TAVILY_V2_OPERATIONS.map((o) => ({
                value: o.id,
                label: `${o.label} · ${o.api}`,
              }))}
              className={cn("gap-0 py-0 w-full text-[0.8rem]", TAVILY_INPUT)}
              disabled={running || formLocked}
            />
            {operationMeta ? (
              <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground line-clamp-2">
                {operationMeta.description}
              </p>
            ) : null}
          </div>

          {showExtractOpts ? (
            <div>
              <label htmlFor="tavily-depth" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Profundidad de extracción
              </label>
              <Select
                id="tavily-depth"
                value={config.extractDepth}
                onChange={(e) =>
                  patch({ extractDepth: e.target.value as TavilyV2Config["extractDepth"] })
                }
                options={[
                  { value: "basic", label: "basic — más rápido" },
                  { value: "advanced", label: "advanced — JS y tablas" },
                ]}
                className={cn("gap-0 py-0 w-full text-[0.8rem]", TAVILY_INPUT)}
                disabled={running || formLocked}
              />
            </div>
          ) : null}

          {showCrawlOpts ? (
            <div>
              <label htmlFor="tavily-limit" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Crawl · máx. páginas
              </label>
              <Input
                id="tavily-limit"
                type="number"
                min={1}
                max={50}
                value={String(config.crawlMaxPages)}
                onChange={(e) =>
                  patch({ crawlMaxPages: Math.min(50, Math.max(1, parseInt(e.target.value, 10) || 12)) })
                }
                className={TAVILY_INPUT}
                disabled={running || formLocked}
              />
            </div>
          ) : null}

          {config.operation === "extract" ? (
            <div>
              <label htmlFor="tavily-chunks" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Extract · chunks
              </label>
              <Input
                id="tavily-chunks"
                type="number"
                min={1}
                max={5}
                value={String(config.extractChunksPerSource)}
                onChange={(e) =>
                  patch({
                    extractChunksPerSource: Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 3)),
                  })
                }
                className={TAVILY_INPUT}
                disabled={running || formLocked}
              />
            </div>
          ) : null}

          {showResearchOpts ? (
            <div className={showExtractOpts || showCrawlOpts ? "" : "sm:col-span-2"}>
              <label htmlFor="tavily-model" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Research · model
              </label>
              <Select
                id="tavily-model"
                value={config.researchModel}
                onChange={(e) =>
                  patch({ researchModel: e.target.value as TavilyV2Config["researchModel"] })
                }
                options={[
                  { value: "mini", label: "mini — rápido" },
                  { value: "pro", label: "pro — profundo" },
                  { value: "auto", label: "auto" },
                ]}
                className={cn("gap-0 py-0 w-full text-[0.8rem]", TAVILY_INPUT)}
                disabled={running || formLocked}
              />
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Qué extraer</span>
            <button
              type="button"
              className="text-[0.65rem] font-medium text-[#8B9CF5] hover:underline disabled:opacity-40"
              disabled={formLocked || running}
              onClick={syncInstructionsFromGoals}
            >
              Sync instrucciones
            </button>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {TAVILY_V2_EXTRACTION_GOALS.map((goal) => (
              <li key={goal.id}>
                <label className="flex cursor-pointer gap-2 rounded-md border border-border/50 bg-muted/10 px-2 py-1.5 hover:bg-muted/25">
                  <input
                    type="checkbox"
                    checked={config.goals.includes(goal.id)}
                    onChange={() => patch({ goals: toggleGoal(config.goals, goal.id) })}
                    className="mt-0.5 rounded border-[#5B6EE1]/50 accent-[#5B6EE1]"
                    disabled={running || formLocked}
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">{goal.label}</span>
                    <span className="block text-[0.62rem] leading-snug text-muted-foreground line-clamp-2">
                      {goal.hint}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="tavily-instr" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Instrucciones / foco
          </label>
          <textarea
            id="tavily-instr"
            value={customInstructions}
            onChange={(e) => {
              setCustomInstructions(e.target.value);
              patch({ instructions: e.target.value });
            }}
            rows={3}
            disabled={running || formLocked}
            placeholder="About, team, contact, leadership…"
            className={cn(
              "w-full resize-y rounded-md border px-3 py-2 text-xs leading-relaxed",
              TAVILY_INPUT
            )}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border/50 bg-muted/10 px-2.5 py-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={config.includeExternalSources}
              onChange={(e) => patch({ includeExternalSources: e.target.checked })}
              className="mt-0.5 rounded border-[#5B6EE1]/50 accent-[#5B6EE1]"
              disabled={running || formLocked}
            />
            <span>
              <span className="font-medium text-foreground/90">Fuentes externas</span>
              <span className="block text-[0.62rem]">
                LinkedIn, directorios, noticias (auto si pides decisores)
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-border/50 bg-muted/10 px-2.5 py-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={config.includeWebSearch}
              onChange={(e) => patch({ includeWebSearch: e.target.checked })}
              className="mt-0.5 rounded border-[#5B6EE1]/50 accent-[#5B6EE1]"
              disabled={running || formLocked || config.includeExternalSources}
            />
            <span>
              <span className="font-medium text-foreground/90">Search extra</span>
              <span className="block text-[0.62rem]">Solo dominio del lead</span>
            </span>
          </label>
        </div>

        <Button
          type="button"
          className="w-full gap-2 border border-[#5B6EE1]/50 bg-[#5B6EE1]/15 text-[#DDE2FF] hover:bg-[#5B6EE1]/25"
          disabled={formLocked || running || domains.length === 0 || config.goals.length === 0}
          onClick={() => void runEnrichment()}
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enriquecer (sitio → Tavily)
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

export { TAVILY_V2_DEFAULT_CONFIG };
