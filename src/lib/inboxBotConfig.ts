export type BotConversationTone = 'natural' | 'formal' | 'friendly' | 'professional';

export type BotResponseLength = 'concise' | 'balanced' | 'detailed';

export type BotLanguageMode = 'auto' | 'es' | 'en';

export type BotOffTopicStrictness = 'relaxed' | 'balanced' | 'strict';

export type InboxBotConfig = {
  enabled: boolean;
  displayName: string;
  conversationTone: BotConversationTone;
  language: BotLanguageMode;
  responseLength: BotResponseLength;
  useEmoji: boolean;
  signOffWithName: boolean;
  askCompanyBeforeDetails: boolean;
  offTopicStrictness: BotOffTopicStrictness;
  customGreeting: string;
};

const STORAGE_KEY = 'vado.admin.inboxBot.v1';

export const INBOX_BOT_CONFIG_CHANGE_EVENT = 'vado-inbox-bot-config-change';

export const BOT_CONVERSATION_TONES: BotConversationTone[] = [
  'natural',
  'formal',
  'friendly',
  'professional',
];

export const BOT_RESPONSE_LENGTHS: BotResponseLength[] = ['concise', 'balanced', 'detailed'];

export const BOT_LANGUAGE_MODES: BotLanguageMode[] = ['auto', 'es', 'en'];

export const BOT_OFF_TOPIC_STRICTNESS: BotOffTopicStrictness[] = [
  'relaxed',
  'balanced',
  'strict',
];

export const DEFAULT_INBOX_BOT_CONFIG: InboxBotConfig = {
  enabled: true,
  displayName: 'Asistente Vado',
  conversationTone: 'natural',
  language: 'auto',
  responseLength: 'balanced',
  useEmoji: true,
  signOffWithName: true,
  askCompanyBeforeDetails: true,
  offTopicStrictness: 'balanced',
  customGreeting: '',
};

function isTone(x: unknown): x is BotConversationTone {
  return typeof x === 'string' && (BOT_CONVERSATION_TONES as readonly string[]).includes(x);
}

function isLength(x: unknown): x is BotResponseLength {
  return typeof x === 'string' && (BOT_RESPONSE_LENGTHS as readonly string[]).includes(x);
}

function isLanguage(x: unknown): x is BotLanguageMode {
  return typeof x === 'string' && (BOT_LANGUAGE_MODES as readonly string[]).includes(x);
}

function isStrictness(x: unknown): x is BotOffTopicStrictness {
  return typeof x === 'string' && (BOT_OFF_TOPIC_STRICTNESS as readonly string[]).includes(x);
}

function parseConfig(raw: unknown): InboxBotConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_INBOX_BOT_CONFIG };
  const o = raw as Record<string, unknown>;

  return {
    enabled: o.enabled !== false,
    displayName:
      typeof o.displayName === 'string' && o.displayName.trim()
        ? o.displayName.trim().slice(0, 48)
        : DEFAULT_INBOX_BOT_CONFIG.displayName,
    conversationTone: isTone(o.conversationTone)
      ? o.conversationTone
      : DEFAULT_INBOX_BOT_CONFIG.conversationTone,
    language: isLanguage(o.language) ? o.language : DEFAULT_INBOX_BOT_CONFIG.language,
    responseLength: isLength(o.responseLength)
      ? o.responseLength
      : DEFAULT_INBOX_BOT_CONFIG.responseLength,
    useEmoji: o.useEmoji !== false,
    signOffWithName: o.signOffWithName !== false,
    askCompanyBeforeDetails: o.askCompanyBeforeDetails !== false,
    offTopicStrictness: isStrictness(o.offTopicStrictness)
      ? o.offTopicStrictness
      : DEFAULT_INBOX_BOT_CONFIG.offTopicStrictness,
    customGreeting:
      typeof o.customGreeting === 'string' ? o.customGreeting.trim().slice(0, 500) : '',
  };
}

export function loadInboxBotConfig(): InboxBotConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_INBOX_BOT_CONFIG };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INBOX_BOT_CONFIG };
    return parseConfig(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_INBOX_BOT_CONFIG };
  }
}

export function saveInboxBotConfig(config: InboxBotConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(INBOX_BOT_CONFIG_CHANGE_EVENT));
  } catch {
    /* quota / private mode */
  }
}
