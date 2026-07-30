import { ExternalLink } from 'lucide-react';
import type { HunterLeadDetailInput } from '@/components/hunter-leads/hunter-lead-detail-types';
import { LeadDetailDataSections } from '@/components/hunter-leads/lead-detail-data-sections';
import { getHunterLeadManualAttention } from '@/lib/lead-engine/hunter-lead-attention';

function siteUrl(domain: string) {
  const d = domain.trim().toLowerCase();
  if (!d) return '#';
  return d.startsWith('http://') || d.startsWith('https://') ? d : `https://${d}`;
}

type HunterLeadDetailContentProps = {
  lead: HunterLeadDetailInput;
  showLeadActions?: boolean;
  leadId?: string;
  icpVersionId?: string;
  notesSectionTitle?: string;
  notesSectionHint?: string;
};

/**
 * Vista de detalle usada por Lead Engine V2 preview.
 * (Acciones de lead guardado omitidas en vado-landing; la UI de datos es la misma.)
 */
export function HunterLeadDetailContent({
  lead,
  showLeadActions = false,
  leadId,
  notesSectionTitle = 'Ideas y notas',
  notesSectionHint = 'Texto libre del import (Markdown / MCP): hipótesis, próximos pasos, contexto comercial.',
}: HunterLeadDetailContentProps) {
  const agency = lead.agencyName || lead.organization || lead.domain;
  const manualAttention = getHunterLeadManualAttention(lead);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="space-y-4 border-b border-border pb-6">
        <div className="min-w-0 space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            {manualAttention?.needsAttention ? (
              <span
                className="inline-flex h-3 w-3 shrink-0 rounded-full bg-orange-400 shadow-[0_0_10px_2px_rgba(251,146,60,0.6)]"
                title={manualAttention.label}
                aria-label="Requiere atención manual"
              />
            ) : null}
            {agency}
          </h1>
          <p className="text-sm text-muted-foreground">
            <a
              href={siteUrl(lead.domain)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              {lead.domain}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </p>
          {manualAttention?.needsAttention ? (
            <p className="rounded-md border border-orange-500/35 bg-orange-500/10 px-2.5 py-1.5 text-xs text-orange-800 dark:text-orange-200">
              <span className="font-medium">Atención manual: </span>
              {manualAttention.label.replace(/^Requiere atención manual:\s*/i, '')}
            </p>
          ) : null}
        </div>
      </div>

      <LeadDetailDataSections
        lead={lead}
        agencyLabel={agency}
        showLeadActions={showLeadActions}
        leadId={leadId}
        notesSectionTitle={notesSectionTitle}
        notesSectionHint={notesSectionHint}
      />
    </div>
  );
}
