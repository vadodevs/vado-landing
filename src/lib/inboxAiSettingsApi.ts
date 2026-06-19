import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import type { InboxLlmOptionsResponse } from '@/lib/inboxLlmConfig';
import type { InboxAutopilotConfig } from '@/lib/inboxAutopilotConfig';
import type { InboxBotConfig } from '@/lib/inboxBotConfig';
import type { InboxLlmConfig } from '@/lib/inboxLlmConfig';
import { setInboxAutopilotConfigCache } from '@/lib/inboxAutopilotConfig';
import { setInboxBotConfigCache } from '@/lib/inboxBotConfig';
import { setInboxLlmConfigCache } from '@/lib/inboxLlmConfig';

export type InboxAiSettingsPayload = {
  autopilot: InboxAutopilotConfig;
  bot: InboxBotConfig;
  llm?: InboxLlmConfig;
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
    const res = await adminAuthorizedFetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res) return { ok: false, reason: 'no-auth' };
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

export async function hydrateInboxAiSettingsFromApi(): Promise<void> {
  const res = await fetchInboxAiSettings();
  if (!res.ok) return;
  setInboxBotConfigCache(res.data.bot);
  setInboxAutopilotConfigCache(res.data.autopilot);
  if (res.data.llm) setInboxLlmConfigCache(res.data.llm);
}

export function saveInboxAiSettings(payload: {
  autopilot?: InboxAutopilotConfig;
  bot?: InboxBotConfig;
  llm?: InboxLlmConfig;
}): Promise<InboxAiSettingsResult<InboxAiSettingsPayload>> {
  return inboxAiRequest<InboxAiSettingsPayload>('/admin/inbox/ai-settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchInboxLlmOptions(): Promise<InboxAiSettingsResult<InboxLlmOptionsResponse>> {
  return inboxAiRequest<InboxLlmOptionsResponse>('/admin/inbox/ai-settings/llm-options');
}

export function triggerInboxAutoReply(
  conversationId: string,
): Promise<InboxAiSettingsResult<{ replied: boolean; reason?: string }>> {
  return inboxAiRequest<{ replied: boolean; reason?: string }>(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/auto-reply`,
    { method: 'POST' },
  );
}
