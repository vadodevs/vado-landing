import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';

const blobUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
/** Evita golpear Evolution en bucle cuando no hay foto (404). */
const missUntil = new Map<string, number>();
const MISS_TTL_MS = 3 * 60_000;

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

export function releaseInboxContactAvatarUrl(conversationId: string): void {
  const url = blobUrlCache.get(conversationId);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(conversationId);
  }
  inflight.delete(conversationId);
  missUntil.delete(conversationId);
}

export function releaseAllInboxContactAvatarUrls(): void {
  for (const id of [...blobUrlCache.keys()]) {
    releaseInboxContactAvatarUrl(id);
  }
}

export async function loadInboxContactAvatarUrl(conversationId: string): Promise<string | null> {
  if (!conversationId) return null;

  const cached = blobUrlCache.get(conversationId);
  if (cached) return cached;

  const missAt = missUntil.get(conversationId);
  if (missAt && Date.now() < missAt) return null;

  const pending = inflight.get(conversationId);
  if (pending) return pending;

  const promise = (async () => {
    const base = getApiBaseUrl();
    const token = getAdminAccessToken();
    if (!base || !token) return null;

    try {
      const res = await adminAuthorizedFetch(
        `${base}/admin/inbox/conversations/${encodeURIComponent(conversationId)}/avatar`,
      );
      if (!res?.ok) {
        missUntil.set(conversationId, Date.now() + MISS_TTL_MS);
        return null;
      }
      const blob = await res.blob();
      if (!blob.size) {
        missUntil.set(conversationId, Date.now() + MISS_TTL_MS);
        return null;
      }
      const url = URL.createObjectURL(blob);
      blobUrlCache.set(conversationId, url);
      missUntil.delete(conversationId);
      return url;
    } catch {
      missUntil.set(conversationId, Date.now() + MISS_TTL_MS);
      return null;
    } finally {
      inflight.delete(conversationId);
    }
  })();

  inflight.set(conversationId, promise);
  return promise;
}
