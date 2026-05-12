import { initReactI18next } from 'react-i18next';
import i18n from '@/app/i18nCore';
import { getPreferredLocaleFromBrowser, isLocale, type Locale } from '@/app/i18nLocales';

const localeModules = {
  en: () => import('@/locales/en.json'),
  es: () => import('@/locales/es.json'),
} as const;

function initialLocaleFromPath(): Locale | null {
  if (typeof window === 'undefined') return null;
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : null;
}

/**
 * Un solo locale en el primer request (chunk pequeño); el otro en segundo plano.
 */
export async function initI18n(): Promise<void> {
  if (i18n.isInitialized) {
    return;
  }

  const lng = initialLocaleFromPath() ?? getPreferredLocaleFromBrowser();
  const other: Locale = lng === 'es' ? 'en' : 'es';

  const first = await localeModules[lng]();

  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    resources: {
      [lng]: { translation: first.default as Record<string, unknown> },
    },
  });

  void localeModules[other]().then((m) => {
    i18n.addResourceBundle(other, 'translation', m.default as Record<string, unknown>, true, true);
  });
}
