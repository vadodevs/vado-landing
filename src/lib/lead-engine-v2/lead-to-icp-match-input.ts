import type { HunterLeadDetailInput } from "@/components/hunter-leads/hunter-lead-detail-types";
import type { V2LeadIcpMatchInput } from "@/lib/lead-engine-v2/v2-icp-match-types";

export function hunterLeadToIcpMatchInput(lead: HunterLeadDetailInput): V2LeadIcpMatchInput {
  return {
    domain: lead.domain,
    description: lead.description ?? null,
    organization: lead.organization ?? lead.agencyName ?? null,
    especialidad: lead.especialidad ?? null,
    estado: lead.estado ?? null,
  };
}
