import { getAdminAccessToken } from '@/lib/adminAuth';
import type { InboxAutopilotConfig } from '@/lib/inboxAutopilotConfig';
import type { InboxBotConfig } from '@/lib/inboxBotConfig';

export type InboxAiSettingsPayload = {
  autopilot: InboxAutopilotConfig;
  bot: InboxBotConfig;
  updatedAt?: string;
};

export type InboxAiSettingsResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'no-config' | 'no-auth' | 'http'; message?: string };

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

async function inboxAiRequest<T>(path: string, init?: RequestInit): Promise<InboxAiSettingsResult<T>> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  const token = getAdminAccessToken();
  if (!token) return { ok: false, reason: 'no-auth' };

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as T & { message?: string };
    if (res.ok) return { ok: true, data: data as T };
    const message =
      typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
        ? data.message
        : res.statusText;
    if (res.status === 401 || res.status === 403) return { ok: false, reason: 'no-auth', message };
    return { ok: false, reason: 'http', message };
  } catch {
    return { ok: false, reason: 'http', message: 'Network error' };
  }
}

export function fetchInboxAiSettings(): Promise<InboxAiSettingsResult<InboxAiSettingsPayload>> {
  return inboxAiRequest<InboxAiSettingsPayload>('/admin/inbox/ai-settings');
}

export function saveInboxAiSettings(payload: {
  autopilot?: InboxAutopilotConfig;
  bot?: InboxBotConfig;
}): Promise<InboxAiSettingsResult<InboxAiSettingsPayload>> {
  return inboxAiRequest<InboxAiSettingsPayload>('/admin/inbox/ai-settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function triggerInboxAutoReply(
  conversationId: string,
): Promise<InboxAiSettingsResult<{ replied: boolean; reason?: string }>> {
  return inboxAiRequest<{ replied: boolean; reason?: string }>(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/auto-reply`,
    { method: 'POST' },
  );
}
