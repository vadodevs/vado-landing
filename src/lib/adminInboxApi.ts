import { getAdminAccessToken } from '@/lib/adminAuth';

export type InboxChannel = 'whatsapp' | 'facebook' | 'instagram';

export type InboxConversationDto = {
  id: string;
  channel: InboxChannel;
  contactName: string | null;
  externalId: string;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type InboxMessageDto = {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  sentAt: string;
  mediaType?: string | null;
  mediaMime?: string | null;
  hasMedia?: boolean;
};

export type InboxConnectionStatusDto = {
  channel: string;
  state: string;
  instanceName: string;
};

export type WhatsappLinkStatusDto = {
  state: 'open' | 'close' | 'connecting' | 'unknown';
  instanceName: string;
  linked: boolean;
  webhookConfigured?: boolean;
  webhookUrl?: string | null;
  webhookCallbackUrl?: string;
};

export type WhatsappConnectDto = {
  state: string;
  qrcodeBase64: string | null;
  pairingCode: string | null;
  message: string | null;
};

export type AdminInboxResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'no-config' | 'no-auth' | 'http'; message?: string };

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

function isAuthDenied(status: number, message: string): boolean {
  if (status === 401 || status === 403) return true;
  const m = message.toLowerCase();
  return (
    m.includes('access is denied') ||
    m.includes('unauthorized') ||
    m.includes('forbidden') ||
    m.includes('not authorized')
  );
}

async function adminInboxRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<AdminInboxResult<T>> {
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
    if (res.ok) {
      return { ok: true, data: data as T };
    }
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message?: string }).message === 'string'
        ? (data as { message: string }).message
        : res.statusText;
    if (isAuthDenied(res.status, message)) {
      return { ok: false, reason: 'no-auth' };
    }
    return { ok: false, reason: 'http', message };
  } catch {
    return { ok: false, reason: 'http', message: 'Network error' };
  }
}

export function fetchInboxConversations(
  channel: InboxChannel = 'whatsapp',
): Promise<AdminInboxResult<InboxConversationDto[]>> {
  const q = new URLSearchParams({ channel });
  return adminInboxRequest<InboxConversationDto[]>(`/admin/inbox/conversations?${q}`);
}

export function fetchInboxMessages(
  conversationId: string,
): Promise<AdminInboxResult<InboxMessageDto[]>> {
  return adminInboxRequest<InboxMessageDto[]>(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
}

export function sendInboxMessage(
  conversationId: string,
  text: string,
): Promise<AdminInboxResult<{ id: string; direction: string; body: string; sentAt: string }>> {
  return adminInboxRequest(`/admin/inbox/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export function sendInboxImage(
  conversationId: string,
  payload: { imageBase64: string; mimetype: string; caption?: string },
): Promise<
  AdminInboxResult<{
    id: string;
    direction: string;
    body: string;
    sentAt: string;
    hasMedia: boolean;
  }>
> {
  return adminInboxRequest(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/messages/image`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function markInboxConversationRead(conversationId: string): Promise<AdminInboxResult<{ read: boolean }>> {
  return adminInboxRequest(`/admin/inbox/conversations/${encodeURIComponent(conversationId)}/mark-read`, {
    method: 'POST',
  });
}

export function fetchInboxConnectionStatus(
  channel: InboxChannel = 'whatsapp',
): Promise<AdminInboxResult<InboxConnectionStatusDto>> {
  const q = new URLSearchParams({ channel });
  return adminInboxRequest<InboxConnectionStatusDto>(`/admin/inbox/connection-status?${q}`);
}

export function fetchWhatsappLinkStatus(): Promise<AdminInboxResult<WhatsappLinkStatusDto>> {
  return adminInboxRequest<WhatsappLinkStatusDto>('/admin/inbox/whatsapp/link-status');
}

export function fetchWhatsappConnect(): Promise<AdminInboxResult<WhatsappConnectDto>> {
  return adminInboxRequest<WhatsappConnectDto>('/admin/inbox/whatsapp/connect');
}

export function disconnectWhatsapp(): Promise<AdminInboxResult<{ disconnected: boolean }>> {
  return adminInboxRequest<{ disconnected: boolean }>('/admin/inbox/whatsapp/disconnect', {
    method: 'POST',
  });
}

export function configureWhatsappWebhook(): Promise<
  AdminInboxResult<{ configured: boolean; url: string }>
> {
  return adminInboxRequest<{ configured: boolean; url: string }>(
    '/admin/inbox/whatsapp/configure-webhook',
    { method: 'POST' },
  );
}
