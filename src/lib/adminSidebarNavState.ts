const CHANNELS_OPEN_KEY = 'vado.admin.sidebar.channelsOpen.v1';
const LEADS_OPEN_KEY = 'vado.admin.sidebar.leadsOpen.v1';
const SETTINGS_OPEN_KEY = 'vado.admin.sidebar.settingsOpen.v1';
const SIDEBAR_SCROLL_KEY = 'vado.admin.sidebar.scrollTop.v1';

export function readAdminChannelsNavOpen(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(CHANNELS_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdminChannelsNavOpen(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHANNELS_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function readAdminLeadsNavOpen(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = sessionStorage.getItem(LEADS_OPEN_KEY);
    if (raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

export function writeAdminLeadsNavOpen(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LEADS_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function readAdminSettingsNavOpen(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SETTINGS_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdminSettingsNavOpen(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SETTINGS_OPEN_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function readAdminSidebarScrollTop(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeAdminSidebarScrollTop(scrollTop: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(Math.max(0, Math.round(scrollTop))));
  } catch {
    /* ignore */
  }
}
