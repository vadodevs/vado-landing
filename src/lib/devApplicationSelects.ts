import type { TFunction } from 'i18next';

/** Mismas claves que el `<select id="…apply-start">` en `ContactForm`. */
export const START_VADO_KEYS = ['inmediato', '1-mes', '2-3-meses', 'mas'] as const;
export type StartVadoKey = (typeof START_VADO_KEYS)[number];

/** Mismas claves que el `<select id="…apply-heard">` en `ContactForm`. */
export const HEARD_VADO_KEYS = ['linkedin', 'referido', 'web', 'otro'] as const;
export type HeardVadoKey = (typeof HEARD_VADO_KEYS)[number];

export function labelForStartVado(key: StartVadoKey, t: TFunction): string {
  const map: Record<StartVadoKey, string> = {
    inmediato: t('home.ctaContact.applyForm.immediately'),
    '1-mes': `1 ${t('home.ctaContact.applyForm.month')}`,
    '2-3-meses': `2-3 ${t('home.ctaContact.applyForm.months')}`,
    mas: t('home.ctaContact.applyForm.moreThan3Months'),
  };
  return map[key];
}

export function labelForHeardVado(key: HeardVadoKey, t: TFunction): string {
  const map: Record<HeardVadoKey, string> = {
    linkedin: t('home.ctaContact.applyForm.heardLinkedIn'),
    referido: t('home.ctaContact.applyForm.heardReferral'),
    web: t('home.ctaContact.applyForm.heardWeb'),
    otro: t('home.ctaContact.subjectOptions.otros'),
  };
  return map[key];
}

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Textos demo u otros valores viejos → clave del select (alineado al contacto). */
function legacyStartKey(stored: string): StartVadoKey | undefined {
  const n = norm(stored);
  if (n === 'inmediata' || n === 'immediate') return 'inmediato';
  if (n.includes('semana') || n === '1 mes') return '1-mes';
  if (n.includes('2-3') || n.includes('2 a 3')) return '2-3-meses';
  if (n.includes('mas de 3') || n.includes('más de 3')) return 'mas';
  return undefined;
}

function legacyHeardKey(stored: string): HeardVadoKey | undefined {
  const n = norm(stored);
  if (n.includes('linkedin')) return 'linkedin';
  if (n.includes('refer') || n.includes('recomend')) return 'referido';
  if (n.includes('sitio') || n.includes('web') || n.includes('pagina')) return 'web';
  if (n.includes('evento') || n.includes('otro')) return 'otro';
  return undefined;
}

export function matchStartKeyFromStored(stored: string, t: TFunction): StartVadoKey | '' {
  const s = stored.trim();
  if (!s) return '';
  const fromLegacy = legacyStartKey(s);
  if (fromLegacy) return fromLegacy;
  for (const key of START_VADO_KEYS) {
    if (labelForStartVado(key, t) === s) return key;
  }
  return '';
}

export function matchHeardKeyFromStored(stored: string, t: TFunction): HeardVadoKey | '' {
  const s = stored.trim();
  if (!s) return '';
  const fromLegacy = legacyHeardKey(s);
  if (fromLegacy) return fromLegacy;
  for (const key of HEARD_VADO_KEYS) {
    if (labelForHeardVado(key, t) === s) return key;
  }
  return '';
}
