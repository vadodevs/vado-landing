import type { HunterSearchCompany, HunterSearchResponse } from '@/components/lead-engine/hunter-types';
import type { LeadEngineV2SearchMeta } from '@/components/lead-engine-v2/LeadEngineV2SearchCard';
import type { TavilyV2StoredEnrichment } from '@/lib/lead-engine-v2/tavily-enrichment-types';
import type { V2IcpMatchResult, V2LeadIcpMatchInput } from '@/lib/lead-engine-v2/v2-icp-match-types';
import type { LeadEngineV2SearchHistoryListItem } from '@/lib/lead-engine-v2/v2-search-history-types';
import type { TavilyV2Config } from '@/lib/lead-engine-v2/tavily-v2-options';
import { normalizeDomain } from '@/lib/hunter/client';

const MOCK_COMPANIES: HunterSearchCompany[] = [
  {
    domain: 'acme-software.mx',
    organization: 'Acme Software',
    emailsCount: { total: 2, personal: 2, generic: 0 },
    contacts: [
      {
        email: 'laura@acme-software.mx',
        firstName: 'Laura',
        lastName: 'Méndez',
        position: 'CTO',
        type: 'personal',
        confidence: 92,
        verificationStatus: 'valid',
        phone: '+52 55 1000 0001',
        seniority: 'executive',
        department: 'executive',
      },
      {
        email: 'diego@acme-software.mx',
        firstName: 'Diego',
        lastName: 'Ruiz',
        position: 'VP Engineering',
        type: 'personal',
        confidence: 88,
        verificationStatus: 'valid',
        phone: null,
        seniority: 'executive',
        department: 'engineering',
      },
    ],
  },
  {
    domain: 'nortech.io',
    organization: 'Nortech',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'sofia@nortech.io',
        firstName: 'Sofía',
        lastName: 'Vargas',
        position: 'Head of Product',
        type: 'personal',
        confidence: 90,
        verificationStatus: 'valid',
        phone: '+52 81 2000 0002',
        seniority: 'executive',
        department: 'product',
      },
    ],
  },
  {
    domain: 'orbitlabs.com',
    organization: 'Orbit Labs',
    emailsCount: { total: 2, personal: 2, generic: 0 },
    contacts: [
      {
        email: 'carlos@orbitlabs.com',
        firstName: 'Carlos',
        lastName: 'Ibarra',
        position: 'CEO',
        type: 'personal',
        confidence: 95,
        verificationStatus: 'valid',
        phone: null,
        seniority: 'executive',
        department: 'executive',
      },
      {
        email: 'ana@orbitlabs.com',
        firstName: 'Ana',
        lastName: 'Paredes',
        position: 'COO',
        type: 'personal',
        confidence: 87,
        verificationStatus: 'valid',
        phone: '+52 33 3000 0003',
        seniority: 'executive',
        department: 'operations',
      },
    ],
  },
  {
    domain: 'pixelcraft.mx',
    organization: 'Pixelcraft',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'miguel@pixelcraft.mx',
        firstName: 'Miguel',
        lastName: 'Torres',
        position: 'Engineering Manager',
        type: 'personal',
        confidence: 84,
        verificationStatus: 'valid',
        phone: null,
        seniority: 'senior',
        department: 'engineering',
      },
    ],
  },
  {
    domain: 'brightstack.dev',
    organization: 'Brightstack',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'elena@brightstack.dev',
        firstName: 'Elena',
        lastName: 'Soto',
        position: 'Founder',
        type: 'personal',
        confidence: 93,
        verificationStatus: 'valid',
        phone: '+52 55 4000 0004',
        seniority: 'executive',
        department: 'executive',
      },
    ],
  },
  {
    domain: 'cloudnest.ai',
    organization: 'Cloudnest AI',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'ricardo@cloudnest.ai',
        firstName: 'Ricardo',
        lastName: 'Nava',
        position: 'VP Sales',
        type: 'personal',
        confidence: 86,
        verificationStatus: 'valid',
        phone: null,
        seniority: 'executive',
        department: 'sales',
      },
    ],
  },
  {
    domain: 'dataloom.co',
    organization: 'Dataloom',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'patricia@dataloom.co',
        firstName: 'Patricia',
        lastName: 'León',
        position: 'Director of Ops',
        type: 'personal',
        confidence: 85,
        verificationStatus: 'valid',
        phone: null,
        seniority: 'executive',
        department: 'operations',
      },
    ],
  },
  {
    domain: 'helixware.com',
    organization: 'Helixware',
    emailsCount: { total: 1, personal: 1, generic: 0 },
    contacts: [
      {
        email: 'jorge@helixware.com',
        firstName: 'Jorge',
        lastName: 'Campos',
        position: 'CTO',
        type: 'personal',
        confidence: 91,
        verificationStatus: 'valid',
        phone: '+52 55 5000 0005',
        seniority: 'executive',
        department: 'engineering',
      },
    ],
  },
];

type HistoryRun = {
  id: string;
  createdAt: string;
  companyCount: number;
  query: string;
  country: string;
  state: string | null;
  city: string | null;
  limit: number;
  excludeAlreadySeen: boolean;
  companies: HunterSearchCompany[];
  meta: HunterSearchResponse['meta'];
  searchMeta: LeadEngineV2SearchMeta;
};

type EnrichmentRow = {
  domain: string;
  enrichment: TavilyV2StoredEnrichment;
  icpMatch: V2IcpMatchResult | null;
};

type LibraryQuery = {
  id: string;
  query: string;
  queryKey: string;
  rationale: string | null;
  usedAt: Date | string | null;
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const historyByIcp = new Map<string, HistoryRun[]>();
const enrichmentsByRun = new Map<string, EnrichmentRow[]>();
const libraryByIcp = new Map<string, LibraryQuery[]>();
const savedDomainsByIcp = new Map<string, Set<string>>();

function seedLibrary(icpVersionId: string): LibraryQuery[] {
  const existing = libraryByIcp.get(icpVersionId);
  if (existing) return existing;
  const seed: LibraryQuery[] = [
    {
      id: 'q1',
      query: 'software companies mexico city hiring engineers',
      queryKey: 'software companies mexico city hiring engineers',
      rationale: 'Captura SaaS con demanda de talento técnico.',
      usedAt: null,
    },
    {
      id: 'q2',
      query: 'B2B SaaS startups Mexico Series A',
      queryKey: 'b2b saas startups mexico series a',
      rationale: 'Startups con presupuesto reciente.',
      usedAt: null,
    },
    {
      id: 'q3',
      query: 'fintech mexico product technology leadership',
      queryKey: 'fintech mexico product technology leadership',
      rationale: 'Fintech con liderazgo de producto/tech.',
      usedAt: '2026-07-20T12:00:00.000Z',
    },
    {
      id: 'q4',
      query: 'custom software development agencies mexico',
      queryKey: 'custom software development agencies mexico',
      rationale: 'Agencias que podrían partner o competir.',
      usedAt: null,
    },
  ];
  libraryByIcp.set(icpVersionId, seed);
  return seed;
}

function runKey(icpVersionId: string, searchRunId: string) {
  return `${icpVersionId}::${searchRunId}`;
}

export async function mockSuggestIcpQueries(icpVersionId: string) {
  await delay(800);
  const lib = seedLibrary(icpVersionId);
  const variants = [
    {
      query: 'enterprise software mexico CTOs looking for nearshore',
      rationale: 'ICP: nearshore / staff aug.',
    },
    {
      query: 'healthcare SaaS mexico digital transformation',
      rationale: 'Vertical health + digital.',
    },
    {
      query: 'logistics tech companies mexico operations directors',
      rationale: 'Ops decision makers.',
    },
  ];
  let saved = 0;
  for (const v of variants) {
    const key = v.query.toLowerCase();
    if (lib.some((r) => r.queryKey === key)) continue;
    lib.unshift({
      id: `gen-${Date.now()}-${saved}`,
      query: v.query,
      queryKey: key,
      rationale: v.rationale,
      usedAt: null,
    });
    saved += 1;
  }
  libraryByIcp.set(icpVersionId, lib);
  return {
    kind: 'suggestions' as const,
    variants,
    suggestionsMeta: {
      savedToLibrary: saved,
      skippedAsDuplicate: variants.length - saved,
      librarySize: lib.length,
    },
  };
}

export function mockListDiscoverQueries(icpVersionId: string) {
  return seedLibrary(icpVersionId);
}

export function mockMarkDiscoverQueryUsed(icpVersionId: string, id: string) {
  const lib = seedLibrary(icpVersionId);
  const row = lib.find((r) => r.id === id);
  if (row) row.usedAt = new Date().toISOString();
  return row ?? null;
}

export async function mockHunterSearch(input: {
  icpVersionId: string;
  query: string;
  country: string;
  state?: string;
  city?: string;
  limit?: number;
  excludeAlreadySeen?: boolean;
}): Promise<HunterSearchResponse & { snapshotId?: string; historySaveError?: string }> {
  await delay(1000);
  const limit = Math.min(Math.max(input.limit ?? 8, 1), MOCK_COMPANIES.length);
  const companies = MOCK_COMPANIES.slice(0, limit);
  const searchMeta: LeadEngineV2SearchMeta = {
    query: input.query,
    country: input.country,
    state: input.state,
    city: input.city,
  };
  const meta: HunterSearchResponse['meta'] = {
    discover: { query: input.query },
    returned: companies.length,
    excludeAlreadySeen: input.excludeAlreadySeen !== false,
  };
  const snapshotId = `run-${Date.now()}`;
  const list = historyByIcp.get(input.icpVersionId) ?? [];
  list.unshift({
    id: snapshotId,
    query: input.query,
    country: input.country,
    state: input.state ?? null,
    city: input.city ?? null,
    createdAt: new Date().toISOString(),
    companyCount: companies.length,
    limit: limit,
    excludeAlreadySeen: input.excludeAlreadySeen !== false,
    companies,
    meta,
    searchMeta,
  });
  historyByIcp.set(input.icpVersionId, list);
  return { companies, meta, snapshotId };
}

export async function mockListHistory(icpVersionId: string): Promise<LeadEngineV2SearchHistoryListItem[]> {
  await delay(200);
  return (historyByIcp.get(icpVersionId) ?? []).map(
    ({ id, query, country, state, city, createdAt, companyCount, limit, excludeAlreadySeen }) => ({
      id,
      query,
      country,
      state,
      city,
      createdAt,
      companyCount,
      limit,
      excludeAlreadySeen,
    }),
  );
}

export async function mockGetHistorySnapshot(icpVersionId: string, runId: string) {
  await delay(250);
  const run = (historyByIcp.get(icpVersionId) ?? []).find((r) => r.id === runId);
  if (!run) throw new Error('Búsqueda no encontrada.');
  return {
    companies: run.companies,
    meta: run.meta,
    searchMeta: run.searchMeta,
  };
}

export async function mockDeleteHistory(icpVersionId: string, runId: string) {
  await delay(150);
  const list = historyByIcp.get(icpVersionId) ?? [];
  historyByIcp.set(
    icpVersionId,
    list.filter((r) => r.id !== runId),
  );
  enrichmentsByRun.delete(runKey(icpVersionId, runId));
}

export async function mockEnrichDomain(
  domain: string,
  _config: TavilyV2Config,
  opts?: { organization?: string | null },
): Promise<TavilyV2StoredEnrichment> {
  await delay(450);
  const key = normalizeDomain(domain) || domain;
  const company = MOCK_COMPANIES.find((c) => c.domain === key);
  const org = opts?.organization ?? company?.organization ?? key;
  return {
    domain: key,
    operation: 'crawl',
    analyzedAt: new Date().toISOString(),
    crawlPayload: {
      domain: key,
      homepageUrl: `https://${key}`,
      visitedUrls: [`https://${key}`],
      pages: [{ url: `https://${key}`, title: org ?? key, text: `${org} — resumen mock del sitio.` }],
      consolidated: `${org} ofrece software B2B y servicios de tecnología en México.`,
      extractedEmails: (company?.contacts ?? []).map((c) => c.email).filter(Boolean),
      extractedPhones: (company?.contacts ?? []).map((c) => c.phone).filter((p): p is string => Boolean(p)),
      keywords: ['saas', 'software', 'mexico'],
    },
    researchContent: `${org}: empresa de software con señales de crecimiento (mock Tavily).`,
    structured: {
      companySummary: `${org} desarrolla y vende software B2B. Equipo técnico con liderazgo en producto e ingeniería.`,
      specialty: 'Software / SaaS',
      servicesOffering: 'Producto SaaS, integraciones, consultoría',
      region: 'México',
      city: 'Ciudad de México',
      country: 'MX',
      phones: (company?.contacts ?? []).map((c) => c.phone).filter((p): p is string => Boolean(p)),
      emails: (company?.contacts ?? []).map((c) => c.email),
      linkedinCompanyUrl: `https://www.linkedin.com/company/${key.split('.')[0]}`,
      contacts: (company?.contacts ?? []).map((c) => ({
        name: [c.firstName, c.lastName].filter(Boolean).join(' '),
        email: c.email,
        title: c.position ?? undefined,
        phone: c.phone ?? undefined,
        seniority: c.seniority ?? undefined,
      })),
      commercialNotes: 'Mock enrichment para Auto Search / Lead Engine V2.',
    },
    cascade: {
      usedHunter: true,
      usedSite: true,
      usedTavilyPhone: false,
      usedTavilyFull: true,
      decisionMakersFound: company?.contacts?.length ?? 0,
    },
  };
}

export async function mockIcpMatch(
  _icpVersionId: string,
  lead: V2LeadIcpMatchInput,
): Promise<V2IcpMatchResult> {
  await delay(500);
  const hash = (lead.domain || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = 4 + (hash % 6);
  return {
    score,
    summary:
      score >= 7
        ? 'Fuerte alineación con el ICP activo (mock).'
        : score >= 5
          ? 'Alineación media; revisar seniority y vertical (mock).'
          : 'Baja afinidad aparente con el ICP (mock).',
    icpName: 'SaaS B2B Mid-Market MX',
    computedAt: new Date().toISOString(),
  };
}

export async function mockLoadEnrichments(icpVersionId: string, searchRunId: string) {
  await delay(100);
  return enrichmentsByRun.get(runKey(icpVersionId, searchRunId)) ?? [];
}

export async function mockSaveEnrichment(input: {
  icpVersionId: string;
  searchRunId: string;
  enrichment: TavilyV2StoredEnrichment;
}) {
  await delay(80);
  const key = runKey(input.icpVersionId, input.searchRunId);
  const rows = enrichmentsByRun.get(key) ?? [];
  const domain = normalizeDomain(input.enrichment.domain) || input.enrichment.domain;
  const idx = rows.findIndex((r) => r.domain === domain);
  const next: EnrichmentRow = {
    domain,
    enrichment: { ...input.enrichment, domain },
    icpMatch: idx >= 0 ? rows[idx]!.icpMatch : null,
  };
  if (idx >= 0) rows[idx] = next;
  else rows.push(next);
  enrichmentsByRun.set(key, rows);
}

export async function mockSaveIcpMatch(input: {
  icpVersionId: string;
  searchRunId: string;
  domain: string;
  icpMatch: V2IcpMatchResult;
}) {
  await delay(80);
  const key = runKey(input.icpVersionId, input.searchRunId);
  const rows = enrichmentsByRun.get(key) ?? [];
  const domain = normalizeDomain(input.domain) || input.domain;
  const idx = rows.findIndex((r) => r.domain === domain);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx]!, icpMatch: input.icpMatch };
  } else {
    rows.push({
      domain,
      enrichment: {
        domain,
        operation: 'crawl',
        analyzedAt: new Date().toISOString(),
        crawlPayload: null,
      },
      icpMatch: input.icpMatch,
    });
  }
  enrichmentsByRun.set(key, rows);
}

export function mockSavedDomainsLookup(icpVersionId: string, domains: string[]) {
  const saved = savedDomainsByIcp.get(icpVersionId) ?? new Set();
  return {
    savedDomains: domains.filter((d) => saved.has(normalizeDomain(d) || d)),
  };
}

export function mockSaveSearchSnapshot(icpVersionId: string, domains: string[]) {
  const saved = savedDomainsByIcp.get(icpVersionId) ?? new Set();
  for (const d of domains) saved.add(normalizeDomain(d) || d);
  savedDomainsByIcp.set(icpVersionId, saved);
  return { savedDomains: domains.length };
}
