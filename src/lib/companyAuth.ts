export const COMPANY_AUTH_CHANGE_EVENT = 'vado-company-auth-change';
const COMPANY_SESSION_KEY = 'vado-company-session';

type CompanySession = {
  accessToken: string;
  refreshToken: string;
  email: string;
  at: number;
};

function getApiBaseUrl(): string {
  const base = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  return base.replace(/\/$/, '');
}

function loadSession(): CompanySession | null {
  try {
    const raw = sessionStorage.getItem(COMPANY_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CompanySession>;
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

function saveSession(session: CompanySession): void {
  sessionStorage.setItem(COMPANY_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(COMPANY_AUTH_CHANGE_EVENT));
}

export function getCompanyAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

export function isCompanyAuthenticated(): boolean {
  return getCompanyAccessToken() != null;
}

export function logoutCompany(): void {
  sessionStorage.removeItem(COMPANY_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(COMPANY_AUTH_CHANGE_EVENT));
}

export async function loginCompany(
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
    if (!roles.includes('Partner')) return { ok: false, reason: 'invalid-credentials' };
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

export async function verifyCompanySession(): Promise<boolean> {
  const base = getApiBaseUrl();
  const token = getCompanyAccessToken();
  if (!base || !token) return false;
  try {
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const me = (await res.json()) as { roles?: unknown };
    const roles = Array.isArray(me.roles) ? me.roles.map((r) => String(r)) : [];
    return roles.includes('Partner');
  } catch {
    return false;
  }
}
