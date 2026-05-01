export type CompanyRef = { id?: string; name?: string } | null;

/** Fila de `GET /jobs` (ofertas publicadas, orden reciente en servidor). */
export type PublicJobListItem = {
  id: string;
  title: string;
  location: string | null;
  industry: string | null;
  summary: string | null;
  description: string | null;
  company?: CompanyRef;
  minSalary?: number | string | null;
  maxSalary?: number | string | null;
  isEvergreen?: boolean | null;
  /** Si el API expone fechas, se usan en la UI (p. ej. "actualizado hace X"). */
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Fecha de expiración explícita de la vacante, si la API la incluye. */
  expiresAt?: string | null;
  /** Solo en `GET /developer/jobs` (sesión). */
  applied?: boolean;
  /** Solo en `GET /developer/jobs` (sesión). */
  saved?: boolean;
};

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : '';
}

function mapDeveloperJobRow(row: unknown): PublicJobListItem | null {
  if (!row || typeof row !== 'object') return null;
  const x = row as Record<string, unknown>;
  const id = str(x.id);
  const title = str(x.title);
  if (!id || !title) return null;
  const companyRaw = x.company;
  const company: CompanyRef =
    companyRaw && typeof companyRaw === 'object'
      ? {
          id: str((companyRaw as Record<string, unknown>).id),
          name: str((companyRaw as Record<string, unknown>).name),
        }
      : null;
  return {
    id,
    title,
    location: x.location != null ? str(x.location) : null,
    industry: x.industry != null ? str(x.industry) : null,
    summary: x.summary != null ? str(x.summary) : null,
    description: x.description != null ? str(x.description) : null,
    company: company && (company.name || company.id) ? company : null,
    minSalary: x.minSalary as number | string | null | undefined,
    maxSalary: x.maxSalary as number | string | null | undefined,
    isEvergreen: Boolean(x.isEvergreen),
    createdAt: str(x.createdAt) || null,
    updatedAt: str(x.updatedAt) || null,
    expiresAt: str(x.expiresAt) || null,
    applied: Boolean(x.applied),
    saved: Boolean(x.saved),
  };
}

type JobsApiResponse = {
  data?: PublicJobListItem[];
  count?: number;
};

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function previewTextForJob(job: PublicJobListItem, maxLen = 280): string {
  const s = job.summary?.trim();
  if (s) return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
  const fromDesc = stripHtml(job.description ?? '');
  if (!fromDesc) return '';
  return fromDesc.length > maxLen ? `${fromDesc.slice(0, maxLen)}…` : fromDesc;
}

/** Vacante cerrada por fecha: evergreen no expira; sin `expiresAt` se considera vigente. */
export function isPublicJobExpired(job: PublicJobListItem): boolean {
  if (job.isEvergreen) return false;
  const raw = job.expiresAt?.trim();
  if (!raw) return false;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return false;
  return ms < Date.now();
}

/** Cómo aplica el trabajo, inferido de texto (la API aún no envía un campo fijo de modalidad). */
export type InferredWorkMode = 'remote' | 'onsite' | 'hybrid' | 'unknown';

const HYBRID_RE = /h[íi]brido|hybrid/i;
const REMOTE_RE =
  /remot|remoto|teletrabaj|wfh|work\s*from\s*home|home\s*office|trabaj\w* desde casa|desde su casa|anywhere|\b100%\s*remot/i;
const ONSITE_RE = /presencial|on-?site|in\s*office|en oficina|in\s*persona/i;

/**
 * Infiere remoto / presencia / híbrido a partir de título, resumen, descripción y ubicación.
 * Si no hay pistas, devuelve `unknown`.
 */
export function inferWorkModeFromJob(job: PublicJobListItem): InferredWorkMode {
  const text = [job.title, job.summary, job.description, job.location, job.industry]
    .map((x) => (x != null ? String(x) : ''))
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (HYBRID_RE.test(text)) return 'hybrid';
  if (REMOTE_RE.test(text) && ONSITE_RE.test(text)) return 'hybrid';
  if (REMOTE_RE.test(text)) return 'remote';
  if (ONSITE_RE.test(text)) return 'onsite';
  return 'unknown';
}

function searchFold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Búsqueda en oferta: título, resumen, descripción plana, empresa, ubicación, industria.
 */
export function jobMatchesSearch(job: PublicJobListItem, query: string): boolean {
  const q = searchFold(query);
  if (!q) return true;
  const company = job.company?.name != null ? String(job.company.name) : '';
  const descPlain = stripHtml(job.description ?? '');
  const hay = searchFold(
    [job.title, job.summary, descPlain, company, job.location, job.industry]
      .filter((x) => x != null && x !== '')
      .join(' '),
  );
  return q
    .split(' ')
    .filter(Boolean)
    .every((tok) => hay.includes(tok));
}

export type WorkModeFilter = 'all' | 'remote' | 'onsite' | 'hybrid';

/**
 * Filtro por modalidad. Las ofertas `unknown` no coinciden con un modo concreto (pero sí con "all").
 */
export function jobMatchesWorkMode(job: PublicJobListItem, mode: WorkModeFilter): boolean {
  if (mode === 'all') return true;
  return inferWorkModeFromJob(job) === mode;
}

/**
 * Ofertas visibles y publicadas; el backend ordena por `updatedAt` DESC (más recientes primero).
 */
export async function fetchPublicPostedJobs(
  apiBase: string,
  pageSize = 20,
): Promise<PublicJobListItem[]> {
  const base = apiBase.replace(/\/$/, '');
  const url = new URL(`${base}/jobs`);
  url.searchParams.set('page', '1');
  url.searchParams.set('pageSize', String(Math.min(100, Math.max(1, pageSize))));
  url.searchParams.set('status', 'Posted');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as JobsApiResponse;
  return Array.isArray(body.data) ? body.data : [];
}

/**
 * Ofertas publicadas con flags `applied` / `saved` para el usuario actual (`GET /developer/jobs`, Bearer).
 */
export async function fetchDeveloperPostedJobs(
  apiBase: string,
  accessToken: string,
  pageSize = 20,
): Promise<PublicJobListItem[]> {
  const base = apiBase.replace(/\/$/, '');
  const url = new URL(`${base}/developer/jobs`);
  url.searchParams.set('page', '1');
  url.searchParams.set('pageSize', String(Math.min(100, Math.max(1, pageSize))));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as JobsApiResponse;
  const raw = Array.isArray(body.data) ? body.data : [];
  return raw.map(mapDeveloperJobRow).filter((x): x is PublicJobListItem => x != null);
}

/** Solo guardadas del developer (`GET /developer/jobs/saved`, Bearer). */
export async function fetchDeveloperSavedJobs(
  apiBase: string,
  accessToken: string,
  pageSize = 100,
): Promise<PublicJobListItem[]> {
  const base = apiBase.replace(/\/$/, '');
  const url = new URL(`${base}/developer/jobs/saved`);
  url.searchParams.set('page', '1');
  url.searchParams.set('pageSize', String(Math.min(250, Math.max(1, pageSize))));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as JobsApiResponse;
  const raw = Array.isArray(body.data) ? body.data : [];
  return raw.map(mapDeveloperJobRow).filter((x): x is PublicJobListItem => x != null);
}

/** Marca una oferta como guardada (`POST /developer/jobs/saved`, Bearer). */
export async function saveDeveloperJob(apiBase: string, accessToken: string, jobId: string): Promise<void> {
  const base = apiBase.replace(/\/$/, '');
  const res = await fetch(`${base}/developer/jobs/saved`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  });
  if (!res.ok) throw new Error(String(res.status));
}

/** Quita una oferta guardada (`DELETE /developer/jobs/saved/:id`, Bearer). */
export async function unsaveDeveloperJob(apiBase: string, accessToken: string, jobId: string): Promise<void> {
  const base = apiBase.replace(/\/$/, '');
  const res = await fetch(`${base}/developer/jobs/saved/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(String(res.status));
}
