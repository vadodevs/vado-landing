import type { TavilyV2StoredEnrichment } from '@/lib/lead-engine-v2/tavily-enrichment-types';
import type { V2IcpMatchResult } from '@/lib/lead-engine-v2/v2-icp-match-types';
import {
  mockGetHistorySnapshot,
  mockLoadEnrichments,
  mockSaveEnrichment,
  mockSaveIcpMatch,
} from '@/lib/lead-engine-v2/mock-client-api';

const STORAGE_KEY = 'lead-engine-v2-active-session';

export type V2ActiveSession = {
  icpVersionId: string;
  searchRunId: string;
};

export function readV2ActiveSession(): V2ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as V2ActiveSession;
    if (parsed?.icpVersionId?.trim() && parsed?.searchRunId?.trim()) {
      return { icpVersionId: parsed.icpVersionId.trim(), searchRunId: parsed.searchRunId.trim() };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeV2ActiveSession(session: V2ActiveSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearV2ActiveSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export type V2PersistedDomainRow = {
  domain: string;
  enrichment: TavilyV2StoredEnrichment;
  icpMatch: V2IcpMatchResult | null;
};

export async function loadV2PersistedEnrichments(
  icpVersionId: string,
  searchRunId: string,
): Promise<V2PersistedDomainRow[]> {
  return mockLoadEnrichments(icpVersionId, searchRunId);
}

export async function saveV2DomainEnrichment(input: {
  icpVersionId: string;
  searchRunId: string;
  enrichment: TavilyV2StoredEnrichment;
}): Promise<void> {
  await mockSaveEnrichment(input);
}

export async function saveV2DomainIcpMatch(input: {
  icpVersionId: string;
  searchRunId: string;
  domain: string;
  icpMatch: V2IcpMatchResult;
}): Promise<void> {
  await mockSaveIcpMatch(input);
}

export async function fetchV2SearchSnapshot(
  icpVersionId: string,
  searchRunId: string,
): Promise<{ companies: unknown[]; meta: unknown; searchMeta: unknown }> {
  return mockGetHistorySnapshot(icpVersionId, searchRunId);
}
