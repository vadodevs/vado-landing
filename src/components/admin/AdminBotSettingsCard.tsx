import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { scheduleInboxAiSettingsSync } from '@/lib/inboxAiSettingsSync';
import { fetchInboxAiSettings, fetchInboxLlmOptions } from '@/lib/inboxAiSettingsApi';
import { AdminSelect } from '@/components/app/AdminSelect';
import {
  SettingsCollapsibleCard,
  settingsIconToggleClass,
} from '@/components/settings/settings-ui';
import {
  DEFAULT_INBOX_LLM_CONFIG,
  loadInboxLlmConfig,
  parseInboxLlmConfig,
  saveInboxLlmConfig,
  type InboxLlmConfig,
  type InboxLlmProviderId,
  type InboxLlmProviderOption,
} from '@/lib/inboxLlmConfig';
import {
  loadInboxAutopilotConfig,
  saveInboxAutopilotConfig,
} from '@/lib/inboxAutopilotConfig';
import {
  BOT_CONVERSATION_TONES,
  BOT_LANGUAGE_MODES,
  BOT_OFF_TOPIC_STRICTNESS,
  BOT_RESPONSE_LENGTHS,
  DEFAULT_INBOX_BOT_CONFIG,
  type BotConversationTone,
  type BotLanguageMode,
  type BotOffTopicStrictness,
  type BotResponseLength,
  type InboxBotConfig,
  loadInboxBotConfig,
  saveInboxBotConfig,
} from '@/lib/inboxBotConfig';

const TONE_I18N: Record<BotConversationTone, string> = {
  natural: 'adminSettings.botToneNatural',
  formal: 'adminSettings.botToneFormal',
  friendly: 'adminSettings.botToneFriendly',
  professional: 'adminSettings.botToneProfessional',
};

const TONE_HINT_I18N: Record<BotConversationTone, string> = {
  natural: 'adminSettings.botToneNaturalHint',
  formal: 'adminSettings.botToneFormalHint',
  friendly: 'adminSettings.botToneFriendlyHint',
  professional: 'adminSettings.botToneProfessionalHint',
};

const LENGTH_I18N: Record<BotResponseLength, string> = {
  concise: 'adminSettings.botLengthConcise',
  balanced: 'adminSettings.botLengthBalanced',
  detailed: 'adminSettings.botLengthDetailed',
};

const LANGUAGE_I18N: Record<BotLanguageMode, string> = {
  auto: 'adminSettings.botLangAuto',
  es: 'adminSettings.botLangEs',
  en: 'adminSettings.botLangEn',
};

const STRICTNESS_I18N: Record<BotOffTopicStrictness, string> = {
  relaxed: 'adminSettings.botStrictRelaxed',
  balanced: 'adminSettings.botStrictBalanced',
  strict: 'adminSettings.botStrictStrict',
};

const PREVIEW_I18N: Record<BotConversationTone, string> = {
  natural: 'adminSettings.botPreviewNatural',
  formal: 'adminSettings.botPreviewFormal',
  friendly: 'adminSettings.botPreviewFriendly',
  professional: 'adminSettings.botPreviewProfessional',
};

export function AdminBotSettingsCard() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<InboxBotConfig>(() => loadInboxBotConfig());
  const [llmConfig, setLlmConfig] = useState<InboxLlmConfig>(() => loadInboxLlmConfig());
  const [llmProviders, setLlmProviders] = useState<InboxLlmProviderOption[]>([]);
  const [llmOptionsError, setLlmOptionsError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    void (async () => {
      const [settingsRes, optionsRes] = await Promise.all([
        fetchInboxAiSettings(),
        fetchInboxLlmOptions(),
      ]);
      if (settingsRes.ok && settingsRes.data.llm) {
        const parsed = parseInboxLlmConfig(settingsRes.data.llm);
        setLlmConfig(parsed);
        saveInboxLlmConfig(parsed);
      }
      if (optionsRes.ok) {
        setLlmProviders(optionsRes.data.providers);
        setLlmOptionsError(null);
        const active = parseInboxLlmConfig(optionsRes.data.active);
        setLlmConfig((prev) => (prev.model ? prev : active));
      } else if (optionsRes.reason === 'http') {
        setLlmOptionsError(optionsRes.message ?? t('adminSettings.botLlmOptionsError'));
      }
    })();
  }, [t]);

  useEffect(() => {
    saveInboxBotConfig(config);
    saveInboxLlmConfig(llmConfig);
    let autopilot = loadInboxAutopilotConfig();
    if (config.enabled && !autopilot.channels.whatsapp) {
      autopilot = {
        ...autopilot,
        channels: { ...autopilot.channels, whatsapp: true },
      };
      saveInboxAutopilotConfig(autopilot);
    }
    scheduleInboxAiSettingsSync({ bot: config, autopilot, llm: llmConfig });
    setSavedFlash(true);
    const timer = window.setTimeout(() => setSavedFlash(false), 2000);
    return () => window.clearTimeout(timer);
  }, [config, llmConfig]);

  const patch = (partial: Partial<InboxBotConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetDefaults = () => {
    setConfig({ ...DEFAULT_INBOX_BOT_CONFIG });
    setLlmConfig({ ...DEFAULT_INBOX_LLM_CONFIG });
  };

  const activeLlmProvider =
    llmProviders.find((p) => p.id === llmConfig.provider) ??
    llmProviders.find((p) => p.available) ??
    null;

  const llmModelOptions = useMemo(
    () =>
      (activeLlmProvider?.models ?? []).map((m) => ({
        value: m.id,
        label: m.label,
      })),
    [activeLlmProvider],
  );

  const patchLlm = (partial: Partial<InboxLlmConfig>) => {
    setLlmConfig((prev) => {
      const next = { ...prev, ...partial };
      if (partial.provider && partial.provider !== prev.provider) {
        const providerMeta = llmProviders.find((p) => p.id === partial.provider);
        const firstModel = providerMeta?.models[0]?.id;
        if (firstModel) next.model = firstModel;
      }
      return next;
    });
  };

  const llmProviderIds: InboxLlmProviderId[] = ['anthropic', 'ollama'];

  const previewText = useMemo(
    () =>
      t(PREVIEW_I18N[config.conversationTone], {
        name: config.displayName || DEFAULT_INBOX_BOT_CONFIG.displayName,
      }),
    [config.conversationTone, config.displayName, t],
  );

  const greetingPreview =
    config.customGreeting.trim() ||
    t('adminSettings.botGreetingDefault', {
      name: config.displayName || DEFAULT_INBOX_BOT_CONFIG.displayName,
    });

  return (
    <SettingsCollapsibleCard
      id="bot-config"
      icon={MessageSquareText}
      title={t('adminSettings.botTitle')}
      badge={
        <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
          {t('adminSettings.botMockBadge')}
        </Badge>
      }
      description={t('adminSettings.botSubtitle')}
      action={
        <Switch
          id="bot-config-enabled"
          checked={config.enabled}
          onCheckedChange={(v) => patch({ enabled: v })}
          aria-label={t('adminSettings.botEnabledLabel')}
        />
      }
    >
      <div className="space-y-3">
        <fieldset
          disabled={!config.enabled}
          className="space-y-3 disabled:pointer-events-none disabled:opacity-55"
        >
          <div className="space-y-1.5">
            <Label htmlFor="bot-display-name">{t('adminSettings.botDisplayNameLabel')}</Label>
            <Input
              id="bot-display-name"
              value={config.displayName}
              onChange={(e) => patch({ displayName: e.target.value })}
              maxLength={48}
              placeholder={DEFAULT_INBOX_BOT_CONFIG.displayName}
              className="h-9 max-w-md"
            />
            <p className="text-xs text-muted-foreground">{t('adminSettings.botDisplayNameHint')}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {t('adminSettings.botLlmTitle')}
            </p>
            <p className="text-xs text-muted-foreground">{t('adminSettings.botLlmHint')}</p>
            <div className="flex flex-wrap gap-2">
              {llmProviderIds.map((providerId) => {
                const meta = llmProviders.find((p) => p.id === providerId);
                const on = llmConfig.provider === providerId;
                const disabled = meta != null && !meta.available;
                return (
                  <button
                    key={providerId}
                    type="button"
                    disabled={disabled}
                    onClick={() => patchLlm({ provider: providerId })}
                    className={cn(
                      settingsIconToggleClass(on),
                      disabled && 'cursor-not-allowed opacity-45',
                    )}
                    aria-pressed={on}
                    title={meta?.unavailableReason ?? undefined}
                  >
                    {providerId === 'anthropic'
                      ? t('adminSettings.botLlmProviderAnthropic')
                      : t('adminSettings.botLlmProviderOllama')}
                  </button>
                );
              })}
            </div>

            {activeLlmProvider && !activeLlmProvider.available && activeLlmProvider.unavailableReason ? (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {activeLlmProvider.unavailableReason}
              </p>
            ) : null}

            {llmModelOptions.length > 0 ? (
              <div className="max-w-md space-y-1.5">
                <Label htmlFor="bot-llm-model">{t('adminSettings.botLlmModelLabel')}</Label>
                <AdminSelect
                  id="bot-llm-model"
                  value={llmConfig.model}
                  onValueChange={(model) => patchLlm({ model })}
                  options={llmModelOptions}
                  aria-label={t('adminSettings.botLlmModelLabel')}
                  triggerClassName="h-9 w-full max-w-md"
                />
              </div>
            ) : null}

            {llmOptionsError ? (
              <p className="text-xs text-red-700 dark:text-red-400">{llmOptionsError}</p>
            ) : null}

            <p className="text-xs text-muted-foreground">
              {t('adminSettings.botLlmActive', {
                provider:
                  llmConfig.provider === 'ollama'
                    ? t('adminSettings.botLlmProviderOllama')
                    : t('adminSettings.botLlmProviderAnthropic'),
                model: llmConfig.model,
              })}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t('adminSettings.botToneLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {BOT_CONVERSATION_TONES.map((tone) => {
                const on = config.conversationTone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => patch({ conversationTone: tone })}
                    className={settingsIconToggleClass(on)}
                    aria-pressed={on}
                    title={t(TONE_HINT_I18N[tone])}
                  >
                    {t(TONE_I18N[tone])}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t(TONE_HINT_I18N[config.conversationTone])}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t('adminSettings.botLanguageLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {BOT_LANGUAGE_MODES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => patch({ language: lang })}
                    className={settingsIconToggleClass(config.language === lang)}
                    aria-pressed={config.language === lang}
                  >
                    {t(LANGUAGE_I18N[lang])}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {t('adminSettings.botLengthLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {BOT_RESPONSE_LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => patch({ responseLength: len })}
                    className={settingsIconToggleClass(config.responseLength === len)}
                    aria-pressed={config.responseLength === len}
                  >
                    {t(LENGTH_I18N[len])}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t('adminSettings.botStrictnessLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {BOT_OFF_TOPIC_STRICTNESS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => patch({ offTopicStrictness: level })}
                  className={settingsIconToggleClass(config.offTopicStrictness === level)}
                  aria-pressed={config.offTopicStrictness === level}
                >
                  {t(STRICTNESS_I18N[level])}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t('adminSettings.botStrictnessHint')}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm text-foreground">{t('adminSettings.botUseEmojiLabel')}</span>
              <Switch
                checked={config.useEmoji}
                onCheckedChange={(v) => patch({ useEmoji: v })}
                aria-label={t('adminSettings.botUseEmojiLabel')}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm text-foreground">{t('adminSettings.botSignOffLabel')}</span>
              <Switch
                checked={config.signOffWithName}
                onCheckedChange={(v) => patch({ signOffWithName: v })}
                aria-label={t('adminSettings.botSignOffLabel')}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
              <div>
                <span className="text-sm text-foreground">
                  {t('adminSettings.botAskCompanyLabel')}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('adminSettings.botAskCompanyHint')}
                </p>
              </div>
              <Switch
                checked={config.askCompanyBeforeDetails}
                onCheckedChange={(v) => patch({ askCompanyBeforeDetails: v })}
                aria-label={t('adminSettings.botAskCompanyLabel')}
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bot-greeting">{t('adminSettings.botGreetingLabel')}</Label>
            <textarea
              id="bot-greeting"
              value={config.customGreeting}
              onChange={(e) => patch({ customGreeting: e.target.value })}
              maxLength={500}
              rows={3}
              placeholder={t('adminSettings.botGreetingPlaceholder')}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full max-w-xl resize-y rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">{t('adminSettings.botGreetingHint')}</p>
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('adminSettings.botPreviewLabel')}
            </p>
            <p className="mt-1.5 text-sm text-foreground">{greetingPreview}</p>
            <p className="mt-1 text-sm text-muted-foreground">{previewText}</p>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            {savedFlash ? t('adminSettings.botSaved') : t('adminSettings.botMockNote')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults}>
            {t('adminSettings.botReset')}
          </Button>
        </div>
      </div>
    </SettingsCollapsibleCard>
  );
}
