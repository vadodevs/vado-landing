import { saveInboxAiSettings } from '@/lib/inboxAiSettingsApi';
import type { InboxAutopilotConfig } from '@/lib/inboxAutopilotConfig';
import type { InboxBotConfig } from '@/lib/inboxBotConfig';

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Sincroniza configuración mock del panel con adminvado (debounced). */
export function scheduleInboxAiSettingsSync(
  partial: { autopilot?: InboxAutopilotConfig; bot?: InboxBotConfig },
  delayMs = 400,
): void {
  if (typeof window === 'undefined') return;
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void saveInboxAiSettings(partial);
  }, delayMs);
}

export function flushInboxAiSettingsSync(
  partial: { autopilot?: InboxAutopilotConfig; bot?: InboxBotConfig },
): void {
  if (syncTimer) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }
  void saveInboxAiSettings(partial);
}
