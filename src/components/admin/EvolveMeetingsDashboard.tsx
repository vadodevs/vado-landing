import { CalendarClock, CalendarDays, CalendarRange, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MeetingDashboardStats } from '@/lib/evolveMeetingsCalendarUtils';
import { cn } from '@/lib/utils';

type Props = {
  stats: MeetingDashboardStats;
  loading?: boolean;
  className?: string;
};

type StatCard = {
  key: keyof MeetingDashboardStats;
  labelKey: string;
  icon: typeof CalendarDays;
  accent: string;
};

const CARDS: StatCard[] = [
  {
    key: 'today',
    labelKey: 'evolveCalendarStatToday',
    icon: CalendarDays,
    accent: 'text-violet-600 dark:text-violet-300',
  },
  {
    key: 'week',
    labelKey: 'evolveCalendarStatWeek',
    icon: CalendarRange,
    accent: 'text-sky-600 dark:text-sky-300',
  },
  {
    key: 'month',
    labelKey: 'evolveCalendarStatMonth',
    icon: CalendarClock,
    accent: 'text-emerald-600 dark:text-emerald-300',
  },
  {
    key: 'upcoming',
    labelKey: 'evolveCalendarStatUpcoming',
    icon: Sparkles,
    accent: 'text-amber-600 dark:text-amber-300',
  },
];

export function EvolveMeetingsDashboard({ stats, loading, className }: Props) {
  const { t } = useTranslation();

  return (
    <section
      className={cn(
        'shrink-0 rounded-lg border border-border/70 bg-muted/15 p-3',
        className,
      )}
      aria-label={t('adminLeads.evolveCalendarDashboardTitle')}
    >
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t('adminLeads.evolveCalendarDashboardTitle')}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {CARDS.map(({ key, labelKey, icon: Icon, accent }) => (
          <div
            key={key}
            className="rounded-lg border border-border/60 bg-card px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <Icon className={cn('size-3.5 shrink-0', accent)} strokeWidth={2} aria-hidden />
              <span className="text-[11px] font-medium text-muted-foreground">
                {t(`adminLeads.${labelKey}`)}
              </span>
            </div>
            <p
              className={cn(
                'mt-1.5 text-2xl font-semibold tabular-nums leading-none text-foreground',
                loading && 'animate-pulse text-muted-foreground',
              )}
            >
              {loading ? '—' : stats[key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
