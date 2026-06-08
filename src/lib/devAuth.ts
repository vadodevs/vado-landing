import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export const DEV_AUTH_CHANGE_EVENT = 'vado-dev-auth-change';
const DEV_SESSION_KEY = 'vado-dev-session';

type DevSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  at: number;
};

function loadSession(): DevSession | null {
  try {
    const raw = sessionStorage.getItem(DEV_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DevSession>;
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

function saveSession(session: DevSession): void {
  sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(DEV_AUTH_CHANGE_EVENT));
}

async function refreshDeveloperAccessToken(base: string, session: DevSession): Promise<string | null> {
  try {
    const res = await fetch(`${base}/auth/refresh-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (typeof data.accessToken !== 'string' || !data.accessToken) return null;
    const next: DevSession = {
      ...session,
      accessToken: data.accessToken,
      refreshToken:
        typeof data.refreshToken === 'string' && data.refreshToken ? data.refreshToken : session.refreshToken,
      at: Date.now(),
    };
    saveSession(next);
    return next.accessToken;
  } catch {
    return null;
  }
}

export function getDevAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

export function isDeveloperAuthenticated(): boolean {
  return getDevAccessToken() != null;
}

export function logoutDeveloper(): void {
  sessionStorage.removeItem(DEV_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(DEV_AUTH_CHANGE_EVENT));
}

export async function loginDeveloper(
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
    if (!roles.includes('User')) return { ok: false, reason: 'invalid-credentials' };
    saveSession({
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      email: String(me.email ?? email).trim().toLowerCase(),
      firstName: typeof (me as { firstName?: unknown }).firstName === 'string'
        ? (me as { firstName: string }).firstName
        : '',
      lastName: typeof (me as { lastName?: unknown }).lastName === 'string'
        ? (me as { lastName: string }).lastName
        : '',
      phone: typeof (me as { phone?: unknown }).phone === 'string'
        ? (me as { phone: string }).phone
        : null,
      at: Date.now(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export async function verifyDeveloperSession(): Promise<boolean> {
  const base = getApiBaseUrl();
  const token = getDevAccessToken();
  if (!base || !token) return false;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const me = (await res.json()) as { roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    return roles.includes('User');
  } catch {
    return false;
  }
}

export async function devAuthorizedFetch(
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

  const refreshed = await refreshDeveloperAccessToken(base, session);
  if (!refreshed) return first;
  return requestWithToken(refreshed);
}

export async function getDeveloperMe(): Promise<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
} | null> {
  const base = getApiBaseUrl();
  const token = getDevAccessToken();
  if (!base || !token) return null;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const me = (await res.json()) as {
      firstName?: unknown;
      lastName?: unknown;
      email?: unknown;
      phone?: unknown;
      roles?: unknown;
    };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    if (!roles.includes('User')) return null;
    return {
      firstName: typeof me.firstName === 'string' ? me.firstName.trim() : '',
      lastName: typeof me.lastName === 'string' ? me.lastName.trim() : '',
      email: typeof me.email === 'string' ? me.email.trim().toLowerCase() : '',
      phone: typeof me.phone === 'string' ? me.phone.trim() : '',
    };
  } catch {
    return null;
  }
}
