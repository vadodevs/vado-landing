import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EvolveLeadDetailDialog } from '@/components/admin/EvolveLeadDetailDialog';
import { EvolveMeetingsCalendar } from '@/components/admin/EvolveMeetingsCalendar';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import {
  fetchEvolveLeads,
  fetchEvolveMeetings,
  type EvolveLeadRow,
  type EvolveMeetingEvent,
} from '@/lib/adminEvolveLeadsApi';
import { calificacionBadgeClass } from '@/lib/evolveLeadUi';
import {
  computeMeetingStats,
  dashboardFetchRange,
  dayKeyFromDate,
  monthRangeMs,
} from '@/lib/evolveMeetingsCalendarUtils';

type LoadState = 'idle' | 'loading' | 'done' | 'error';

export default function AppAdminLeadsMyEvolveCalendar() {
  const { t } = useTranslation();
  const [meetingsLoadState, setMeetingsLoadState] = useState<LoadState>('idle');
  const [leadsLoadState, setLeadsLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<EvolveLeadRow[]>([]);
  const [calendarMeetings, setCalendarMeetings] = useState<EvolveMeetingEvent[]>([]);
  const [dashboardMeetings, setDashboardMeetings] = useState<EvolveMeetingEvent[]>([]);
  const [dashboardLoadState, setDashboardLoadState] = useState<LoadState>('idle');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(() => dayKeyFromDate(new Date()));
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selected, setSelected] = useState<EvolveLeadRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadLeads = useCallback(async () => {
    setLeadsLoadState('loading');
    const res = await fetchEvolveLeads({ includeMeetings: false });
    if (!res.ok) {
      setLeadsLoadState('error');
      setRows([]);
      if (res.reason === 'no-config') {
        setErrorMessage(t('adminLeads.evolveErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        setErrorMessage(t('adminLeads.evolveErrorNoAuth'));
      } else {
        setErrorMessage(res.message?.trim() || t('adminLeads.evolveErrorGeneric'));
      }
      return;
    }
    setRows(res.data.contacts);
    setLeadsLoadState('done');
    setErrorMessage(null);
  }, [t]);

  const loadCalendarMeetings = useCallback(async () => {
    setMeetingsLoadState('loading');
    const { startMs, endMs } = monthRangeMs(calendarMonth.year, calendarMonth.month);
    const res = await fetchEvolveMeetings({ startMs, endMs });
    if (!res.ok) {
      setCalendarMeetings([]);
      setMeetingsLoadState('error');
      if (res.reason === 'no-config') {
        setErrorMessage(t('adminLeads.evolveErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        setErrorMessage(t('adminLeads.evolveErrorNoAuth'));
      } else {
        setErrorMessage(res.message?.trim() || t('adminLeads.evolveCalendarLoadError'));
      }
      return;
    }
    setCalendarMeetings(res.data.meetings);
    setMeetingsLoadState('done');
  }, [calendarMonth.year, calendarMonth.month, t]);

  const loadDashboardMeetings = useCallback(async () => {
    setDashboardLoadState('loading');
    const { startMs, endMs } = dashboardFetchRange();
    const res = await fetchEvolveMeetings({ startMs, endMs });
    if (!res.ok) {
      setDashboardMeetings([]);
      setDashboardLoadState('error');
      return;
    }
    setDashboardMeetings(res.data.meetings);
    setDashboardLoadState('done');
  }, []);

  useEffect(() => {
    void loadLeads();
    void loadDashboardMeetings();
  }, [loadLeads, loadDashboardMeetings]);

  useEffect(() => {
    void loadCalendarMeetings();
  }, [loadCalendarMeetings]);

  const openDetail = (lead: EvolveLeadRow) => {
    setSelected(lead);
    setDetailOpen(true);
  };

  const openMeetingDetail = (meeting: EvolveMeetingEvent) => {
    const lead = rows.find((row) => row.id === meeting.contactId);
    if (lead) {
      openDetail({
        ...lead,
        meetingLink: meeting.meetingLink,
        meetingTitle: meeting.title,
        meetingStart: meeting.startTime,
      });
      return;
    }
    openDetail({
      id: meeting.contactId,
      nombre: meeting.contactName,
      email: meeting.contactEmail,
      telefono: '—',
      empresa: '—',
      fuente: '—',
      calificacion: '—',
      urgencia: '—',
      etapaNegocio: '—',
      claridad: '—',
      anuncio: '—',
      pipelineStatus: '—',
      meetingLink: meeting.meetingLink,
      meetingTitle: meeting.title,
      meetingStart: meeting.startTime,
      fechaAlta: '—',
      createdAtMs: 0,
    });
  };

  const copyEmail = async (email: string) => {
    if (!email || email === '—') return;
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      window.setTimeout(() => setCopiedEmail((prev) => (prev === email ? null : prev)), 2000);
    } catch {
      /* ignore */
    }
  };

  const dashboardStats = useMemo(
    () => computeMeetingStats(dashboardMeetings),
    [dashboardMeetings],
  );

  const loading =
    meetingsLoadState === 'loading' ||
    leadsLoadState === 'loading' ||
    dashboardLoadState === 'loading';

  return (
    <AppShell
      pathWithoutLang="/app/admin/leads/calendar"
      title={t('sidebarDemo.navLeadsCalendar')}
      description={t('seo.appAdminLeadsCalendar')}
      contentOverflow="hidden"
    >
      <div className="flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="shrink-0 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <CalendarDays className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('adminLeads.evolveCalendarTitle')}
                  </h2>
                  <p className="text-xs leading-snug text-muted-foreground">
                    {t('adminLeads.evolveCalendarHint')}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                disabled={loading}
                onClick={() => {
                  void loadLeads();
                  void loadCalendarMeetings();
                  void loadDashboardMeetings();
                }}
              >
                {loading ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                )}
                {t('adminLeads.evolveRefresh')}
              </Button>
            </div>

            {loading && calendarMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('adminLeads.evolveCalendarLoading')}</p>
            ) : null}
            {errorMessage ? (
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            ) : null}
          </div>

          <div className="isolate flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/20 dark:shadow-none">
            <EvolveMeetingsCalendar
              year={calendarMonth.year}
              month={calendarMonth.month}
              meetings={calendarMeetings}
              loading={meetingsLoadState === 'loading'}
              selectedDayKey={selectedDayKey}
              dashboardStats={dashboardStats}
              dashboardLoading={dashboardLoadState === 'loading'}
              onMonthChange={(year, month) => {
                setCalendarMonth({ year, month });
                setSelectedDayKey(null);
              }}
              onSelectDay={setSelectedDayKey}
              onViewMeeting={openMeetingDetail}
            />
          </div>
        </section>
      </div>

      <EvolveLeadDetailDialog
        lead={selected}
        open={detailOpen}
        onOpenChange={(next) => {
          setDetailOpen(next);
          if (!next) setSelected(null);
        }}
        calificacionBadgeClass={calificacionBadgeClass}
        onCopyEmail={(email) => void copyEmail(email)}
        copiedEmail={copiedEmail}
      />
    </AppShell>
  );
}
