import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { EvolveLeadDetailDialog } from '@/components/admin/EvolveLeadDetailDialog';
import { EvolveLeadsSyncStatus } from '@/components/admin/EvolveLeadsSyncStatus';
import { EvolveMeetingsCalendar } from '@/components/admin/EvolveMeetingsCalendar';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import {
  fetchEvolveLeads,
  fetchEvolveMeetings,
  type EvolveLeadRow,
  type EvolveMeetingEvent,
} from '@/lib/adminEvolveLeadsApi';
import { useEvolveLeadsAutoSync } from '@/lib/evolveLeadsAutoSync';
import { calificacionBadgeClass } from '@/lib/evolveLeadUi';
import {
  computeMeetingStats,
  dashboardFetchRange,
  dayKeyFromDate,
  monthRangeMs,
} from '@/lib/evolveMeetingsCalendarUtils';
import {
  COMPANY_LEAD_UPDATES_CHANGE_EVENT,
  loadCompanyLeadReminderCalendarEvents,
} from '@/lib/companyLeadUpdates';
import { requestOpenCompanyLead } from '@/lib/companyLeadDeepLink';
import { fetchCompanyContactDirectory } from '@/lib/companyAdminContact';

type LoadState = 'idle' | 'loading' | 'done' | 'error';

export default function AppAdminLeadsMyEvolveCalendar() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [meetingsLoadState, setMeetingsLoadState] = useState<LoadState>('idle');
  const [leadsLoadState, setLeadsLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<EvolveLeadRow[]>([]);
  const [calendarMeetings, setCalendarMeetings] = useState<EvolveMeetingEvent[]>([]);
  const [companyReminders, setCompanyReminders] = useState<EvolveMeetingEvent[]>([]);
  const [companyContactDirectory, setCompanyContactDirectory] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [dashboardCompanyReminders, setDashboardCompanyReminders] = useState<EvolveMeetingEvent[]>([]);
  const [dashboardMeetings, setDashboardMeetings] = useState<EvolveMeetingEvent[]>([]);
  const [dashboardLoadState, setDashboardLoadState] = useState<LoadState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [backgroundSyncing, setBackgroundSyncing] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(() => dayKeyFromDate(new Date()));
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selected, setSelected] = useState<EvolveLeadRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const applyFetchError = useCallback(
    (res: { reason: string; message?: string }, fallbackKey: string) => {
      if (res.reason === 'no-config') {
        setErrorMessage(t('adminLeads.evolveErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        setErrorMessage(t('adminLeads.evolveErrorNoAuth'));
      } else {
        setErrorMessage(res.message?.trim() || t(fallbackKey));
      }
    },
    [t],
  );

  const loadLeads = useCallback(
    async (background: boolean) => {
      if (!background) setLeadsLoadState('loading');
      const res = await fetchEvolveLeads({ includeMeetings: false });
      if (res.ok) {
        setRows(res.data.contacts);
        setLeadsLoadState('done');
        return true;
      }
      if (!background) {
        setRows([]);
        setLeadsLoadState('error');
        applyFetchError(res, 'adminLeads.evolveErrorGeneric');
      }
      return false;
    },
    [applyFetchError],
  );

  useEffect(() => {
    void fetchCompanyContactDirectory().then(setCompanyContactDirectory);
  }, []);

  const loadCompanyReminders = useCallback(() => {
    const { startMs, endMs } = monthRangeMs(calendarMonth.year, calendarMonth.month);
    void loadCompanyLeadReminderCalendarEvents({
      startMs,
      endMs,
      contactDirectory: companyContactDirectory,
    }).then(setCompanyReminders);
  }, [calendarMonth.month, calendarMonth.year, companyContactDirectory]);

  const loadCalendarMeetings = useCallback(
    async (background: boolean) => {
      if (!background) setMeetingsLoadState('loading');
      const { startMs, endMs } = monthRangeMs(calendarMonth.year, calendarMonth.month);
      const res = await fetchEvolveMeetings({ startMs, endMs });
      if (res.ok) {
        setCalendarMeetings(res.data.meetings);
        setMeetingsLoadState('done');
        return true;
      }
      if (!background) {
        setCalendarMeetings([]);
        setMeetingsLoadState('error');
        applyFetchError(res, 'adminLeads.evolveCalendarLoadError');
      }
      return false;
    },
    [applyFetchError, calendarMonth.month, calendarMonth.year],
  );

  const loadDashboardMeetings = useCallback(async (background: boolean) => {
    if (!background) setDashboardLoadState('loading');
    const { startMs, endMs } = dashboardFetchRange();
    const res = await fetchEvolveMeetings({ startMs, endMs });
    if (res.ok) {
      setDashboardMeetings(res.data.meetings);
      setDashboardLoadState('done');
      return true;
    }
    if (!background) {
      setDashboardMeetings([]);
      setDashboardLoadState('error');
    }
    return false;
  }, []);

  useEffect(() => {
    loadCompanyReminders();
  }, [loadCompanyReminders]);

  useEffect(() => {
    const onUpdatesChange = () => loadCompanyReminders();
    window.addEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, onUpdatesChange);
    return () => window.removeEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, onUpdatesChange);
  }, [loadCompanyReminders]);

  const syncAll = useCallback(
    async (opts?: { background?: boolean }) => {
      const background = opts?.background === true;
      if (!background) setErrorMessage(null);
      else setBackgroundSyncing(true);

      const [leadsOk, calendarOk, dashboardOk] = await Promise.all([
        loadLeads(background),
        loadCalendarMeetings(background),
        loadDashboardMeetings(background),
      ]);

      if (background) setBackgroundSyncing(false);
      if (leadsOk && calendarOk && dashboardOk) {
        setErrorMessage(null);
        setLastSyncedAt(new Date());
      }
    },
    [loadCalendarMeetings, loadDashboardMeetings, loadLeads],
  );

  useEffect(() => {
    void syncAll();
  }, [syncAll]);

  const backgroundSync = useCallback(() => syncAll({ background: true }), [syncAll]);
  useEvolveLeadsAutoSync(backgroundSync);

  const openDetail = (lead: EvolveLeadRow) => {
    setSelected(lead);
    setDetailOpen(true);
  };

  const openMeetingDetail = (meeting: EvolveMeetingEvent) => {
    if (meeting.source === 'company') {
      requestOpenCompanyLead(meeting.contactId, 'notas');
      setLocation(`/${i18n.language}/app/admin/company`);
      return;
    }
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
    } catch {}
  };

  useEffect(() => {
    const { startMs, endMs } = dashboardFetchRange();
    void loadCompanyLeadReminderCalendarEvents({
      startMs,
      endMs,
      contactDirectory: companyContactDirectory,
    }).then(setDashboardCompanyReminders);
  }, [companyContactDirectory, companyReminders]);

  const dashboardStats = useMemo(
    () => computeMeetingStats([...dashboardMeetings, ...dashboardCompanyReminders]),
    [dashboardMeetings, dashboardCompanyReminders],
  );

  const allCalendarMeetings = useMemo(() => {
    const merged = [...calendarMeetings, ...companyReminders];
    merged.sort((a, b) => a.startTimeMs - b.startTimeMs);
    return merged;
  }, [calendarMeetings, companyReminders]);

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
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={loading || backgroundSyncing}
                  onClick={() => void syncAll()}
                >
                  {loading ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                  )}
                  {t('adminLeads.evolveRefresh')}
                </Button>
                <EvolveLeadsSyncStatus
                  lastSyncedAt={lastSyncedAt}
                  backgroundSyncing={backgroundSyncing}
                  className="text-right"
                />
              </div>
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
              meetings={allCalendarMeetings}
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
