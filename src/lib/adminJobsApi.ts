import { getAdminAccessToken } from '@/lib/adminAuth';
import { htmlToPreviewPlain } from '@/lib/jobOverviewHtml';

/** Coincide con columnas varchar(255) típicas en adminvado. */
const MAX_VARCHAR255 = 255;

function clamp255(s: string): string {
  const t = s.trim();
  return t.length <= MAX_VARCHAR255 ? t : t.slice(0, MAX_VARCHAR255);
}

/** Resumen corto para el API; el HTML completo va en `description`. */
function apiSummaryFromOverviewHtml(overview: string): string {
  return htmlToPreviewPlain(overview, MAX_VARCHAR255);
}

export type JobStatus = 'activa' | 'pausada' | 'borrador';

export type JobOfferRecord = {
  id: string;
  titulo: string;
  ubicacion: string;
  industria: string;
  overview: string;
  status: JobStatus;
  createdAt: string;
  /** ISO; null si no se ha fijado (se usa creada + 30 días en el cliente) */
  expiresAt: string | null;
  applicationsCount: number;
};

export type CreateJobOfferInput = Omit<JobOfferRecord, 'id' | 'createdAt' | 'applicationsCount' | 'expiresAt'> & {
  expiresAt?: string | null;
};
export type UpdateJobOfferInput = {
  titulo: string;
  overview: string;
  ubicacion: string;
  industria: string;
  expiresAt?: string | null;
};
export type JobApplicant = {
  id: string;
  jobId: string;
  userId: string;
  nombre: string;
  email: string;
  status: string;
  createdAt: string;
  coverLetter: string;
  desiredSalary: string;
};

const ADMIN_JOBS_PATH = '/talent/jobs';
const PUBLIC_JOBS_PATH = '/jobs';

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : '';
}

function toStatus(v: unknown): JobStatus {
  const x = str(v).toLowerCase();
  if (x === 'on hold' || x === 'paused' || x === 'pausada') {
    return 'pausada';
  }
  if (x === 'draft') {
    return 'borrador';
  }
  if (x === 'posted' || x === 'activa') {
    return 'activa';
  }
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
    createdRaw !== '' && Number.isFinite(Date.parse(createdRaw))
      ? createdRaw
      : new Date().toISOString();
  const expRaw = str(x.expiresAt ?? (x as Record<string, unknown>).expires_at);
  const expParsed = expRaw ? Date.parse(expRaw) : NaN;
  const expiresAt = Number.isFinite(expParsed) ? new Date(expParsed).toISOString() : null;
  return {
    id,
    titulo,
    ubicacion: str(x.ubicacion ?? x.location),
    industria: str(x.industria ?? x.industry),
    /** `description` tiene el HTML completo (Tiptap); `summary` es solo un extracto. */
    overview: str((x as Record<string, unknown>).description ?? x.overview ?? x.summary),
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

export async function fetchJobOffers(apiBase: string): Promise<JobOfferRecord[]> {
  const base = apiBase.replace(/\/$/, '');
  const token = getAdminAccessToken();
  const options = token
    ? [
        { url: `${base}${ADMIN_JOBS_PATH}`, headers: { Authorization: `Bearer ${token}` } },
        { url: `${base}${PUBLIC_JOBS_PATH}`, headers: undefined },
      ]
    : [{ url: `${base}${PUBLIC_JOBS_PATH}`, headers: undefined }];
  for (const opt of options) {
    try {
      const res = await fetch(opt.url, { headers: opt.headers });
      if (!res.ok) continue;
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
      // try fallback
    }
  }
  return [];
}

export async function createJobOffer(apiBase: string, input: CreateJobOfferInput): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${ADMIN_JOBS_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

export async function updateJobOffer(
  apiBase: string,
  id: string,
  input: UpdateJobOfferInput,
): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${ADMIN_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

export async function setJobOfferStatus(
  apiBase: string,
  id: string,
  status: JobStatus,
): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${ADMIN_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: status === 'activa' ? 'Posted' : 'On Hold' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteJobOffer(apiBase: string, id: string): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${ADMIN_JOBS_PATH}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchJobApplicants(apiBase: string, jobId: string): Promise<JobApplicant[]> {
  const token = getAdminAccessToken();
  if (!token) return [];
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(
      `${base}/talent/applications?jobId=${encodeURIComponent(jobId)}&page=1&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: unknown[] };
    const rows = Array.isArray(data?.data) ? data.data : [];
    const out: JobApplicant[] = [];
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const x = row as Record<string, unknown>;
      const user =
        x.profile && typeof x.profile === 'object'
          ? ((x.profile as Record<string, unknown>).user as Record<string, unknown> | undefined)
          : undefined;
      const profile =
        x.profile && typeof x.profile === 'object'
          ? (x.profile as Record<string, unknown>)
          : undefined;
      const name = `${str(user?.firstName)} ${str(user?.lastName)}`.trim();
      out.push({
        id: str(x.id),
        jobId: str(x.jobId),
        userId: str(profile?.userId ?? user?.id),
        nombre: name || 'Sin nombre',
        email: str(user?.email) || '—',
        status: str(x.status) || 'Applied',
        createdAt: str(x.createdAt) || '',
        coverLetter: str(x.coverLetter),
        desiredSalary: str(x.desiredSalary),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function updateJobApplicantStatus(
  apiBase: string,
  applicationId: string,
  jobId: string,
  userId: string,
  status:
    | 'Applied'
    | 'Short Listed'
    | 'TPS Requested'
    | 'Verified'
    | 'Client Proposed'
    | 'Accepted'
    | 'Rejected'
    | 'Withdrawn'
    | 'Mismatched',
): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/talent/applications/${encodeURIComponent(applicationId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId, userId, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
