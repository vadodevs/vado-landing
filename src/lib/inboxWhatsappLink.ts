import { clearWhatsappInboxSession } from '@/lib/inboxWhatsappSessionCache';
import { clearInboxReadStateForOwner } from '@/lib/inboxReadState';
import { notifyInboxAccountAvatarChanged, releaseInboxAccountAvatarUrl } from '@/lib/inboxAccountAvatar';

export const WHATSAPP_LINK_CHANGE_EVENT = 'inbox:whatsapp-link-changed';

export type WhatsappLinkChangeDetail = {
  linked: boolean;
  ownerJid?: string;
  
  importHistory?: boolean;
  
  reloadInbox?: boolean;
};

export function notifyWhatsappLinkChanged(detail: WhatsappLinkChangeDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WHATSAPP_LINK_CHANGE_EVENT, { detail }));
}

const WHATSAPP_HISTORY_IMPORT_DEDUPE_MS = 5 * 60_000;
const WHATSAPP_HISTORY_IMPORT_KEY = 'vado.whatsapp.history-import';


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


export function purgeWhatsappInboxLocalState(ownerJid = ''): void {
  clearWhatsappInboxSession();
  if (ownerJid.trim()) {
    clearInboxReadStateForOwner(ownerJid);
  }
  releaseInboxAccountAvatarUrl();
  notifyInboxAccountAvatarChanged('');
}
