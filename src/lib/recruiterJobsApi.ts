import { getRecruiterAccessToken } from '@/lib/recruiterAuth';
import { htmlToPreviewPlain } from '@/lib/jobOverviewHtml';
import type {
  CreateJobOfferInput,
  JobOfferRecord,
  JobStatus,
  UpdateJobOfferInput,
} from '@/lib/adminJobsApi';

const RECRUITER_JOBS_PATH = '/recruiter/jobs';
const MAX_VARCHAR255 = 255;

function clamp255(s: string): string {
  const t = s.trim();
  return t.length <= MAX_VARCHAR255 ? t : t.slice(0, MAX_VARCHAR255);
}

function apiSummaryFromOverviewHtml(overview: string): string {
  return htmlToPreviewPlain(overview, MAX_VARCHAR255);
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : '';
}

function toStatus(v: unknown): JobStatus {
  const x = str(v).toLowerCase();
  if (x === 'on hold' || x === 'paused' || x === 'pausada') return 'pausada';
  if (x === 'draft') return 'borrador';
  return 'activa';
}

function mapRow(row: unknown): JobOfferRecord | null {
  if (!row || typeof row !== 'object') return null;
  const x = row as Record<string, unknown>;
  const id = str(x.id ?? x._id);
  const titulo = str(x.titulo ?? x.title);
  if (!id || !titulo) return null;
  const createdRaw = str(x.createdAt ?? x.created_at);
  const createdAt =
    createdRaw !== '' && Number.isFinite(Date.parse(createdRaw)) ? createdRaw : new Date().toISOString();
  const expRaw = str(x.expiresAt ?? x.expires_at);
  const expParsed = expRaw ? Date.parse(expRaw) : NaN;
  const expiresAt = Number.isFinite(expParsed) ? new Date(expParsed).toISOString() : null;
  return {
    id,
    titulo,
    ubicacion: str(x.ubicacion ?? x.location),
    industria: str(x.industria ?? x.industry),
    overview: str(x.description ?? x.overview ?? x.summary),
    status: toStatus(x.status),
    createdAt,
    expiresAt,
    applicationsCount: Number.isFinite(Number(x.applicationsCount)) ? Number(x.applicationsCount) : 0,
  };
}

type SearchResponse<T> = { data?: T[] };

function rowsFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as SearchResponse<unknown>).data)) {
    return (data as SearchResponse<unknown>).data ?? [];
  }
  return [];
}

function bearerHeaders(token: string, withJson = false): HeadersInit {
  if (withJson) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }
  return { Authorization: `Bearer ${token}` };
}

export async function fetchRecruiterJobOffers(apiBase: string): Promise<JobOfferRecord[]> {
  const token = getRecruiterAccessToken();
  if (!token) return [];
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${RECRUITER_JOBS_PATH}`, { headers: bearerHeaders(token) });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    const rows = rowsFromResponse(data);
    const out: JobOfferRecord[] = [];
    for (const row of rows) {
      const mapped = mapRow(row);
      if (mapped) out.push(mapped);
    }
    out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return out;
  } catch {
    return [];
  }
}

export async function createRecruiterJobOffer(apiBase: string, input: CreateJobOfferInput): Promise<boolean> {
  const token = getRecruiterAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${RECRUITER_JOBS_PATH}`, {
      method: 'POST',
      headers: bearerHeaders(token, true),
      body: JSON.stringify({
        title: clamp255(input.titulo),
        summary: apiSummaryFromOverviewHtml(input.overview),
        description: input.overview,
        location: clamp255(input.ubicacion),
        industry: clamp255(input.industria),
        status: input.status === 'activa' ? 'Posted' : 'On Hold',
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateRecruiterJobOffer(
  apiBase: string,
  id: string,
  input: UpdateJobOfferInput,
): Promise<boolean> {
  const token = getRecruiterAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${RECRUITER_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: bearerHeaders(token, true),
      body: JSON.stringify({
        title: clamp255(input.titulo),
        summary: apiSummaryFromOverviewHtml(input.overview),
        description: input.overview,
        location: clamp255(input.ubicacion),
        industry: clamp255(input.industria),
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function setRecruiterJobOfferStatus(
  apiBase: string,
  id: string,
  status: JobStatus,
): Promise<boolean> {
  const token = getRecruiterAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${RECRUITER_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: bearerHeaders(token, true),
      body: JSON.stringify({ status: status === 'activa' ? 'Posted' : 'On Hold' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteRecruiterJobOffer(apiBase: string, id: string): Promise<boolean> {
  const token = getRecruiterAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${RECRUITER_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}
