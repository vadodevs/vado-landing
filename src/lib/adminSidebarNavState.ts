const CHANNELS_OPEN_KEY = 'vado.admin.sidebar.channelsOpen.v1';

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
