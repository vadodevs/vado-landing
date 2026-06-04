import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
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

function optionButtonClass(selected: boolean): string {
  return cn(
    'rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
    selected
      ? 'border-violet-600/40 bg-violet-600 text-white shadow-sm dark:border-violet-500/50'
      : 'border-border bg-background text-muted-foreground hover:bg-muted/60',
  );
}

export function AdminBotSettingsCard() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<InboxBotConfig>(() => loadInboxBotConfig());
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveInboxBotConfig(config);
    setSavedFlash(true);
    const timer = window.setTimeout(() => setSavedFlash(false), 2000);
    return () => window.clearTimeout(timer);
  }, [config]);

  const patch = (partial: Partial<InboxBotConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetDefaults = () => {
    setConfig({ ...DEFAULT_INBOX_BOT_CONFIG });
  };

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
    <div
      id="bot-config"
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 pb-7 shadow-sm md:p-6 md:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
            <MessageSquareText className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t('adminSettings.botTitle')}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                <Sparkles className="size-3" aria-hidden />
                {t('adminSettings.botMockBadge')}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t('adminSettings.botSubtitle')}</p>
          </div>
        </div>

        <div
          className={cn(
            'flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 sm:min-w-[11rem]',
            config.enabled
              ? 'border-violet-500/30 bg-violet-500/5 dark:border-violet-500/25 dark:bg-violet-500/10'
              : 'border-border bg-muted/40',
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {t('adminSettings.botEnabledLabel')}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              {config.enabled
                ? t('adminSettings.botStatusOn')
                : t('adminSettings.botStatusOff')}
            </p>
          </div>
          <Switch
            id="bot-config-enabled"
            checked={config.enabled}
            onCheckedChange={(v) => patch({ enabled: v })}
            aria-label={t('adminSettings.botEnabledLabel')}
          />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <fieldset
          disabled={!config.enabled}
          className="space-y-5 disabled:pointer-events-none disabled:opacity-55"
        >
          <div className="space-y-1.5">
            <Label htmlFor="bot-display-name">{t('adminSettings.botDisplayNameLabel')}</Label>
            <Input
              id="bot-display-name"
              value={config.displayName}
              onChange={(e) => patch({ displayName: e.target.value })}
              maxLength={48}
              placeholder={DEFAULT_INBOX_BOT_CONFIG.displayName}
              className="h-10 max-w-md"
            />
            <p className="text-xs text-muted-foreground">{t('adminSettings.botDisplayNameHint')}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
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
                    className={optionButtonClass(on)}
                    aria-pressed={on}
                    title={t(TONE_HINT_I18N[tone])}
                  >
                    {t(TONE_I18N[tone])}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t(TONE_HINT_I18N[config.conversationTone])}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {t('adminSettings.botLanguageLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {BOT_LANGUAGE_MODES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => patch({ language: lang })}
                    className={optionButtonClass(config.language === lang)}
                    aria-pressed={config.language === lang}
                  >
                    {t(LANGUAGE_I18N[lang])}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {t('adminSettings.botLengthLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {BOT_RESPONSE_LENGTHS.map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => patch({ responseLength: len })}
                    className={optionButtonClass(config.responseLength === len)}
                    aria-pressed={config.responseLength === len}
                  >
                    {t(LENGTH_I18N[len])}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t('adminSettings.botStrictnessLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {BOT_OFF_TOPIC_STRICTNESS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => patch({ offTopicStrictness: level })}
                  className={optionButtonClass(config.offTopicStrictness === level)}
                  aria-pressed={config.offTopicStrictness === level}
                >
                  {t(STRICTNESS_I18N[level])}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('adminSettings.botStrictnessHint')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-medium text-foreground">
                {t('adminSettings.botUseEmojiLabel')}
              </span>
              <Switch
                checked={config.useEmoji}
                onCheckedChange={(v) => patch({ useEmoji: v })}
                aria-label={t('adminSettings.botUseEmojiLabel')}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3">
              <span className="text-sm font-medium text-foreground">
                {t('adminSettings.botSignOffLabel')}
              </span>
              <Switch
                checked={config.signOffWithName}
                onCheckedChange={(v) => patch({ signOffWithName: v })}
                aria-label={t('adminSettings.botSignOffLabel')}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3 sm:col-span-2">
              <div>
                <span className="text-sm font-medium text-foreground">
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

          <div className="rounded-xl border border-dashed border-violet-500/25 bg-violet-500/5 px-4 py-3 dark:border-violet-500/20 dark:bg-violet-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              {t('adminSettings.botPreviewLabel')}
            </p>
            <p className="mt-2 text-sm text-foreground">{greetingPreview}</p>
            <p className="mt-2 text-sm text-muted-foreground">{previewText}</p>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
          <p className="text-xs text-muted-foreground">
            {savedFlash ? t('adminSettings.botSaved') : t('adminSettings.botMockNote')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults}>
            {t('adminSettings.botReset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
