import { getApiBaseUrl, isApiBaseConfigured } from '@/lib/apiBaseUrl';

const STORAGE_KEY = 'vado-admin-session';

export const ADMIN_AUTH_CHANGE_EVENT = 'vado-admin-auth-change';

export function isAdminAuthConfigured(): boolean {
  return isApiBaseConfigured();
}

type AdminSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  at: number;
};

function loadSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.email !== 'string'
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      email: parsed.email,
      at: typeof parsed.at === 'number' ? parsed.at : Date.now(),
    };
  } catch {
    return null;
  }
}

function saveSession(session: AdminSession): void {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(session),
  );
  window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGE_EVENT));
}

export function getAdminAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAdminAccessToken(base: string, session: AdminSession): Promise<string | null> {
  try {
    const res = await fetch(`${base}/auth/refresh-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (typeof data.accessToken !== 'string' || !data.accessToken) return null;
    const next: AdminSession = {
      ...session,
      accessToken: data.accessToken,
      refreshToken:
        typeof data.refreshToken === 'string' && data.refreshToken
          ? data.refreshToken
          : session.refreshToken,
      at: Date.now(),
    };
    saveSession(next);
    return next.accessToken;
  } catch {
    return null;
  }
}


export async function adminAuthorizedFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const base = getApiBaseUrl();
  const session = loadSession();
  if (!base || !session?.accessToken) return null;

  const requestWithToken = (accessToken: string) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });

  const first = await requestWithToken(session.accessToken);
  if (first.status !== 401) return first;

  if (!refreshInFlight) {
    refreshInFlight = refreshAdminAccessToken(base, session).finally(() => {
      refreshInFlight = null;
    });
  }
  const refreshed = await refreshInFlight;
  if (!refreshed) return first;
  return requestWithToken(refreshed);
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; reason: 'no-config' | 'invalid-credentials' | 'network' }> {
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
    if (!roles.includes('Admin')) return { ok: false, reason: 'invalid-credentials' };
    saveSession({
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      email: String(me.email ?? email).trim().toLowerCase(),
      at: Date.now(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminAccessToken() != null;
}

export function logoutAdmin(): void {
  const base = getApiBaseUrl();
  const token = getAdminAccessToken();
  if (base && token) {
    void fetch(`${base}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGE_EVENT));
}

export async function verifyAdminSession(): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base || !getAdminAccessToken()) return false;
  try {
    const res = await adminAuthorizedFetch(`${base}/auth/me`);
    if (!res?.ok) return false;
    const me = (await res.json()) as { roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    return roles.includes('Admin');
  } catch {
    return false;
  }
}
