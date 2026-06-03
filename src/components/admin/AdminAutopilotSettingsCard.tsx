import { useEffect, useMemo, useState } from 'react';
import { Bot, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AUTOPILOT_TIMEZONE_OPTIONS,
  AUTOPILOT_WEEKDAYS,
  DEFAULT_INBOX_AUTOPILOT_CONFIG,
  type AutopilotWeekdayId,
  type InboxAutopilotConfig,
  isInboxAutopilotActiveNow,
  loadInboxAutopilotConfig,
  saveInboxAutopilotConfig,
} from '@/lib/inboxAutopilotConfig';

const WEEKDAY_I18N: Record<AutopilotWeekdayId, string> = {
  mon: 'adminSettings.autopilotDayMon',
  tue: 'adminSettings.autopilotDayTue',
  wed: 'adminSettings.autopilotDayWed',
  thu: 'adminSettings.autopilotDayThu',
  fri: 'adminSettings.autopilotDayFri',
  sat: 'adminSettings.autopilotDaySat',
  sun: 'adminSettings.autopilotDaySun',
};

function toggleDay(days: AutopilotWeekdayId[], day: AutopilotWeekdayId): AutopilotWeekdayId[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
}

export function AdminAutopilotSettingsCard() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<InboxAutopilotConfig>(() => loadInboxAutopilotConfig());
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveInboxAutopilotConfig(config);
    setSavedFlash(true);
    const timer = window.setTimeout(() => setSavedFlash(false), 2000);
    return () => window.clearTimeout(timer);
  }, [config]);

  const activeNow = useMemo(() => isInboxAutopilotActiveNow(config), [config]);

  const patch = (partial: Partial<InboxAutopilotConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetDefaults = () => {
    setConfig({ ...DEFAULT_INBOX_AUTOPILOT_CONFIG });
  };

  return (
    <div
      id="autopilot"
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 pb-7 shadow-sm md:p-6 md:pb-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-300">
            <Bot className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t('adminSettings.autopilotTitle')}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                <Sparkles className="size-3" aria-hidden />
                {t('adminSettings.autopilotMockBadge')}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{t('adminSettings.autopilotSubtitle')}</p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            config.enabled
              ? activeNow
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
              : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
          )}
        >
          {!config.enabled
            ? t('adminSettings.autopilotStatusOff')
            : activeNow
              ? t('adminSettings.autopilotStatusActive')
              : t('adminSettings.autopilotStatusScheduled')}
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/30 px-3 py-3">
          <Checkbox
            id="autopilot-enabled"
            checked={config.enabled}
            onCheckedChange={(v) => patch({ enabled: v === true })}
          />
          <div className="min-w-0 flex-1">
            <Label htmlFor="autopilot-enabled" className="cursor-pointer text-sm font-medium">
              {t('adminSettings.autopilotEnabledLabel')}
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('adminSettings.autopilotEnabledHint')}
            </p>
          </div>
        </div>

        <fieldset
          disabled={!config.enabled}
          className="space-y-5 disabled:pointer-events-none disabled:opacity-55"
        >
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t('adminSettings.autopilotChannelsLabel')}
            </p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="autopilot-whatsapp"
                checked={config.channels.whatsapp}
                onCheckedChange={(v) =>
                  patch({ channels: { ...config.channels, whatsapp: v === true } })
                }
              />
              <Label htmlFor="autopilot-whatsapp" className="cursor-pointer text-sm">
                {t('adminSettings.autopilotChannelWhatsapp')}
              </Label>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Clock className="size-4 text-muted-foreground" aria-hidden />
              {t('adminSettings.autopilotDaysLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {AUTOPILOT_WEEKDAYS.map((day) => {
                const on = config.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => patch({ days: toggleDay(config.days, day) })}
                    className={cn(
                      'min-w-[2.75rem] rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
                      on
                        ? 'border-teal-600/40 bg-teal-600 text-white shadow-sm dark:border-teal-500/50 dark:bg-teal-600'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/60',
                    )}
                    aria-pressed={on}
                  >
                    {t(WEEKDAY_I18N[day])}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-start">{t('adminSettings.autopilotStartLabel')}</Label>
              <Input
                id="autopilot-start"
                type="time"
                value={config.startTime}
                onChange={(e) => patch({ startTime: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-end">{t('adminSettings.autopilotEndLabel')}</Label>
              <Input
                id="autopilot-end"
                type="time"
                value={config.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="autopilot-tz">{t('adminSettings.autopilotTimezoneLabel')}</Label>
              <select
                id="autopilot-tz"
                value={config.timezone}
                onChange={(e) => patch({ timezone: e.target.value })}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {AUTOPILOT_TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="rounded-lg border border-dashed border-border/90 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            {t('adminSettings.autopilotScheduleSummary', {
              days:
                config.days.length > 0
                  ? config.days.map((d) => t(WEEKDAY_I18N[d])).join(', ')
                  : '—',
              start: config.startTime,
              end: config.endTime,
              tz: config.timezone.replace(/_/g, ' '),
            })}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-delay">
                {t('adminSettings.autopilotDelayLabel', { seconds: config.replyDelaySeconds })}
              </Label>
              <input
                id="autopilot-delay"
                type="range"
                min={0}
                max={60}
                step={1}
                value={config.replyDelaySeconds}
                onChange={(e) => patch({ replyDelaySeconds: Number(e.target.value) })}
                className="accent-teal-600 w-full"
              />
              <p className="text-xs text-muted-foreground">{t('adminSettings.autopilotDelayHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-max">{t('adminSettings.autopilotMaxRepliesLabel')}</Label>
              <Input
                id="autopilot-max"
                type="number"
                min={1}
                max={200}
                value={config.maxRepliesPerHour}
                onChange={(e) =>
                  patch({
                    maxRepliesPerHour: Math.min(
                      200,
                      Math.max(1, Number(e.target.value) || 1),
                    ),
                  })
                }
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">{t('adminSettings.autopilotMaxRepliesHint')}</p>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
          <p className="text-xs text-muted-foreground">
            {savedFlash ? t('adminSettings.autopilotSaved') : t('adminSettings.autopilotMockNote')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults}>
            {t('adminSettings.autopilotReset')}
          </Button>
        </div>
      </div>
    </div>
  );
}
