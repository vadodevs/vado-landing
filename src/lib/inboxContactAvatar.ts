import { getAdminAccessToken } from '@/lib/adminAuth';

const blobUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

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

  const pending = inflight.get(conversationId);
  if (pending) return pending;

  const promise = (async () => {
    const base = getApiBaseUrl();
    const token = getAdminAccessToken();
    if (!base || !token) return null;

    try {
      const res = await fetch(
        `${base}/admin/inbox/conversations/${encodeURIComponent(conversationId)}/avatar`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.size) return null;
      const url = URL.createObjectURL(blob);
      blobUrlCache.set(conversationId, url);
      return url;
    } catch {
      return null;
    } finally {
      inflight.delete(conversationId);
    }
  })();

  inflight.set(conversationId, promise);
  return promise;
}
