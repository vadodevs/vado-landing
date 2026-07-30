import type { EnrichmentCascadeMeta, TavilyV2StoredEnrichment } from '@/lib/lead-engine-v2/tavily-enrichment-types';
import type { TavilyV2Config } from '@/lib/lead-engine-v2/tavily-v2-options';
import { mockEnrichDomain } from '@/lib/lead-engine-v2/mock-client-api';

export type FetchTavilyEnrichmentResult =
  | { ok: true; enrichment: TavilyV2StoredEnrichment; cascade?: EnrichmentCascadeMeta }
  | { ok: false; error: string };

export type HunterContactSeed = {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  phone?: string | null;
  seniority?: string | null;
  department?: string | null;
};

export type FetchTavilyEnrichmentOpts = {
  organization?: string | null;
  hunterContacts?: HunterContactSeed[] | null;
  cascade?: boolean;
};

export async function fetchTavilyEnrichmentForDomain(
  domain: string,
  config: TavilyV2Config,
  opts?: FetchTavilyEnrichmentOpts,
): Promise<FetchTavilyEnrichmentResult> {
  try {
    const enrichment = await mockEnrichDomain(domain, config, {
      organization: opts?.organization ?? null,
    });
    return { ok: true, enrichment, cascade: enrichment.cascade };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error al enriquecer' };
  }
}

export function formatCascadeToast(cascade?: EnrichmentCascadeMeta): string | null {
  if (!cascade) return null;
  if (cascade.usedTavilyFull) {
    return `Sitio/Hunter incompleto → Tavily (${cascade.decisionMakersFound} decisores)`;
  }
  if (cascade.usedTavilyPhone) {
    return `Sitio + tel. Tavily · ${cascade.decisionMakersFound} decisores`;
  }
  if (cascade.usedSite || cascade.usedHunter) {
    return `Sitio/Hunter · sin Tavily full · ${cascade.decisionMakersFound} decisores`;
  }
  return null;
}
