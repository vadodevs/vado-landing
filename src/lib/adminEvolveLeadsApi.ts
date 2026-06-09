import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export type EvolveLeadRow = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  fuente: string;
  calificacion: string;
  urgencia: string;
  etapaNegocio: string;
  claridad: string;
  anuncio: string;
  pipelineStatus: string;
  meetingLink: string | null;
  meetingTitle: string | null;
  meetingStart: string | null;
  fechaAlta: string;
  createdAtMs: number;
};

export type EvolveMeetingEvent = {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  title: string;
  startTime: string;
  startTimeMs: number;
  endTime: string | null;
  meetingLink: string | null;
  status: string;
};

export type EvolveLeadsListResponse = {
  contacts: EvolveLeadRow[];
  total: number;
  locationId: string;
};

export type EvolveLeadsResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'no-config' | 'no-auth' | 'http'; message?: string };

async function evolveLeadsRequest<T>(path: string): Promise<EvolveLeadsResult<T>> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  const token = getAdminAccessToken();
  if (!token) return { ok: false, reason: 'no-auth' };

  try {
    const res = await adminAuthorizedFetch(`${base}${path}`);
    if (!res) return { ok: false, reason: 'no-auth' };
    const data = (await res.json().catch(() => ({}))) as T & { message?: string };
    if (res.ok) return { ok: true, data: data as T };
    const message =
      typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
        ? data.message
        : res.statusText;
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'no-auth', message };
    return { ok: false, reason: 'http', message };
  } catch {
    return { ok: false, reason: 'http', message: 'Network error' };
  }
}

export type EvolveMeetingsListResponse = {
  meetings: EvolveMeetingEvent[];
  locationId: string | null;
};

export function fetchEvolveLeads(opts?: { includeMeetings?: boolean }): Promise<
  EvolveLeadsResult<EvolveLeadsListResponse>
> {
  const q = opts?.includeMeetings === false ? '?includeMeetings=false' : '';
  return evolveLeadsRequest<EvolveLeadsListResponse>(`/admin/leads/evolve${q}`);
}

export function fetchEvolveMeetings(opts: {
  startMs: number;
  endMs: number;
}): Promise<EvolveLeadsResult<EvolveMeetingsListResponse>> {
  const q = new URLSearchParams({
    startMs: String(opts.startMs),
    endMs: String(opts.endMs),
  });
  return evolveLeadsRequest<EvolveMeetingsListResponse>(`/admin/leads/evolve/meetings?${q}`);
}
