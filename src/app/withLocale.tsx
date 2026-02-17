import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLocale } from '@/app/i18n';
import { defaultLocale } from '@/app/i18n';

/**
 * Wraps a component so it only renders when the current path has a valid locale (en|es).
 * Redirects to /es when the first segment is not a supported locale.
 */
export function withLocale<P extends object>(Component: React.ComponentType<P>) {
  return function WithLocale(props: P) {
    const [location, setLocation] = useLocation();
    const segments = location.split('/').filter(Boolean);
    const lang = segments[0];

    useEffect(() => {
      if (!lang || !isLocale(lang)) {
        setLocation(`/${defaultLocale}`);
      }
    }, [lang, setLocation]);

    if (!lang || !isLocale(lang)) {
      return null;
    }

    return <Component {...props} />;
  };
}
