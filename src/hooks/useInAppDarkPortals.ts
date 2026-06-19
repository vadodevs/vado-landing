import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { APP_THEME_CHANGE_EVENT, getStoredAppTheme } from '@/lib/appTheme';


export function useInAppDarkPortals(): boolean {
  const [path] = useLocation();
  const [dark, setDark] = useState(() =>
    typeof window === 'undefined' ? false : getStoredAppTheme() === 'dark',
  );

  useEffect(() => {
    const sync = () => setDark(getStoredAppTheme() === 'dark');
    window.addEventListener(APP_THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_THEME_CHANGE_EVENT, sync);
  }, []);

  const inAppShell = /\/app\//.test(path);
  return dark && inAppShell;
}
