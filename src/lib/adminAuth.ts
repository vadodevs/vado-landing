const STORAGE_KEY = 'vado-admin-session';

export const ADMIN_AUTH_CHANGE_EVENT = 'vado-admin-auth-change';

export function isAdminAuthConfigured(): boolean {
  return String(import.meta.env.VITE_API_BASE_URL ?? '').trim().length > 0;
}

type AdminSession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  at: number;
};

function getApiBaseUrl(): string {
  return String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
}

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
  sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_AUTH_CHANGE_EVENT));
}

export async function verifyAdminSession(): Promise<boolean> {
  const base = getApiBaseUrl();
  const token = getAdminAccessToken();
  if (!base || !token) return false;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const me = (await res.json()) as { roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    return roles.includes('Admin');
  } catch {
    return false;
  }
}
