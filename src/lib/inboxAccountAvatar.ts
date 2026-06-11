import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';

const blobUrlByKey = new Map<string, string>();
const inflightByKey = new Map<string, Promise<string | null>>();
let activeCacheKey = '';

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

function revokeKey(key: string): void {
  const url = blobUrlByKey.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlByKey.delete(key);
  }
  inflightByKey.delete(key);
}

/** Identificador de la cuenta vinculada (ownerJid). Al cambiar, invalida blobs anteriores. */
export function setInboxAccountAvatarCacheKey(cacheKey: string): void {
  const next = cacheKey.trim();
  if (next === activeCacheKey) return;
  if (activeCacheKey) revokeKey(activeCacheKey);
  activeCacheKey = next;
}

export function clearInboxAccountAvatarBlob(cacheKey: string): void {
  revokeKey(cacheKey.trim());
}

export function releaseInboxAccountAvatarUrl(): void {
  for (const key of [...blobUrlByKey.keys()]) {
    revokeKey(key);
  }
  activeCacheKey = '';
}

export function notifyInboxAccountAvatarChanged(cacheKey = ''): void {
  setInboxAccountAvatarCacheKey(cacheKey);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('inbox:whatsapp-account-changed', { detail: { cacheKey } }),
    );
  }
}

export async function loadInboxAccountAvatarUrl(cacheKey?: string): Promise<string | null> {
  const key = (cacheKey ?? activeCacheKey).trim();
  if (!key) return null;

  const cached = blobUrlByKey.get(key);
  if (cached) return cached;

  const pending = inflightByKey.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const base = getApiBaseUrl();
    const token = getAdminAccessToken();
    if (!base || !token) return null;

    try {
      const res = await adminAuthorizedFetch(
        `${base}/admin/inbox/whatsapp/account-avatar?account=${encodeURIComponent(key)}`,
      );
      if (!res?.ok) return null;
      const blob = await res.blob();
      if (!blob.size) return null;
      const url = URL.createObjectURL(blob);
      blobUrlByKey.set(key, url);
      if (!activeCacheKey) activeCacheKey = key;
      return url;
    } catch {
      return null;
    } finally {
      inflightByKey.delete(key);
    }
  })();

  inflightByKey.set(key, promise);
  return promise;
}
