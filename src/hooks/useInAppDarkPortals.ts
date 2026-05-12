import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { APP_THEME_CHANGE_EVENT, getStoredAppTheme } from '@/lib/appTheme';

/**
 * Portales de Radix (dropdown, popover, etc.) se montan en `document.body` y no heredan
 * `.app-dark` del `SidebarProvider`. Cuando el usuario está en rutas `/…/app/…` con tema
 * oscuro, los overlays deben llevar `app-dark` para que `bg-popover` y tokens coincidan.
 */
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
