import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const supportedLngs = ['en', 'es'] as const
export type Locale = (typeof supportedLngs)[number]

export function isLocale(lang: string): lang is Locale {
  return supportedLngs.includes(lang as Locale)
}

export const defaultLocale: Locale = 'es'

i18n.use(initReactI18next).init({
  lng: defaultLocale,
  fallbackLng: 'en',
  supportedLngs: [...supportedLngs],
  resources: {
    en: { translation: en as Record<string, unknown> },
    es: { translation: es as Record<string, unknown> },
  },
})

export default i18n
