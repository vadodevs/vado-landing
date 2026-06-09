import { clearWhatsappInboxSession } from '@/lib/inboxWhatsappSessionCache';
import { clearInboxReadStateForOwner } from '@/lib/inboxReadState';
import { releaseAllInboxContactAvatarUrls } from '@/lib/inboxContactAvatar';
import { notifyInboxAccountAvatarChanged, releaseInboxAccountAvatarUrl } from '@/lib/inboxAccountAvatar';

export const WHATSAPP_LINK_CHANGE_EVENT = 'inbox:whatsapp-link-changed';

export type WhatsappLinkChangeDetail = {
  linked: boolean;
  ownerJid?: string;
  /** Tras escanear QR: importar historial completo desde Evolution. */
  importHistory?: boolean;
  /** Recargar lista sin volver a importar (p. ej. tras import en Ajustes). */
  reloadInbox?: boolean;
};

export function notifyWhatsappLinkChanged(detail: WhatsappLinkChangeDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WHATSAPP_LINK_CHANGE_EVENT, { detail }));
}

const WHATSAPP_HISTORY_IMPORT_DEDUPE_MS = 5 * 60_000;
const WHATSAPP_HISTORY_IMPORT_KEY = 'vado.whatsapp.history-import';

/** Evita arrancar el mismo import varias veces (Gate + Ajustes + Canales). */
export function shouldKickoffWhatsappHistoryImport(ownerJid: string): boolean {
  if (typeof window === 'undefined') return true;
  const jid = ownerJid.trim() || '_unknown';
  const key = `${WHATSAPP_HISTORY_IMPORT_KEY}.${jid}`;
  const last = sessionStorage.getItem(key);
  const now = Date.now();
  if (last && now - Number(last) < WHATSAPP_HISTORY_IMPORT_DEDUPE_MS) return false;
  sessionStorage.setItem(key, String(now));
  return true;
}

/** Borra chats locales: sin teléfono vinculado no debe quedar nada en pantalla. */
export function purgeWhatsappInboxLocalState(ownerJid = ''): void {
  clearWhatsappInboxSession();
  if (ownerJid.trim()) {
    clearInboxReadStateForOwner(ownerJid);
  }
  releaseAllInboxContactAvatarUrls();
  releaseInboxAccountAvatarUrl();
  notifyInboxAccountAvatarChanged('');
}
