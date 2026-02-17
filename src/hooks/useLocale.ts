import { useLocation } from 'wouter'
import { useLayoutEffect } from 'react'
import i18n, { defaultLocale, isLocale, type Locale } from '@/app/i18n'

/**
 * Returns current locale from URL (first segment: /en or /es) and a helper to build localized paths.
 * Syncs i18n language with the URL segment.
 */
export function useLocale(): { locale: Locale; path: (p: string) => string } {
  const [location] = useLocation()
  const segments = location.split('/').filter(Boolean)
  const lang = segments[0] ?? ''
  const locale: Locale = isLocale(lang) ? lang : defaultLocale

  useLayoutEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale])

  const path = (p: string) => {
    const normalized = p.startsWith('/') ? p : p ? `/${p}` : ''
    return `/${locale}${normalized}`
  }

  return { locale, path }
}

/**
 * Get locale from pathname (e.g. /en/foo -> 'en'). Used for redirects and router.
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean)
  const lang = segments[0]
  return lang && isLocale(lang) ? lang : null
}
