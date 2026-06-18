import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import { getCompanyAccessToken } from '@/lib/companyAuth';
import { getDevAccessToken } from '@/lib/devAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export async function userAuthorizedFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response | null> {
  const token =
    getAdminAccessToken() ?? getDevAccessToken() ?? getCompanyAccessToken();
  if (!token) return null;

  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getUserAuthToken(): string | null {
  return getAdminAccessToken() ?? getDevAccessToken() ?? getCompanyAccessToken();
}

export function isUserAuthenticated(): boolean {
  return getUserAuthToken() != null;
}

export async function userApiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false }> {
  const base = getApiBaseUrl();
  if (!base || !getUserAuthToken()) return { ok: false };
  try {
    const res = await userAuthorizedFetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res?.ok) return { ok: false };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}

export async function adminWorkspaceRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false }> {
  const base = getApiBaseUrl();
  if (!base || !getAdminAccessToken()) return { ok: false };
  try {
    const res = await adminAuthorizedFetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res?.ok) return { ok: false };
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}
