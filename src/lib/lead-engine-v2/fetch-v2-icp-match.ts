import type { V2IcpMatchResult, V2LeadIcpMatchInput } from '@/lib/lead-engine-v2/v2-icp-match-types';
import { mockIcpMatch } from '@/lib/lead-engine-v2/mock-client-api';

export type FetchV2IcpMatchResult =
  | { ok: true; match: V2IcpMatchResult }
  | { ok: false; error: string };

export async function fetchV2IcpMatch(
  icpVersionId: string,
  lead: V2LeadIcpMatchInput,
): Promise<FetchV2IcpMatchResult> {
  try {
    const match = await mockIcpMatch(icpVersionId, lead);
    return { ok: true, match };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al comparar ICP' };
  }
}
