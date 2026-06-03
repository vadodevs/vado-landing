import { getAdminAccessToken } from '@/lib/adminAuth';

let blobUrl: string | null = null;
let inflight: Promise<string | null> | null = null;

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

export function releaseInboxAccountAvatarUrl(): void {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
  inflight = null;
}

export async function loadInboxAccountAvatarUrl(): Promise<string | null> {
  if (blobUrl) return blobUrl;
  if (inflight) return inflight;

  inflight = (async () => {
    const base = getApiBaseUrl();
    const token = getAdminAccessToken();
    if (!base || !token) return null;

    try {
      const res = await fetch(`${base}/admin/inbox/whatsapp/account-avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob.size) return null;
      blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
