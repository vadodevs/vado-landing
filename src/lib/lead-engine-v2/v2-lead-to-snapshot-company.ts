import type { HunterSearchCompany } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import { buildV2HunterLeadPreviewModel } from "@/lib/lead-engine-v2/build-v2-hunter-lead-preview";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import type { V2IcpMatchResult } from "@/lib/lead-engine-v2/v2-icp-match-types";
import type { HunterSearchSnapshotSaveInput } from "@/lib/lead-engine/save-hunter-leads";

function hasValidEmail(email?: string | null): boolean {
  return Boolean(email?.trim().includes("@"));
}

function buildDescription(
  base: string | null | undefined,
  icpMatch?: V2IcpMatchResult | null
): string | null {
  const parts: string[] = [];
  if (base?.trim()) parts.push(base.trim());
  if (icpMatch?.summary?.trim()) {
    parts.push(`ICP (${icpMatch.score}/10): ${icpMatch.summary.trim()}`);
  }
  if (parts.length === 0) return null;
  return parts.join("\n\n").slice(0, 8000);
}

/** Convierte un dominio V2 (Hunter + Tavily + ICP) al payload de `saveSearchSnapshot`. */
export function v2LeadToSnapshotCompany(input: {
  company: HunterSearchCompany;
  searchMeta?: LeadEngineV2SearchMeta | null;
  enrichment?: TavilyV2StoredEnrichment | null;
  icpMatch?: V2IcpMatchResult | null;
}): HunterSearchSnapshotSaveInput["companies"][number] {
  const preview = buildV2HunterLeadPreviewModel({
    company: input.company,
    searchMeta: input.searchMeta,
    enrichment: input.enrichment,
  });

  const icpScore =
    input.icpMatch != null && Number.isFinite(input.icpMatch.score)
      ? input.icpMatch.score
      : preview.icpScore ?? undefined;

  const emailsCount =
    preview.emailsPersonal != null ||
    preview.emailsGeneric != null ||
    preview.emailsTotal != null
      ? {
          personal: preview.emailsPersonal ?? undefined,
          generic: preview.emailsGeneric ?? undefined,
          total: preview.emailsTotal ?? undefined,
        }
      : input.company.emailsCount;

  const contacts = preview.contacts
    .filter((c) => hasValidEmail(c.email))
    .map((c) => ({
      email: c.email.trim(),
      firstName: c.firstName ?? null,
      lastName: c.lastName ?? null,
      position: c.position ?? null,
      phone: c.phone ?? null,
      seniority: c.seniority ?? null,
      department: c.department ?? null,
      type: null,
      confidence: c.confidence ?? null,
      verificationStatus: null,
    }));

  return {
    domain: preview.domain,
    organization: preview.organization ?? preview.agencyName ?? null,
    agencyName: preview.agencyName ?? preview.organization ?? null,
    emailsCount: emailsCount ?? null,
    contacts,
    icpScore,
    description: buildDescription(preview.description, input.icpMatch),
    phone: preview.phone,
    phoneSource: preview.phoneSource,
    estado: preview.estado,
    especialidad: preview.especialidad,
    primaryContactName: preview.primaryContactName,
    primaryContactTitle: preview.primaryContactTitle,
    primaryEmail: preview.primaryEmail,
    secondaryContactName: preview.secondaryContactName,
    secondaryContactTitle: preview.secondaryContactTitle,
    secondaryEmail: preview.secondaryEmail,
    ...(preview.enrichmentMeta != null && typeof preview.enrichmentMeta === "object"
      ? { enrichmentMeta: preview.enrichmentMeta as Record<string, unknown> }
      : {}),
  };
}
