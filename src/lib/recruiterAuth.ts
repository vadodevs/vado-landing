import { normalizeRecruiterPermissions } from '@/lib/recruiterPanel';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export const RECRUITER_AUTH_CHANGE_EVENT = 'vado-recruiter-auth-change';
const RECRUITER_SESSION_KEY = 'vado-recruiter-session';

export type RecruiterSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  recruiterId: string;
  permissions: Record<string, boolean>;
  at: number;
};

export type RecruiterProfilePayload = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  permissions: Record<string, boolean>;
};

function loadSession(): RecruiterSession | null {
  try {
    const raw = sessionStorage.getItem(RECRUITER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RecruiterSession>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.recruiterId !== 'string'
    ) {
      return null;
    }
    const permissions =
      parsed.permissions && typeof parsed.permissions === 'object'
        ? normalizeRecruiterPermissions(parsed.permissions as Record<string, boolean>)
        : normalizeRecruiterPermissions({});
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      email: parsed.email,
      recruiterId: parsed.recruiterId,
      permissions,
      at: typeof parsed.at === 'number' ? parsed.at : Date.now(),
    };
  } catch {
    return null;
  }
}

function saveSession(session: RecruiterSession): void {
  const next = JSON.stringify(session);
  const prev = sessionStorage.getItem(RECRUITER_SESSION_KEY);
  if (prev === next) return;
  sessionStorage.setItem(RECRUITER_SESSION_KEY, next);
  window.dispatchEvent(new CustomEvent(RECRUITER_AUTH_CHANGE_EVENT));
}

export function getRecruiterAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

export function getRecruiterPermissions(): Record<string, boolean> | null {
  const s = loadSession();
  return s ? normalizeRecruiterPermissions(s.permissions) : null;
}

export function isRecruiterAuthenticated(): boolean {
  return getRecruiterAccessToken() != null;
}

export function logoutRecruiter(): void {
  sessionStorage.removeItem(RECRUITER_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(RECRUITER_AUTH_CHANGE_EVENT));
}

function recruiterProfileFromJson(raw: unknown): RecruiterProfilePayload | null {
  const row = raw as {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    permissions?: Record<string, boolean>;
  };
  if (typeof row.id !== 'string' || typeof row.email !== 'string') return null;
  const phone =
    row.phone == null || row.phone === ''
      ? null
      : typeof row.phone === 'string'
        ? row.phone.trim() || null
        : null;
  return {
    id: row.id,
    email: row.email.trim().toLowerCase(),
    firstName: typeof row.firstName === 'string' ? row.firstName : '',
    lastName: typeof row.lastName === 'string' ? row.lastName : '',
    phone,
    permissions: normalizeRecruiterPermissions(row.permissions ?? {}),
  };
}

export async function fetchRecruiterProfile(accessToken: string): Promise<RecruiterProfilePayload | null> {
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/recruiters/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return recruiterProfileFromJson(json);
  } catch {
    return null;
  }
}

export async function loginRecruiter(
  email: string,
  password: string,
): Promise<
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'no-config'
        | 'invalid-credentials'
        | 'network'
        | 'recruiter-me-unavailable'
        | 'recruiter-record-missing';
    }
> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    if (!loginRes.ok) return { ok: false, reason: 'invalid-credentials' };
    const loginData = (await loginRes.json()) as { accessToken?: string; refreshToken?: string };
    if (
      typeof loginData.accessToken !== 'string' ||
      !loginData.accessToken ||
      typeof loginData.refreshToken !== 'string' ||
      !loginData.refreshToken
    ) {
      return { ok: false, reason: 'invalid-credentials' };
    }
    const meRes = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.accessToken}` },
    });
    if (!meRes.ok) return { ok: false, reason: 'invalid-credentials' };
    const me = (await meRes.json()) as { email?: string; roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    if (!roles.includes('Recruiter')) return { ok: false, reason: 'invalid-credentials' };

    const profileRes = await fetch(`${base}/recruiters/me`, {
      headers: { Authorization: `Bearer ${loginData.accessToken}` },
    });
    /** 404: ruta no registrada (p. ej. `dist` del backend sin reconstruir tras añadir el controlador). */
    if (profileRes.status === 404) return { ok: false, reason: 'recruiter-me-unavailable' };
    /** 401: JWT válido con rol Recruiter pero sin fila en `recruiters`. */
    if (profileRes.status === 401) return { ok: false, reason: 'recruiter-record-missing' };
    if (!profileRes.ok) return { ok: false, reason: 'invalid-credentials' };
    const profile = recruiterProfileFromJson(await profileRes.json());
    if (!profile) return { ok: false, reason: 'invalid-credentials' };

    saveSession({
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      email: profile.email,
      recruiterId: profile.id,
      permissions: profile.permissions,
      at: Date.now(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function verifyRecruiterSession(): Promise<boolean> {
  const base = getApiBaseUrl();
  const cur = loadSession();
  const token = cur?.accessToken;
  if (!base || !token) return false;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const me = (await res.json()) as { roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    if (!roles.includes('Recruiter')) return false;

    const profile = await fetchRecruiterProfile(token);
    if (!profile) return false;

    /** Sin esto, cada verify guardaba `at: Date.now()`, disparaba RECRUITER_AUTH_CHANGE_EVENT y RequireRecruiter volvía a verify en bucle infinito. */
    const unchanged =
      cur.email === profile.email &&
      cur.recruiterId === profile.id &&
      JSON.stringify(normalizeRecruiterPermissions(cur.permissions)) ===
        JSON.stringify(normalizeRecruiterPermissions(profile.permissions));

    if (unchanged) {
      return true;
    }

    saveSession({
      accessToken: token,
      refreshToken: cur.refreshToken,
      email: profile.email,
      recruiterId: profile.id,
      permissions: profile.permissions,
      at: Date.now(),
    });
    return true;
  } catch {
    return false;
  }
}
