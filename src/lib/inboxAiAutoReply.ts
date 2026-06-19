import {
  isInboxAutopilotActiveNow,
  loadInboxAutopilotConfig,
  type InboxAutopilotConfig,
} from '@/lib/inboxAutopilotConfig';
import { loadInboxBotConfig, type InboxBotConfig } from '@/lib/inboxBotConfig';

export function isInboxAiAutoReplyActiveNow(
  autopilot: InboxAutopilotConfig = loadInboxAutopilotConfig(),
  bot: InboxBotConfig = loadInboxBotConfig(),
  at: Date = new Date(),
): boolean {
  if (!bot.enabled) return false;
  if (!autopilot.enabled) return false;
  if (!autopilot.channels.whatsapp) return false;
  return isInboxAutopilotActiveNow(autopilot, at);
}
