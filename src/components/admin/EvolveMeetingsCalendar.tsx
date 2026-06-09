import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { EvolveMeetingEvent } from '@/lib/adminEvolveLeadsApi';
import { EvolveMeetingsDashboard } from '@/components/admin/EvolveMeetingsDashboard';
import {
  buildMonthGrid,
  dayKeyFromDate,
  formatDayLabel,
  formatMeetingTime,
  formatMonthLabel,
  type MeetingDashboardStats,
} from '@/lib/evolveMeetingsCalendarUtils';
import { cn } from '@/lib/utils';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type Props = {
  year: number;
  month: number;
  meetings: EvolveMeetingEvent[];
  loading: boolean;
  selectedDayKey: string | null;
  dashboardStats: MeetingDashboardStats;
  dashboardLoading?: boolean;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay: (key: string) => void;
  onViewMeeting: (meeting: EvolveMeetingEvent) => void;
};

export function EvolveMeetingsCalendar({
  year,
  month,
  meetings,
  loading,
  selectedDayKey,
  dashboardStats,
  dashboardLoading,
  onMonthChange,
  onSelectDay,
  onViewMeeting,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-MX';
  const todayKey = dayKeyFromDate(new Date());

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekRowCount = Math.ceil(grid.length / 7);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, EvolveMeetingEvent[]>();
    for (const meeting of meetings) {
      const key = dayKeyFromDate(new Date(meeting.startTimeMs));
      const list = map.get(key) ?? [];
      list.push(meeting);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.startTimeMs - b.startTimeMs);
    }
    return map;
  }, [meetings]);

  const selectedMeetings = selectedDayKey ? (meetingsByDay.get(selectedDayKey) ?? []) : [];

  const goMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto p-3">
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="flex min-h-[18rem] min-w-0 flex-1 flex-col lg:min-h-0">
          <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => goMonth(-1)}
                aria-label={t('adminLeads.evolveCalendarPrevMonth')}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <h3 className="min-w-[10rem] px-2 text-center text-sm font-semibold capitalize text-foreground">
                {formatMonthLabel(year, month, locale)}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => goMonth(1)}
                aria-label={t('adminLeads.evolveCalendarNextMonth')}
              >
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => {
                  const now = new Date();
                  onMonthChange(now.getFullYear(), now.getMonth());
                  onSelectDay(todayKey);
                }}
              >
                {t('adminLeads.evolveCalendarToday')}
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70">
            <div className="grid shrink-0 grid-cols-7 border-b border-border/60 bg-muted/80">
              {WEEKDAY_KEYS.map((key) => (
                <div
                  key={key}
                  className="px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {t(`adminLeads.evolveCalendarWeekday${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                </div>
              ))}
            </div>
            <div
              className="grid min-h-0 flex-1 grid-cols-7 gap-px bg-border/40"
              style={{ gridTemplateRows: `repeat(${weekRowCount}, minmax(0, 1fr))` }}
            >
              {grid.map((cell) => {
                const dayMeetings = meetingsByDay.get(cell.key) ?? [];
                const isSelected = selectedDayKey === cell.key;
                const isToday = cell.key === todayKey;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => onSelectDay(cell.key)}
                    className={cn(
                      'flex min-h-0 flex-col bg-card p-1.5 text-left transition-colors hover:bg-muted/40',
                      !cell.inMonth && 'bg-muted/20 text-muted-foreground',
                      isSelected && 'ring-2 ring-inset ring-violet-500/70',
                      isToday && 'bg-violet-50/80 dark:bg-violet-950/20',
                    )}
                  >
                    <span
                      className={cn(
                        'mb-1 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                        isToday && 'bg-violet-600 text-white dark:bg-violet-500',
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                    <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                      {dayMeetings.slice(0, 2).map((m) => (
                        <span
                          key={`${m.id}-${m.startTimeMs}`}
                          className="truncate rounded bg-violet-100 px-1 py-0.5 text-[9px] font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-200"
                          title={`${formatMeetingTime(m.startTimeMs, locale)} · ${m.contactName}`}
                        >
                          {formatMeetingTime(m.startTimeMs, locale)} {m.contactName.split(' ')[0]}
                        </span>
                      ))}
                      {dayMeetings.length > 2 ? (
                        <span className="text-[9px] text-muted-foreground">
                          +{dayMeetings.length - 2}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border/70 bg-muted/15 lg:w-72 xl:w-80">
          <div className="shrink-0 border-b border-border/60 px-3 py-2.5">
            <h4 className="text-sm font-semibold text-foreground">
              {selectedDayKey
                ? formatDayLabel(selectedDayKey, locale)
                : t('adminLeads.evolveCalendarSelectDay')}
            </h4>
            <p className="text-xs text-muted-foreground">
              {selectedDayKey
                ? t('adminLeads.evolveCalendarMeetingsCount', { count: selectedMeetings.length })
                : t('adminLeads.evolveCalendarSelectDayHint')}
            </p>
          </div>
          <div className="min-h-[8rem] flex-1 overflow-auto overscroll-contain p-2 lg:min-h-0">
            {!selectedDayKey ? (
              <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                {t('adminLeads.evolveCalendarSelectDayHint')}
              </p>
            ) : selectedMeetings.length === 0 ? (
              <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                {t('adminLeads.evolveCalendarNoMeetings')}
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedMeetings.map((meeting) => (
                  <li
                    key={`${meeting.id}-${meeting.startTimeMs}`}
                    className="rounded-lg border border-border/60 bg-card p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{meeting.contactName}</p>
                        <p className="text-[11px] text-muted-foreground">{meeting.title}</p>
                        <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                          {formatMeetingTime(meeting.startTimeMs, locale)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        title={t('adminLeads.evolveViewDetail')}
                        aria-label={t('adminLeads.evolveViewDetailFor', { name: meeting.contactName })}
                        onClick={() => onViewMeeting(meeting)}
                      >
                        <Eye className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                    {meeting.meetingLink ? (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:underline dark:text-violet-300"
                      >
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                        {t('adminLeads.evolveMeetingLink')}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <EvolveMeetingsDashboard stats={dashboardStats} loading={dashboardLoading} />
    </div>
  );
}
