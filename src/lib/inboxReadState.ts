import {
  clearInboxReadCursorsApi,
  fetchInboxReadCursors,
  markInboxReadCursorApi,
} from '@/lib/adminWorkspaceApi';

type ReadEntry = { lastMessageAtMs: number };

const cursorsByOwner = new Map<string, Record<string, ReadEntry>>();

function ownerKey(ownerJid: string): string {
  const key = ownerJid.trim();
  return key || '_default';
}

function readsForOwner(ownerJid: string): Record<string, ReadEntry> {
  return cursorsByOwner.get(ownerKey(ownerJid)) ?? {};
}

export async function hydrateInboxReadState(ownerJid: string): Promise<void> {
  const owner = ownerKey(ownerJid);
  const rows = await fetchInboxReadCursors(ownerJid);
  const mapped: Record<string, ReadEntry> = {};
  for (const [conversationId, lastMessageAtMs] of Object.entries(rows)) {
    mapped[conversationId] = { lastMessageAtMs };
  }
  cursorsByOwner.set(owner, mapped);
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
  const oKey = ownerKey(ownerJid);
  const prev = cursorsByOwner.get(oKey) ?? {};
  const cur = prev[conversationId]?.lastMessageAtMs ?? 0;
  const nextMs = Math.max(cur, lastMessageAtMs);
  cursorsByOwner.set(oKey, {
    ...prev,
    [conversationId]: { lastMessageAtMs: nextMs },
  });
  void markInboxReadCursorApi(ownerJid, conversationId, nextMs);
}

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
  const oKey = ownerKey(ownerJid);
  cursorsByOwner.delete(oKey);
  void clearInboxReadCursorsApi(ownerJid);
}
