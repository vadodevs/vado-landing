import type { TFunction } from 'i18next';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Nunca mostrar lid, JIDs ni IDs largos en la lista de chats. */
export function isTechnicalInboxLabel(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  if (v.includes('@lid') || v.includes('lid:') || v.includes('@g.us')) return true;
  if (v.includes('wrong jid') || v.includes('s.whatsapp.net')) return true;
  if (/^g:\d+$/.test(v.replace(/\s/g, ''))) return true;
  const d = digitsOnly(v);
  if (d.length >= 11 && d.length === v.replace(/[\s+()-]/g, '').length) return true;
  if (/^\d{11,20}$/.test(d) && !v.includes('+') && !/\s/.test(v)) return true;
  return false;
}

function formatPhoneFromExternalId(externalId: string): string | null {
  const digits = externalId.replace(/^g:/, '').replace(/^lid:/, '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  if (digits.length === 12 && digits.startsWith('52')) {
    return `+52 ${digits.slice(2, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export function formatInboxContactName(
  contactName: string | null | undefined,
  externalId: string,
  t: TFunction,
): string {
  const raw = contactName?.trim() ?? '';
  if (raw && !isTechnicalInboxLabel(raw)) return raw;

  const phone = formatPhoneFromExternalId(externalId);
  if (phone) return phone;

  if (externalId.startsWith('g:')) {
    return t('adminCanales.inboxGroupFallback');
  }

  return t('adminCanales.inboxUnknownContact');
}

const PREVIEW_MEDIA: Record<string, string> = {
  '[imagen]': 'inboxPreviewPhoto',
  '[video]': 'inboxPreviewVideo',
  '[audio]': 'inboxPreviewAudio',
  '[documento]': 'inboxPreviewDocument',
  '[sticker]': 'inboxPreviewSticker',
  foto: 'inboxPreviewPhoto',
  video: 'inboxPreviewVideo',
  audio: 'inboxPreviewAudio',
  documento: 'inboxPreviewDocument',
  sticker: 'inboxPreviewSticker',
};

export function formatInboxMessagePreview(
  preview: string | null | undefined,
  t: TFunction,
): string | undefined {
  if (!preview?.trim()) return undefined;
  const text = preview.trim();
  const mediaKey = PREVIEW_MEDIA[text.toLowerCase()];
  if (mediaKey) {
    return t(`adminCanales.${mediaKey}`);
  }
  if (isTechnicalInboxLabel(text)) return undefined;
  if (/@\w+\.\w+/.test(text) && text.length < 80) return undefined;
  return text;
}
