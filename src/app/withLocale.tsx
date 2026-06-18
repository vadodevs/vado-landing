import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLocale, getPreferredLocaleFromBrowser } from '@/app/i18n';


export function withLocale<P extends object>(Component: React.ComponentType<P>) {
  return function WithLocale(props: P) {
    const [location, setLocation] = useLocation();
    const segments = location.split('/').filter(Boolean);
    const lang = segments[0];

    useEffect(() => {
      if (!lang || !isLocale(lang)) {
        setLocation(`/${getPreferredLocaleFromBrowser()}`);
      }
    }, [lang, setLocation]);

    if (!lang || !isLocale(lang)) {
      return null;
    }

    return <Component {...props} />;
  };
}
