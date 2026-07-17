import { useEffect, useMemo, useState } from 'react';
import { Bot, CalendarClock, Clock, MessageCircle } from 'lucide-react';
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
import { loadInboxLlmConfig } from '@/lib/inboxLlmConfig';
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
import {
  SettingsCollapsibleCard,
  settingsIconToggleClass,
} from '@/components/settings/settings-ui';

const APPOINTMENT_TOGGLE_I18N: Record<InboxAppointmentPrimaryToggleId, string> = {
  confirmAppointments: 'adminSettings.autopilotApptQuery',
  scheduleAppointments: 'adminSettings.autopilotApptSchedule',
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
    scheduleInboxAiSettingsSync({
      autopilot: config,
      bot: loadInboxBotConfig(),
      llm: loadInboxLlmConfig(),
    });
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
    <SettingsCollapsibleCard
      id="autopilot"
      icon={Bot}
      title={t('adminSettings.autopilotTitle')}
      description={t('adminSettings.autopilotSubtitle')}
      action={
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'hidden text-[11px] sm:inline',
              !config.enabled && 'text-muted-foreground',
              config.enabled && activeNow && 'text-emerald-600 dark:text-emerald-400',
              config.enabled && !activeNow && 'text-amber-700 dark:text-amber-300',
            )}
          >
            {status}
          </span>
          <Switch
            id="autopilot-enabled"
            checked={config.enabled}
            onCheckedChange={(v) => patch({ enabled: v })}
            aria-label={t('adminSettings.autopilotEnabledLabel')}
          />
        </div>
      }
    >
      <p className="mb-3 text-xs text-muted-foreground">{t('adminSettings.autopilotEnabledHint')}</p>

      <div className="space-y-3">
        <fieldset
          disabled={!config.enabled}
          className="space-y-3 disabled:pointer-events-none disabled:opacity-55"
        >
          <div>
            <div className="mb-2 flex items-start gap-2">
              <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('adminSettings.autopilotAppointmentsTitle')}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {t('adminSettings.autopilotAppointmentsSubtitle')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              {INBOX_APPOINTMENT_PRIMARY_TOGGLES.map((topicId) => {
                const on = config.appointmentTopics[topicId];
                return (
                  <label
                    key={topicId}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-xs font-medium text-foreground">
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
            <p className="mt-2 text-xs text-muted-foreground">{appointmentTopicsSummary}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t('adminSettings.autopilotChannelsLabel')}
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={config.channels.whatsapp}
              onClick={() =>
                patch({ channels: { ...config.channels, whatsapp: !config.channels.whatsapp } })
              }
              className={settingsIconToggleClass(config.channels.whatsapp)}
            >
              <MessageCircle className="size-4 shrink-0" aria-hidden />
              {t('adminSettings.autopilotChannelWhatsapp')}
            </button>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
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
                    className={cn(settingsIconToggleClass(on), 'min-w-[2.75rem]')}
                    aria-pressed={on}
                  >
                    {t(WEEKDAY_I18N[day])}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-start">{t('adminSettings.autopilotStartLabel')}</Label>
              <Input
                id="autopilot-start"
                type="time"
                value={config.startTime}
                onChange={(e) => patch({ startTime: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="autopilot-end">{t('adminSettings.autopilotEndLabel')}</Label>
              <Input
                id="autopilot-end"
                type="time"
                value={config.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="autopilot-tz">{t('adminSettings.autopilotTimezoneLabel')}</Label>
              <select
                id="autopilot-tz"
                value={config.timezone}
                onChange={(e) => patch({ timezone: e.target.value })}
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {AUTOPILOT_TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
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
                className="accent-primary w-full"
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
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">{t('adminSettings.autopilotMaxRepliesHint')}</p>
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            {savedFlash ? t('adminSettings.autopilotSaved') : t('adminSettings.autopilotMockNote')}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={resetDefaults}>
            {t('adminSettings.autopilotReset')}
          </Button>
        </div>
      </div>
    </SettingsCollapsibleCard>
  );
}
