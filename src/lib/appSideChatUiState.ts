const SIDE_CHAT_OPEN_KEY = 'vado.app.sideChat.open.v1';
const MD_MIN = 768;

export function defaultSideChatOpen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= MD_MIN;
}

export function readSideChatOpen(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SIDE_CHAT_OPEN_KEY);
    if (raw === null) return null;
    return raw === '1';
  } catch {
    return null;
  }
}

export function writeSideChatOpen(open: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SIDE_CHAT_OPEN_KEY, open ? '1' : '0');
  } catch {}
}

export function resolveInitialSideChatOpen(): boolean {
  return readSideChatOpen() ?? defaultSideChatOpen();
}
