const supportedLngs = ['en', 'es'] as const;
export type Locale = (typeof supportedLngs)[number];

export function isLocale(lang: string): lang is Locale {
  return supportedLngs.includes(lang as Locale);
}

export const defaultLocale: Locale = 'es';

export function getPreferredLocaleFromBrowser(): Locale {
  if (typeof navigator === 'undefined') return defaultLocale;
  const languages = navigator.languages?.length
    ? navigator.languages
    : navigator.language
      ? [navigator.language]
      : [];
  for (const raw of languages) {
    const code = raw.split('-')[0].toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}
