const CHANNELS_OPEN_KEY = 'vado.admin.sidebar.channelsOpen.v1';
const LEADS_OPEN_KEY = 'vado.admin.sidebar.leadsOpen.v1';

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
