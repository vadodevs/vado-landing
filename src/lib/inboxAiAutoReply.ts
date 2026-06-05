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
  return autopilot.enabled && bot.enabled && isInboxAutopilotActiveNow(autopilot, at);
}
