export type AppThemeMode = 'light' | 'dark';

export const APP_THEME_CHANGE_EVENT = 'vado-app-theme-change';

let cachedTheme: AppThemeMode = 'light';
let themeHydrated = false;

export function getCachedAppTheme(): AppThemeMode {
  return cachedTheme;
}

export function isAppThemeHydrated(): boolean {
  return themeHydrated;
}

export function setCachedAppTheme(mode: AppThemeMode): void {
  cachedTheme = mode === 'dark' ? 'dark' : 'light';
  themeHydrated = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APP_THEME_CHANGE_EVENT));
  }
}

export function getStoredAppTheme(): AppThemeMode {
  return cachedTheme;
}

export function setStoredAppTheme(mode: AppThemeMode): void {
  setCachedAppTheme(mode);
}
