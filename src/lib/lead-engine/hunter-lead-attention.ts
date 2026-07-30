export type HunterLeadManualAttention = {
  needsAttention: boolean;
  reasons: string[];
  label: string;
};

export function getHunterLeadManualAttention(lead: {
  especialidad?: string | null;
  description?: string | null;
  estado?: string | null;
  phone?: string | null;
  enrichmentMeta?: unknown;
}): HunterLeadManualAttention {
  const meta =
    lead.enrichmentMeta && typeof lead.enrichmentMeta === 'object'
      ? (lead.enrichmentMeta as { needsManualReview?: boolean; label?: string; reasons?: string[] })
      : null;

  if (meta?.needsManualReview) {
    return {
      needsAttention: true,
      reasons: meta.reasons ?? ['enrichment_incomplete'],
      label: meta.label ?? 'Requiere atención manual',
    };
  }

  return { needsAttention: false, reasons: [], label: '' };
}
