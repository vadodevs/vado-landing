import { useCallback, useLayoutEffect } from 'react'
import { useLocation } from 'wouter'
import i18n, { defaultLocale, isLocale, type Locale } from '@/app/i18n'


export function useLocale(): { locale: Locale; path: (p: string) => string } {
  const [location] = useLocation()
  const segments = location.split('/').filter(Boolean)
  const lang = segments[0] ?? ''
  const locale: Locale = isLocale(lang) ? lang : defaultLocale

  useLayoutEffect(() => {
    i18n.changeLanguage(locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const path = useCallback((p: string) => {
    const normalized = p.startsWith('/') ? p : p ? `/${p}` : ''
    return `/${locale}${normalized}`
  }, [locale])

  return { locale, path }
}


export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean)
  const lang = segments[0]
  return lang && isLocale(lang) ? lang : null
}
