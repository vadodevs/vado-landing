/** Marca local de conversaciones leídas (evita puntos verdes tras recargar si el API/cache van retrasados). */

const STORAGE_KEY = 'vado.admin.inboxRead.v2';

type ReadEntry = { lastMessageAtMs: number };

type PersistedReadState = {
  byOwner: Record<string, Record<string, ReadEntry>>;
};

function loadAll(): PersistedReadState {
  if (typeof window === 'undefined') return { byOwner: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byOwner: {} };
    const parsed = JSON.parse(raw) as PersistedReadState;
    if (!parsed?.byOwner || typeof parsed.byOwner !== 'object') return { byOwner: {} };
    return parsed;
  } catch {
    return { byOwner: {} };
  }
}

function saveAll(state: PersistedReadState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

function ownerKey(ownerJid: string): string {
  const key = ownerJid.trim();
  return key || '_default';
}

function readsForOwner(ownerJid: string): Record<string, ReadEntry> {
  return loadAll().byOwner[ownerKey(ownerJid)] ?? {};
}

export function getInboxConversationLastReadMs(
  ownerJid: string,
  conversationId: string,
): number {
  const entry = readsForOwner(ownerJid)[conversationId];
  return entry?.lastMessageAtMs ?? 0;
}

export function markInboxConversationReadLocal(
  ownerJid: string,
  conversationId: string,
  lastMessageAtMs: number,
): void {
  if (!conversationId.trim() || !Number.isFinite(lastMessageAtMs) || lastMessageAtMs <= 0) {
    return;
  }
  const all = loadAll();
  const oKey = ownerKey(ownerJid);
  const prev = all.byOwner[oKey] ?? {};
  const cur = prev[conversationId]?.lastMessageAtMs ?? 0;
  all.byOwner[oKey] = {
    ...prev,
    [conversationId]: { lastMessageAtMs: Math.max(cur, lastMessageAtMs) },
  };
  saveAll(all);
}

/** Si no hay mensajes nuevos desde la última lectura local, unread = 0. */
export function resolveInboxUnreadCount(
  ownerJid: string,
  conversationId: string,
  apiUnread: number,
  lastMessageAtMs: number | undefined,
): number {
  const unread = Math.max(0, Math.round(apiUnread));
  if (unread <= 0) return 0;
  const lastMs = lastMessageAtMs ?? 0;
  if (lastMs <= 0) return unread;
  const readMs = getInboxConversationLastReadMs(ownerJid, conversationId);
  if (readMs > 0 && lastMs <= readMs) return 0;
  return unread;
}

export type InboxRowWithUnread = {
  id: string;
  unreadCount?: number;
  lastMessageAtMs?: number;
};

export function applyInboxReadState<T extends InboxRowWithUnread>(
  ownerJid: string,
  rows: T[],
): T[] {
  if (!ownerJid.trim()) return rows;
  return rows.map((row) => {
    const resolved = resolveInboxUnreadCount(
      ownerJid,
      row.id,
      row.unreadCount ?? 0,
      row.lastMessageAtMs,
    );
    if (resolved === (row.unreadCount ?? 0)) return row;
    return { ...row, unreadCount: resolved };
  });
}

export function clearInboxReadStateForOwner(ownerJid: string): void {
  if (!ownerJid.trim()) return;
  const all = loadAll();
  const oKey = ownerKey(ownerJid);
  if (!all.byOwner[oKey]) return;
  const next = { ...all.byOwner };
  delete next[oKey];
  saveAll({ byOwner: next });
}
