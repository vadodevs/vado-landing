import { clearWhatsappInboxSession } from '@/lib/inboxWhatsappSessionCache';
import { clearInboxReadStateForOwner } from '@/lib/inboxReadState';
import { releaseAllInboxContactAvatarUrls } from '@/lib/inboxContactAvatar';
import { notifyInboxAccountAvatarChanged, releaseInboxAccountAvatarUrl } from '@/lib/inboxAccountAvatar';

export const WHATSAPP_LINK_CHANGE_EVENT = 'inbox:whatsapp-link-changed';

export type WhatsappLinkChangeDetail = {
  linked: boolean;
  ownerJid?: string;
};

export function notifyWhatsappLinkChanged(detail: WhatsappLinkChangeDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(WHATSAPP_LINK_CHANGE_EVENT, { detail }));
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
