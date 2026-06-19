import type { TFunction } from 'i18next';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}


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

function isDigitsOnlyLabel(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length === value.replace(/[\s+()-]/g, '').length;
}


export function formatInboxPhoneDisplay(digits: string): string | null {
  const d = digits.replace(/\D/g, '');
  if (d.length < 10 || d.length > 15) return null;
  if (d.length === 12 && d.startsWith('52')) {
    return `+52 ${d.slice(2, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  if (d.length === 11 && d.startsWith('1')) {
    return `+1 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  return `+${d}`;
}

function phoneTitleFromExternalId(externalId: string): string | null {
  const id = externalId.trim();
  if (!/^\d{10,15}$/.test(id)) return null;
  return formatInboxPhoneDisplay(id);
}

export function formatInboxContactName(
  contactName: string | null | undefined,
  externalId: string,
  t: TFunction,
): string {
  const raw = contactName?.trim() ?? '';
  if (raw && !isTechnicalInboxLabel(raw) && !isDigitsOnlyLabel(raw)) {
    const lower = raw.toLowerCase();
    if (lower !== 'contacto' && lower !== 'grupo') return raw;
  }

  const phone = phoneTitleFromExternalId(externalId);
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
