import { getAdminAccessToken } from '@/lib/adminAuth';

const blobUrlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

export function releaseInboxMessageMediaUrl(messageId: string): void {
  const url = blobUrlCache.get(messageId);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(messageId);
  }
  inflight.delete(messageId);
}

function base64ToBlob(base64: string, mimeType: string): Blob | null {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType || 'image/jpeg' });
  } catch {
    return null;
  }
}

export async function loadInboxMessageMediaUrl(messageId: string): Promise<string | null> {
  const cached = blobUrlCache.get(messageId);
  if (cached) return cached;

  const pending = inflight.get(messageId);
  if (pending) return pending;

  const promise = (async () => {
    const base = getApiBaseUrl();
    const token = getAdminAccessToken();
    if (!base || !token) return null;

    try {
      const res = await fetch(
        `${base}/admin/inbox/messages/${encodeURIComponent(messageId)}/media-data`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return null;

      const data = (await res.json()) as { base64?: string; mimeType?: string };
      const raw = typeof data.base64 === 'string' ? data.base64.trim() : '';
      if (!raw) return null;

      const blob = base64ToBlob(raw, data.mimeType ?? 'image/jpeg');
      if (!blob?.size) return null;

      const url = URL.createObjectURL(blob);
      blobUrlCache.set(messageId, url);
      return url;
    } catch {
      return null;
    } finally {
      inflight.delete(messageId);
    }
  })();

  inflight.set(messageId, promise);
  return promise;
}

export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('read failed'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}
