import { getAdminAccessToken } from '@/lib/adminAuth';

/** Alineado con la sidebar admin (excluye Reclutadores y Ajustes). */
export const RECRUITER_PERMISSION_KEYS = [
  'panel:developers',
  'panel:jobs',
  'panel:projects',
  'panel:companies',
] as const;

/** Alias for rutas/permisos de panel (`recruiterPanel.ts`). */
export const RECRUITER_PANEL_KEYS = RECRUITER_PERMISSION_KEYS;

export function defaultRecruiterPermissions(): Record<string, boolean> {
  return {
    'panel:developers': false,
    'panel:jobs': false,
    'panel:projects': false,
    'panel:companies': false,
  };
}

/** Respuesta de GET /admin/recruiters (coincide con entidad adminvado). */
export type RecruiterApiRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecruiterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  permissions?: Record<string, boolean>;
};

export type UpdateRecruiterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  permissions?: Record<string, boolean>;
};

function getBase(apiBase: string): string {
  return apiBase.replace(/\/$/, '');
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: unknown; errors?: unknown[] };
    if (typeof j.message === 'string') return j.message;
    if (Array.isArray(j.errors) && j.errors.length) {
      const e = j.errors[0] as { constraints?: Record<string, string> };
      const c = e?.constraints && Object.values(e.constraints)[0];
      if (typeof c === 'string') return c;
    }
  } catch {
    /* ignore */
  }
  return `Error ${res.status}`;
}

export async function fetchRecruiters(
  apiBase: string,
  page = 1,
  pageSize = 10,
  nameSearch?: string,
): Promise<{
  data: RecruiterApiRecord[];
  count: number;
  page: number;
  pageSize: number;
} | null> {
  const token = getAdminAccessToken();
  if (!token) return null;
  const base = getBase(apiBase);
  const url = new URL(`${base}/admin/recruiters`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(pageSize));
  const t = (nameSearch ?? '').trim();
  if (t) {
    url.searchParams.set('name_like', t);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    data?: RecruiterApiRecord[];
    count?: number;
    page?: number;
    pageSize?: number;
  };
  return {
    data: Array.isArray(body.data) ? body.data : [],
    count: typeof body.count === 'number' ? body.count : 0,
    page: typeof body.page === 'number' && body.page > 0 ? body.page : page,
    pageSize: typeof body.pageSize === 'number' && body.pageSize > 0 ? body.pageSize : pageSize,
  };
}

export async function fetchRecruiterById(
  apiBase: string,
  id: string,
): Promise<RecruiterApiRecord | null> {
  const token = getAdminAccessToken();
  if (!token) return null;
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as RecruiterApiRecord;
}

export async function createRecruiter(
  apiBase: string,
  input: CreateRecruiterInput,
): Promise<{ ok: true; record: RecruiterApiRecord } | { ok: false; message: string }> {
  const token = getAdminAccessToken();
  if (!token) return { ok: false, message: 'Sin sesión de admin.' };
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      permissions: input.permissions,
    }),
  });
  if (!res.ok) {
    return { ok: false, message: await parseErrorMessage(res) };
  }
  const record = (await res.json()) as RecruiterApiRecord;
  return { ok: true, record };
}

export async function updateRecruiter(
  apiBase: string,
  id: string,
  input: UpdateRecruiterInput,
): Promise<{ ok: true; record: RecruiterApiRecord } | { ok: false; message: string }> {
  const token = getAdminAccessToken();
  if (!token) return { ok: false, message: 'Sin sesión de admin.' };
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      permissions: input.permissions,
    }),
  });
  if (!res.ok) {
    return { ok: false, message: await parseErrorMessage(res) };
  }
  const record = (await res.json()) as RecruiterApiRecord;
  return { ok: true, record };
}

export async function deleteRecruiter(
  apiBase: string,
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  const token = getAdminAccessToken();
  if (!token) return { ok: false, message: 'Sin sesión de admin.' };
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { ok: false, message: await parseErrorMessage(res) };
  }
  return { ok: true };
}

export type RecruiterAccessStatusRow = {
  recruiterId: string;
  email: string;
  accessEnabled: boolean;
};

export async function fetchRecruiterAccessStatus(
  apiBase: string,
): Promise<RecruiterAccessStatusRow[] | null> {
  const token = getAdminAccessToken();
  if (!token) return null;
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters/access-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as unknown;
  if (!Array.isArray(body)) return [];
  return body as RecruiterAccessStatusRow[];
}

export type RecruiterPortalAccessResult =
  | {
      ok: true;
      recruiterId: string;
      email: string;
      password?: string;
      accessEnabled: boolean;
    }
  | { ok: false; message: string };

export async function recruiterPortalAccessAction(
  apiBase: string,
  id: string,
  action: 'enable-access' | 'reset-password' | 'disable-access',
): Promise<RecruiterPortalAccessResult> {
  const token = getAdminAccessToken();
  if (!token) return { ok: false, message: 'Sin sesión de admin.' };
  const base = getBase(apiBase);
  const res = await fetch(`${base}/admin/recruiters/${encodeURIComponent(id)}/${action}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { ok: false, message: await parseErrorMessage(res) };
  }
  const payload = (await res.json()) as {
    recruiterId?: string;
    email?: string;
    password?: string;
    accessEnabled?: boolean;
  };
  return {
    ok: true,
    recruiterId: String(payload.recruiterId ?? id),
    email: String(payload.email ?? ''),
    password: typeof payload.password === 'string' ? payload.password : undefined,
    accessEnabled: payload.accessEnabled !== false,
  };
}
