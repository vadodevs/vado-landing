import { useEffect, useMemo, useState } from 'react';
import { Bot, CalendarClock, Clock, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { scheduleInboxAiSettingsSync } from '@/lib/inboxAiSettingsSync';
import {
  enabledInboxAppointmentTopicIds,
  INBOX_APPOINTMENT_PRIMARY_TOGGLES,
  type InboxAppointmentPrimaryToggleId,
} from '@/lib/inboxAppointmentTopics';
import { loadInboxBotConfig } from '@/lib/inboxBotConfig';
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

const APPOINTMENT_TOGGLE_I18N: Record<InboxAppointmentPrimaryToggleId, string> = {
  confirmAppointments: 'adminSettings.autopilotApptQuery',
  cancelAppointments: 'adminSettings.autopilotApptCancel',
  rescheduleAppointments: 'adminSettings.autopilotApptPostpone',
};

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

function statusLabel(
  config: InboxAutopilotConfig,
  activeNow: boolean,
  t: (key: string) => string,
): string {
  if (!config.enabled) return t('adminSettings.autopilotStatusOff');
  if (activeNow) return t('adminSettings.autopilotStatusActive');
  return t('adminSettings.autopilotStatusScheduled');
}

export function AdminAutopilotSettingsCard() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<InboxAutopilotConfig>(() => loadInboxAutopilotConfig());
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    saveInboxAutopilotConfig(config);
    scheduleInboxAiSettingsSync({ autopilot: config, bot: loadInboxBotConfig() });
    setSavedFlash(true);
    const timer = window.setTimeout(() => setSavedFlash(false), 2000);
    return () => window.clearTimeout(timer);
  }, [config]);

  const activeNow = useMemo(() => isInboxAutopilotActiveNow(config), [config]);
  const status = statusLabel(config, activeNow, t);

  const patch = (partial: Partial<InboxAutopilotConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetDefaults = () => {
    setConfig({ ...DEFAULT_INBOX_AUTOPILOT_CONFIG });
  };

  const enabledAppointmentIds = useMemo(
    () => enabledInboxAppointmentTopicIds(config.appointmentTopics),
    [config.appointmentTopics],
  );

  const appointmentTopicsSummary = useMemo(() => {
    if (enabledAppointmentIds.length === 0) {
      return t('adminSettings.autopilotAppointmentsNone');
    }
    return t('adminSettings.autopilotAppointmentsSummary', {
      topics: enabledAppointmentIds.map((id) => t(APPOINTMENT_TOGGLE_I18N[id])).join(', '),
    });
  }, [enabledAppointmentIds, t]);

  return (
    <div
      id="autopilot"
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 pb-7 shadow-sm md:p-6 md:pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

        <div
          className={cn(
            'flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 sm:min-w-[11rem]',
            config.enabled
              ? 'border-teal-500/30 bg-teal-500/5 dark:border-teal-500/25 dark:bg-teal-500/10'
              : 'border-border bg-muted/40',
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {t('adminSettings.autopilotEnabledLabel')}
            </p>
            <p
              className={cn(
                'mt-0.5 text-xs font-medium',
                !config.enabled && 'text-muted-foreground',
                config.enabled && activeNow && 'text-emerald-600 dark:text-emerald-400',
                config.enabled && !activeNow && 'text-amber-700 dark:text-amber-300',
              )}
            >
              {status}
            </p>
          </div>
          <Switch
            id="autopilot-enabled"
            checked={config.enabled}
            onCheckedChange={(v) => patch({ enabled: v })}
            aria-label={t('adminSettings.autopilotEnabledLabel')}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{t('adminSettings.autopilotEnabledHint')}</p>

      <div className="mt-6 space-y-6">
        <fieldset
          disabled={!config.enabled}
          className="space-y-5 disabled:pointer-events-none disabled:opacity-55"
        >
          <div className="w-fit max-w-full rounded-xl border border-border/90 bg-muted/15 p-3">
            <div className="mb-2.5 flex items-start gap-2">
              <CalendarClock
                className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-300"
                aria-hidden
              />
              <div className="min-w-0 max-w-[11rem]">
                <p className="text-sm font-medium text-foreground">
                  {t('adminSettings.autopilotAppointmentsTitle')}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {t('adminSettings.autopilotAppointmentsSubtitle')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {INBOX_APPOINTMENT_PRIMARY_TOGGLES.map((topicId) => {
                const on = config.appointmentTopics[topicId];
                return (
                  <label
                    key={topicId}
                    className={cn(
                      'flex w-[11rem] cursor-pointer items-center justify-between gap-2 rounded-2xl border px-2.5 py-2',
                      on
                        ? 'border-teal-500/30 bg-teal-500/5 dark:border-teal-500/25 dark:bg-teal-500/10'
                        : 'border-border bg-muted/40',
                    )}
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {t(APPOINTMENT_TOGGLE_I18N[topicId])}
                    </span>
                    <Switch
                      checked={on}
                      onCheckedChange={(v) =>
                        patch({
                          appointmentTopics: {
                            ...config.appointmentTopics,
                            [topicId]: v,
                          },
                        })
                      }
                      aria-label={t(APPOINTMENT_TOGGLE_I18N[topicId])}
                    />
                  </label>
                );
              })}
            </div>
            <p className="mt-2 max-w-[11rem] text-xs leading-snug text-muted-foreground">
              {appointmentTopicsSummary}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t('adminSettings.autopilotChannelsLabel')}
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={config.channels.whatsapp}
              onClick={() =>
                patch({ channels: { ...config.channels, whatsapp: !config.channels.whatsapp } })
              }
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
                config.channels.whatsapp
                  ? 'border-teal-600/40 bg-teal-600 text-white shadow-sm dark:border-teal-500/50'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/60',
              )}
            >
              <MessageCircle className="size-4 shrink-0" aria-hidden />
              {t('adminSettings.autopilotChannelWhatsapp')}
            </button>
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
                    maxRepliesPerHour: Math.min(200, Math.max(1, Number(e.target.value) || 1)),
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
