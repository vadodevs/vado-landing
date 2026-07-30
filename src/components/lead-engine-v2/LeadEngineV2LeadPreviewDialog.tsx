"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { LeadEngineV2LeadActionButtons } from "@/components/lead-engine-v2/LeadEngineV2LeadActionButtons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HunterSearchCompany } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import { LeadEngineV2TavilyFeedOverlay } from "@/components/lead-engine-v2/LeadEngineV2TavilyFeedOverlay";
import { HunterLeadDetailContent } from "@/components/hunter-leads/HunterLeadDetailContent";
import { normalizeDomain } from "@/lib/hunter/client";
import { buildV2HunterLeadPreviewModel } from "@/lib/lead-engine-v2/build-v2-hunter-lead-preview";
import { fetchTavilyEnrichmentForDomain, formatCascadeToast } from "@/lib/lead-engine-v2/fetch-tavily-enrichment";
import { fetchV2IcpMatch } from "@/lib/lead-engine-v2/fetch-v2-icp-match";
import { hunterLeadToIcpMatchInput } from "@/lib/lead-engine-v2/lead-to-icp-match-input";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import type { V2IcpMatchResult } from "@/lib/lead-engine-v2/v2-icp-match-types";
import type { TavilyV2Config } from "@/lib/lead-engine-v2/tavily-v2-options";
import { cn } from "@/lib/utils";

type LeadEngineV2LeadPreviewDialogProps = {
  company: HunterSearchCompany | null;
  searchMeta?: LeadEngineV2SearchMeta | null;
  enrichment?: TavilyV2StoredEnrichment | null;
  tavilyConfig: TavilyV2Config;
  tavilyRunningDomain?: string | null;
  icpVersionId?: string | null;
  icpMatch?: V2IcpMatchResult | null;
  onIcpMatch?: (domain: string, match: V2IcpMatchResult) => void;
  open: boolean;
  onClose: () => void;
  onDomainEnriched?: (enrichment: TavilyV2StoredEnrichment) => void;
  onFeedStart?: (domain: string) => void;
  onFeedEnd?: () => void;
};

export function LeadEngineV2LeadPreviewDialog({
  company,
  searchMeta,
  enrichment,
  tavilyConfig,
  tavilyRunningDomain,
  icpVersionId,
  icpMatch,
  onIcpMatch,
  open,
  onClose,
  onDomainEnriched,
  onFeedStart,
  onFeedEnd,
}: LeadEngineV2LeadPreviewDialogProps) {
  const [feeding, setFeeding] = useState(false);
  const [comparingIcp, setComparingIcp] = useState(false);

  const lead = useMemo(() => {
    if (!company) return null;
    const base = buildV2HunterLeadPreviewModel({ company, searchMeta, enrichment });
    if (!icpMatch) return base;
    return { ...base, icpScore: icpMatch.score };
  }, [company, searchMeta, enrichment, icpMatch]);

  const domainKey = company
    ? normalizeDomain(company.domain) || company.domain.trim().toLowerCase()
    : "";

  const isFeeding =
    feeding ||
    (tavilyRunningDomain != null &&
      (normalizeDomain(tavilyRunningDomain) || tavilyRunningDomain) === domainKey);

  const handleFeedWithTavily = useCallback(async () => {
    if (!company) return;
    if (tavilyConfig.goals.length === 0) {
      toast.error("Elige al menos qué extraer en la tarjeta Tavily (objetivos).");
      return;
    }
    if (isFeeding) return;

    setFeeding(true);
    onFeedStart?.(company.domain);

    try {
      const result = await fetchTavilyEnrichmentForDomain(company.domain, tavilyConfig, {
        organization: company.organization,
        hunterContacts: company.contacts,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      onDomainEnriched?.(result.enrichment);
      const cascadeMsg = formatCascadeToast(result.cascade ?? result.enrichment.cascade);
      toast.success(
        cascadeMsg
          ? `${company.domain}: ${cascadeMsg}`
          : `Datos de ${company.domain} enriquecidos.`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    } finally {
      setFeeding(false);
      onFeedEnd?.();
    }
  }, [company, tavilyConfig, isFeeding, onFeedStart, onDomainEnriched, onFeedEnd]);

  const handleCompareIcp = useCallback(async () => {
    if (!company || !lead || !icpVersionId?.trim()) {
      toast.error("Selecciona un ICP activo en la página.");
      return;
    }
    if (comparingIcp || isFeeding) return;

    if (!lead.description?.trim()) {
      toast.error("Primero enriquece con Tavily para tener un resumen y comparar con el ICP.");
      return;
    }

    setComparingIcp(true);
    try {
      const result = await fetchV2IcpMatch(icpVersionId, hunterLeadToIcpMatchInput(lead));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onIcpMatch?.(company.domain, result.match);
      toast.success(`Encaje ICP: ${result.match.score}/10`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    } finally {
      setComparingIcp(false);
    }
  }, [company, lead, icpVersionId, comparingIcp, isFeeding, onIcpMatch]);

  if (!company || !lead) return null;

  const agency = lead.agencyName || lead.organization || lead.domain;
  const hasTavilyData = Boolean(enrichment?.crawlPayload || enrichment?.researchContent);

  const scoreTone =
    icpMatch == null
      ? ""
      : icpMatch.score >= 7
        ? "text-emerald-300 border-emerald-500/40 bg-emerald-500/15"
        : icpMatch.score >= 4
          ? "text-amber-200 border-amber-500/40 bg-amber-500/15"
          : "text-rose-200 border-rose-500/40 bg-rose-500/15";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl",
          isFeeding &&
            "border-[#5B6EE1]/55 shadow-[0_0_0_1px_rgba(91,110,225,0.35),0_0_24px_rgba(91,110,225,0.2)] ring-1 ring-[#5B6EE1]/40"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Vista previa · {agency}</DialogTitle>
          <DialogDescription>Detalle del lead como en Leads.</DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#5B6EE1]/25 bg-[#5B6EE1]/8 px-4 py-2.5 sm:px-6">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              Vista previa ·{" "}
              <span className="font-mono text-[0.7rem] text-foreground/90">{company.domain}</span>
              {hasTavilyData ? (
                <span className="ml-2 text-[0.65rem] text-[#9EA8FF]">
                  ·{" "}
                  {enrichment?.cascade?.usedTavilyFull
                    ? "sitio + Tavily"
                    : enrichment?.cascade?.usedSite || enrichment?.cascade?.usedHunter
                      ? enrichment?.cascade?.usedTavilyPhone
                        ? "sitio + tel."
                        : "sitio/Hunter"
                      : "enriquecido"}
                </span>
              ) : null}
            </p>
            {icpMatch ? (
              <p className="text-[0.65rem] leading-snug text-muted-foreground">
                <span
                  className={cn(
                    "mr-2 inline-flex items-center rounded border px-1.5 py-0.5 font-semibold tabular-nums",
                    scoreTone
                  )}
                >
                  ICP {icpMatch.score}/10
                </span>
                <span className="text-foreground/85">{icpMatch.summary}</span>
              </p>
            ) : null}
          </div>
          <LeadEngineV2LeadActionButtons
            hasTavilyData={hasTavilyData}
            descriptionReady={Boolean(lead.description?.trim())}
            icpVersionReady={Boolean(icpVersionId?.trim())}
            comparingIcp={comparingIcp}
            feedingTavily={isFeeding}
            onCompareIcp={() => void handleCompareIcp()}
            onFeedWithTavily={() => void handleFeedWithTavily()}
          />
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 scrollbar-thin sm:px-6 sm:py-5">
          {isFeeding ? <LeadEngineV2TavilyFeedOverlay domain={company.domain} /> : null}
          <div
            className={cn(
              "transition-opacity duration-300",
              isFeeding && "pointer-events-none select-none opacity-[0.35]"
            )}
          >
            <HunterLeadDetailContent
              key={enrichment?.analyzedAt ?? "empty"}
              lead={lead}
              showLeadActions={false}
              notesSectionTitle="Resumen para ICP"
              notesSectionHint="Perfil factual breve en español extraído del sitio (Tavily), para comparar con tu ICP."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
