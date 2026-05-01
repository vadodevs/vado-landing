export type AppThemeMode = 'light' | 'dark';

export const APP_THEME_STORAGE_KEY = 'vado-app-theme-mode';
export const APP_THEME_CHANGE_EVENT = 'vado-app-theme-change';
let appThemeMemory: AppThemeMode = 'light';

export function getStoredAppTheme(): AppThemeMode {
  return appThemeMemory;
}

export function setStoredAppTheme(mode: AppThemeMode): void {
  appThemeMemory = mode;
  window.dispatchEvent(new CustomEvent(APP_THEME_CHANGE_EVENT));
}
