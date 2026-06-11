export type AppThemeMode = 'light' | 'dark';

export const APP_THEME_STORAGE_KEY = 'vado-app-theme-mode';
export const APP_THEME_CHANGE_EVENT = 'vado-app-theme-change';

function readThemeFromLocalStorage(): AppThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = window.localStorage.getItem(APP_THEME_STORAGE_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    /* private mode / quota */
  }
  return 'light';
}

/** Tema persistido del panel (localStorage). */
export function getStoredAppTheme(): AppThemeMode {
  return readThemeFromLocalStorage();
}

export function setStoredAppTheme(mode: AppThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(APP_THEME_CHANGE_EVENT));
}
