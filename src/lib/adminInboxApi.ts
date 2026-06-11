import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export type InboxChannel = 'whatsapp' | 'facebook' | 'instagram';

export type InboxConversationDto = {
  id: string;
  channel: InboxChannel;
  contactName: string | null;
  externalId: string;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
  contactPhone?: string | null;
  hasProfilePicture?: boolean;
  isGroup?: boolean;
  groupMemberCount?: number | null;
};

export type InboxGroupInfoMemberDto = {
  jid: string;
  displayName: string;
  phone: string | null;
  isAdmin: boolean;
  conversationId: string | null;
};

export type InboxGroupInfoDto = {
  conversationId: string;
  groupJid: string;
  subject: string;
  description: string | null;
  memberCount: number;
  members: InboxGroupInfoMemberDto[];
};

export type InboxDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'played'
  | 'error';

export type InboxMessageDto = {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  sentAt: string;
  mediaType?: string | null;
  mediaMime?: string | null;
  hasMedia?: boolean;
  deliveryStatus?: InboxDeliveryStatus | null;
  /** Grupos: remitente del mensaje entrante */
  senderName?: string | null;
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
  /** JID del número vinculado; cambia al desvincular y escanear otro QR */
  ownerJid?: string | null;
  /** Teléfono formateado del número vinculado (solo si ownerJid es válido) */
  ownerPhone?: string | null;
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
    const res = await adminAuthorizedFetch(`${base}${path}`, {
      cache: 'no-store',
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (!res) return { ok: false, reason: 'no-auth' };
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
  opts?: { sync?: boolean; activeConversationId?: string },
): Promise<AdminInboxResult<InboxConversationDto[]>> {
  const q = new URLSearchParams({ channel });
  if (opts?.sync) q.set('sync', 'true');
  if (opts?.activeConversationId?.trim()) {
    q.set('activeId', opts.activeConversationId.trim());
  }
  return adminInboxRequest<InboxConversationDto[]>(`/admin/inbox/conversations?${q}`);
}

export function fetchInboxMessages(
  conversationId: string,
  opts?: { sync?: boolean },
): Promise<AdminInboxResult<InboxMessageDto[]>> {
  const q = new URLSearchParams();
  if (opts?.sync) q.set('sync', 'true');
  const suffix = q.size ? `?${q}` : '';
  return adminInboxRequest<InboxMessageDto[]>(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/messages${suffix}`,
  );
}

export function fetchInboxGroupInfo(
  conversationId: string,
): Promise<AdminInboxResult<InboxGroupInfoDto>> {
  return adminInboxRequest<InboxGroupInfoDto>(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/group-info`,
  );
}

export function openInboxParticipantChat(
  groupConversationId: string,
  participantJid: string,
): Promise<AdminInboxResult<{ conversationId: string }>> {
  return adminInboxRequest<{ conversationId: string }>(
    `/admin/inbox/conversations/${encodeURIComponent(groupConversationId)}/open-participant`,
    {
      method: 'POST',
      body: JSON.stringify({ participantJid }),
    },
  );
}

export function sendInboxMessage(
  conversationId: string,
  text: string,
): Promise<
  AdminInboxResult<{
    id: string
    direction: string
    body: string
    sentAt: string
    deliveryStatus?: InboxDeliveryStatus | null
  }>
> {
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
    deliveryStatus?: InboxDeliveryStatus | null;
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

export type InboxSavedStickerDto = {
  messageId: string;
  sentAt: string;
  mimeType: string | null;
  hasMedia: boolean;
};

export function fetchSavedInboxStickers(): Promise<AdminInboxResult<InboxSavedStickerDto[]>> {
  return adminInboxRequest<InboxSavedStickerDto[]>('/admin/inbox/whatsapp/saved-stickers');
}

export function sendInboxSticker(
  conversationId: string,
  sourceMessageId: string,
): Promise<
  AdminInboxResult<{
    id: string;
    direction: string;
    body: string;
    sentAt: string;
    hasMedia: boolean;
    deliveryStatus?: InboxDeliveryStatus | null;
  }>
> {
  return adminInboxRequest(
    `/admin/inbox/conversations/${encodeURIComponent(conversationId)}/messages/sticker`,
    {
      method: 'POST',
      body: JSON.stringify({ sourceMessageId }),
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
  AdminInboxResult<{ configured: boolean; url: string; chatsImported?: number }>
> {
  return adminInboxRequest<{ configured: boolean; url: string; chatsImported?: number }>(
    '/admin/inbox/whatsapp/configure-webhook',
    { method: 'POST' },
  );
}

export function syncWhatsappChats(): Promise<
  AdminInboxResult<{
    imported: number
    chatsFromApi: number
    contactsFromApi: number
    messagesImported: number
    total: number
    skipped?: boolean
  }>
> {
  return adminInboxRequest<{
    imported: number
    chatsFromApi: number
    contactsFromApi: number
    messagesImported: number
    total: number
    skipped?: boolean
  }>('/admin/inbox/whatsapp/sync-chats', { method: 'POST' });
}

export function relinkWhatsappForHistory(): Promise<
  AdminInboxResult<{
    disconnected: boolean
    state: string
    qrcodeBase64: string | null
    pairingCode: string | null
    message: string | null
  }>
> {
  return adminInboxRequest<{
    disconnected: boolean
    state: string
    qrcodeBase64: string | null
    pairingCode: string | null
    message: string | null
  }>('/admin/inbox/whatsapp/relink-for-history', { method: 'POST' });
}

export type WhatsappHistoryImportStatus = {
  running: boolean
  phase: 'idle' | 'waiting' | 'syncing' | 'done' | 'error'
  evolutionChatCount: number
  inboxTotal: number
  messagesImported: number
  startedAt: number
  finishedAt: number
  error: string | null
};

export function importWhatsappHistoryAfterLink(): Promise<
  AdminInboxResult<{
    started: boolean
    alreadyRunning: boolean
    background: true
    status: WhatsappHistoryImportStatus
  }>
> {
  return adminInboxRequest<{
    started: boolean
    alreadyRunning: boolean
    background: true
    status: WhatsappHistoryImportStatus
  }>('/admin/inbox/whatsapp/import-history-after-link', { method: 'POST' });
}

export function fetchWhatsappHistoryImportStatus(): Promise<
  AdminInboxResult<WhatsappHistoryImportStatus>
> {
  return adminInboxRequest<WhatsappHistoryImportStatus>(
    '/admin/inbox/whatsapp/history-import-status',
  );
}

export function resyncWhatsappHistory(): Promise<
  AdminInboxResult<{
    started: boolean
    alreadyRunning: boolean
    background: true
    status: WhatsappHistoryImportStatus
    historyPullSupported: boolean
    requiresRelink?: boolean
  }>
> {
  return adminInboxRequest<{
    started: boolean
    alreadyRunning: boolean
    background: true
    status: WhatsappHistoryImportStatus
    historyPullSupported: boolean
    requiresRelink?: boolean
  }>('/admin/inbox/whatsapp/resync-history', { method: 'POST' });
}
