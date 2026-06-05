/** Cache de sesión para no “pantalla negra” al volver de Ajustes u otra ruta admin. */

const STORAGE_KEY = 'vado.inbox.whatsapp.session.v1';
const TTL_MS = 30 * 60_000;
const MAX_CACHED_CONVERSATIONS = 80;
const MAX_MESSAGES_PER_CONV = 120;
const MAX_CACHED_CONV_WITH_MESSAGES = 12;

export type CachedWhatsappChatMsg = {
  id: string;
  from: 'them' | 'us';
  text: string;
  time: string;
  mediaType?: string | null;
  hasMedia?: boolean;
  deliveryStatus?: string | null;
  senderName?: string | null;
};

export type CachedWhatsappConversation = {
  id: string;
  name: string;
  initials: string;
  timeLabel: string;
  lastMessageAtMs?: number;
  lastPreview?: string;
  unreadCount?: number;
  externalId?: string;
  contactPhone?: string | null;
  hasProfilePicture?: boolean;
  isGroup?: boolean;
};

export type WhatsappInboxSessionSnapshot = {
  savedAt: number;
  ownerJid: string;
  selectedId: string;
  conversations: CachedWhatsappConversation[];
  messagesById: Record<string, CachedWhatsappChatMsg[]>;
  bootSyncDone: boolean;
  /** Última sync con Evolution (ms); para no saltarla al rehidratar caché. */
  lastEvolutionSyncAt?: number;
};

/** Si la caché tiene más de esta edad, forzar sync con Evolution al montar. */
export const WHATSAPP_INBOX_STALE_CACHE_MS = 45_000;

function trimMessagesById(
  messagesById: Record<string, CachedWhatsappChatMsg[]>,
  selectedId: string,
): Record<string, CachedWhatsappChatMsg[]> {
  const ids = Object.keys(messagesById);
  const ordered = [
    ...(selectedId && messagesById[selectedId] ? [selectedId] : []),
    ...ids.filter((id) => id !== selectedId),
  ].slice(0, MAX_CACHED_CONV_WITH_MESSAGES);

  const out: Record<string, CachedWhatsappChatMsg[]> = {};
  for (const id of ordered) {
    const rows = messagesById[id];
    if (!rows?.length) continue;
    out[id] =
      rows.length > MAX_MESSAGES_PER_CONV
        ? rows.slice(-MAX_MESSAGES_PER_CONV)
        : rows;
  }
  return out;
}

export function loadWhatsappInboxSession(): WhatsappInboxSessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WhatsappInboxSessionSnapshot;
    if (!parsed?.savedAt || !Array.isArray(parsed.conversations)) return null;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveWhatsappInboxSession(snapshot: Omit<WhatsappInboxSessionSnapshot, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: WhatsappInboxSessionSnapshot = {
      savedAt: Date.now(),
      ownerJid: snapshot.ownerJid,
      selectedId: snapshot.selectedId,
      conversations: snapshot.conversations.slice(0, MAX_CACHED_CONVERSATIONS),
      messagesById: trimMessagesById(snapshot.messagesById, snapshot.selectedId),
      bootSyncDone: snapshot.bootSyncDone,
      lastEvolutionSyncAt: snapshot.lastEvolutionSyncAt,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function clearWhatsappInboxSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
