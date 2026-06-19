export type InboxLlmProviderId = 'anthropic' | 'ollama';

export type InboxLlmConfig = {
  provider: InboxLlmProviderId;
  model: string;
};

export const INBOX_LLM_CONFIG_CHANGE_EVENT = 'vado-inbox-llm-config-change';

export const DEFAULT_INBOX_LLM_CONFIG: InboxLlmConfig = {
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
};

let cachedLlmConfig: InboxLlmConfig = { ...DEFAULT_INBOX_LLM_CONFIG };

export function normalizeLlmProvider(raw: unknown): InboxLlmProviderId {
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return v === 'ollama' || v === 'local' ? 'ollama' : 'anthropic';
}

export function parseInboxLlmConfig(raw: unknown): InboxLlmConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_INBOX_LLM_CONFIG };
  const o = raw as Record<string, unknown>;
  const provider = normalizeLlmProvider(o.provider);
  const model =
    typeof o.model === 'string' && o.model.trim()
      ? o.model.trim().slice(0, 128)
      : DEFAULT_INBOX_LLM_CONFIG.model;
  return { provider, model };
}

export function loadInboxLlmConfig(): InboxLlmConfig {
  return { ...cachedLlmConfig };
}

export function setInboxLlmConfigCache(config: InboxLlmConfig): void {
  cachedLlmConfig = parseInboxLlmConfig(config);
}

export function saveInboxLlmConfig(config: InboxLlmConfig): void {
  cachedLlmConfig = parseInboxLlmConfig(config);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(INBOX_LLM_CONFIG_CHANGE_EVENT));
  }
}

export type InboxLlmModelOption = { id: string; label: string };

export type InboxLlmProviderOption = {
  id: InboxLlmProviderId;
  label: string;
  available: boolean;
  unavailableReason: string | null;
  models: InboxLlmModelOption[];
};

export type InboxLlmOptionsResponse = {
  providers: InboxLlmProviderOption[];
  active: InboxLlmConfig;
};
