import { Briefcase, ClipboardList, Filter, PartyPopper, Search, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app/AppShell';
import { DevJobBoard } from '@/pages/app/DevJobBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DEV_AUTH_CHANGE_EVENT, getDevAccessToken } from '@/lib/devAuth';
import { ensureEditorHtml, sanitizeOverviewHtmlForDisplay } from '@/lib/jobOverviewHtml';
import { DevApplicationTrackingBar } from '@/components/app/DevApplicationTrackingBar';
import { getDevApplicationTrackingFromStatus } from '@/lib/devApplicationTracking';
import {
  fetchDeveloperPostedJobs,
  fetchPublicPostedJobs,
  type PublicJobListItem,
  stripHtml,
} from '@/lib/devPublicJobs';

export type { PublicJobListItem } from '@/lib/devPublicJobs';

export type DevApplicationRow = {
  id: string;
  jobId?: string;
  status: string;
  createdAt: string;
  coverLetter: string | null;
  job?: {
    title?: string;
    summary?: string | null;
    status?: string;
  } | null;
};

type ApplicationsApiResponse = {
  data?: DevApplicationRow[];
  count?: number;
};

type TrackingStepView = { idx: number; label: string; state: 'completed' | 'current' | 'upcoming' };
type ApplicationFilter = 'applied' | 'viewed' | 'finalist' | 'rejected';

function formatWhen(iso: string, locale: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
}

function isPostulacionPath(location: string): boolean {
  const pathOnly = location.split('?')[0].split('#')[0];
  return /\/app\/dev\/empleos\/postulacion\/?$/.test(pathOnly);
}

function trackingStepLabelByIndex(t: (k: string) => string, idx: number): string {
  if (idx === 0) return t('devEmpleosPage.trackingApplied');
  if (idx === 1) return t('devEmpleosPage.trackingViewed');
  return t('devEmpleosPage.trackingInProcess');
}

function describeCurrentFocus(
  t: (k: string) => string,
  steps: TrackingStepView[],
  terminal: { rejected: { state: string }; finished: { state: string } },
): string {
  if (terminal.finished.state === 'current') return t('devEmpleosPage.trackingFinished');
  if (terminal.rejected.state === 'current') return t('devEmpleosPage.trackingRejected');
  const current = steps.find((s) => s.state === 'current');
  if (current) return current.label;
  const next = steps.find((s) => s.state === 'upcoming');
  if (next) return next.label;
  return t('devEmpleosPage.trackingInProcess');
}

function appFilterBucket(statusRaw: string): ApplicationFilter {
  const s = statusRaw.trim().toLowerCase();
  if (s === 'accepted') return 'finalist';
  if (s === 'rejected' || s === 'mismatched' || s === 'withdrawn') return 'rejected';
  if (s === 'short listed' || s === 'verified' || s === 'tps requested' || s === 'client proposed') {
    return 'viewed';
  }
  return 'applied';
}

function isClosedJobStatus(statusRaw: string | undefined | null): boolean {
  const s = String(statusRaw ?? '').trim().toLowerCase();
  return s === 'completed' || s === 'closed' || s === 'position closed' || s === 'on hold';
}

function isExpiredIso(isoRaw: string | undefined | null): boolean {
  const raw = String(isoRaw ?? '').trim();
  if (!raw) return false;
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return false;
  return t < Date.now();
}

function isClosedApplication(
  a: DevApplicationRow,
  matchedJob: PublicJobListItem | undefined,
): boolean {
  const title =
    a.job?.title?.trim() ||
    matchedJob?.title?.trim() ||
    '';
  const closedByStatus = isClosedJobStatus(a.job?.status);
  const closedByExpiry = isExpiredIso(matchedJob?.expiresAt);
  const closedByUnavailable = Boolean(a.jobId) && !matchedJob && title !== '';
  return closedByStatus || closedByExpiry || closedByUnavailable;
}

export default function AppDevEmpleosPage() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const isPostulacion = isPostulacionPath(location);
  const [rows, setRows] = useState<PublicJobListItem[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [apps, setApps] = useState<DevApplicationRow[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PublicJobListItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<DevApplicationRow | null>(null);
  const [jobsAuthTick, setJobsAuthTick] = useState(0);
  const [jobsSearch, setJobsSearch] = useState('');
  const [jobsIndustryFilter, setJobsIndustryFilter] = useState('all');
  const [jobsSort, setJobsSort] = useState<'newest' | 'oldest'>('newest');
  const [applicationFilters, setApplicationFilters] = useState<ApplicationFilter[]>([]);
  const [applicationSort, setApplicationSort] = useState<'newest' | 'oldest'>('newest');
  const [applicationSearch, setApplicationSearch] = useState('');

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    const bump = () => setJobsAuthTick((n) => n + 1);
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, bump);
    return () => window.removeEventListener(DEV_AUTH_CHANGE_EVENT, bump);
  }, []);

  useEffect(() => {
    if (!apiBase) {
      setJobsError(t('devEmpleosPage.configError'));
      setJobsLoading(false);
      return;
    }
    const token = getDevAccessToken();
    let cancelled = false;
    setJobsLoading(true);
    setJobsError(null);
    const load = token
      ? fetchDeveloperPostedJobs(apiBase, token, 100)
      : fetchPublicPostedJobs(apiBase, 100);
    void load
      .then((data) => {
        if (cancelled) return;
        setRows(data);
      })
      .catch(() => {
        if (!cancelled) setJobsError(t('devEmpleosPage.loadError'));
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, t, jobsAuthTick]);


  const loadApplications = useCallback((silent = false) => {
    if (!apiBase) {
      setAppsError(t('devEmpleosPage.configError'));
      return;
    }
    const token = getDevAccessToken();
    if (!token) {
      setAppsError(t('devEmpleosPage.applicationsNoSession'));
      return;
    }
    if (!silent) {
      setAppsLoading(true);
    }
    setAppsError(null);
    const url = new URL(`${apiBase}/developer/applications`);
    url.searchParams.set('page', '1');
    url.searchParams.set('pageSize', '50');
    void fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) {
          const msg = res.status === 500 ? t('devEmpleosPage.applicationsBackendError') : t('devEmpleosPage.applicationsError');
          throw new Error(msg);
        }
        return res.json() as Promise<ApplicationsApiResponse>;
      })
      .then((body) => {
        setApps(Array.isArray(body.data) ? body.data : []);
      })
      .catch((e: unknown) => {
        if (!silent) {
          setApps([]);
        }
        setAppsError(e instanceof Error ? e.message : t('devEmpleosPage.applicationsError'));
      })
      .finally(() => {
        if (!silent) {
          setAppsLoading(false);
        }
      });
  }, [apiBase, t]);

  useEffect(() => {
    if (!isPostulacion) return;
    void loadApplications();
  }, [isPostulacion, loadApplications]);

  useEffect(() => {
    if (!isPostulacion) return;
    const onFocus = () => {
      void loadApplications(true);
    };
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadApplications(true);
      }
    }, 15000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [isPostulacion, loadApplications]);

  useEffect(() => {
    if (isPostulacion || jobsLoading || rows.length === 0) return;
    const q = location.includes('?') ? location.split('?')[1] : '';
    const params = new URLSearchParams(q);
    const jid = params.get('job');
    if (!jid) return;
    const found = rows.find((j) => j.id === jid);
    if (found) setSelected(found);
  }, [location, rows, jobsLoading, isPostulacion]);

  const emptyJobs = !jobsLoading && !jobsError && rows.length === 0;
  const filteredApps = useMemo(() => {
    const jobsMap = new Map<string, PublicJobListItem>();
    for (const r of rows) jobsMap.set(r.id, r);
    const q = applicationSearch.trim().toLowerCase();
    const byFilter = apps.filter((a) => {
      if (!(applicationFilters.length === 0 ? true : applicationFilters.includes(appFilterBucket(a.status)))) {
        return false;
      }
      if (!q) return true;
      const matchedJob = a.jobId ? jobsMap.get(a.jobId) : undefined;
      const title =
        a.job?.title?.trim() ||
        matchedJob?.title?.trim() ||
        t('devEmpleosPage.applicationNoJobTitle');
      const hay = `${title} ${a.status}`.toLowerCase();
      return q
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => hay.includes(token));
    });
    return [...byFilter].sort((a, b) => {
      const ams = Date.parse(a.createdAt);
      const bms = Date.parse(b.createdAt);
      const aSafe = Number.isFinite(ams) ? ams : 0;
      const bSafe = Number.isFinite(bms) ? bms : 0;
      return applicationSort === 'newest' ? bSafe - aSafe : aSafe - bSafe;
    });
  }, [apps, applicationFilters, applicationSearch, applicationSort, rows, t]);
  const applicationStats = useMemo(() => {
    const jobsMap = new Map<string, PublicJobListItem>();
    for (const r of rows) jobsMap.set(r.id, r);
    const total = apps.length;
    let applied = 0;
    let viewed = 0;
    let finalist = 0;
    let rejected = 0;
    let closed = 0;
    for (const a of apps) {
      const matchedJob = a.jobId ? jobsMap.get(a.jobId) : undefined;
      if (isClosedApplication(a, matchedJob)) closed += 1;
      const bucket = appFilterBucket(a.status);
      if (bucket === 'applied') applied += 1;
      else if (bucket === 'viewed') viewed += 1;
      else if (bucket === 'finalist') finalist += 1;
      else if (bucket === 'rejected') rejected += 1;
    }
    const inProgress = viewed + finalist;
    return { total, applied, viewed, finalist, rejected, closed, inProgress };
  }, [apps, rows]);
  /** Las 3 postulaciones más recientes por fecha (todas las aplicaciones, sin filtros de la lista). */
  const recentApplicationsPreview = useMemo(() => {
    const jobsMap = new Map<string, PublicJobListItem>();
    for (const r of rows) jobsMap.set(r.id, r);
    return [...apps]
      .sort((a, b) => {
        const ams = Date.parse(a.createdAt);
        const bms = Date.parse(b.createdAt);
        const aSafe = Number.isFinite(ams) ? ams : 0;
        const bSafe = Number.isFinite(bms) ? bms : 0;
        return bSafe - aSafe;
      })
      .slice(0, 3)
      .map((a) => {
        const matchedJob = a.jobId ? jobsMap.get(a.jobId) : undefined;
        const title =
          a.job?.title?.trim() ||
          matchedJob?.title?.trim() ||
          'Sin título';
        return { id: a.id, title };
      });
  }, [apps, rows]);
  const emptyApps = !appsLoading && !appsError && filteredApps.length === 0;
  const jobsById = useMemo(() => {
    const out = new Map<string, PublicJobListItem>();
    for (const r of rows) out.set(r.id, r);
    return out;
  }, [rows]);
  const jobsIndustryOptions = useMemo(() => {
    const s = new Set<string>();
    for (const j of rows) {
      const ind = (j.industry ?? '').trim();
      if (ind) s.add(ind);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);
  const filteredJobs = useMemo(() => {
    const q = jobsSearch.trim().toLowerCase();
    const byFilter = rows.filter((job) => {
      if (jobsIndustryFilter !== 'all' && (job.industry ?? '').trim() !== jobsIndustryFilter) return false;
      if (!q) return true;
      const hay = [job.title, job.summary ?? '', job.description ?? '', job.company?.name ?? '', job.industry ?? '']
        .join(' ')
        .toLowerCase();
      return q
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => hay.includes(token));
    });
    return [...byFilter].sort((a, b) => {
      const ams = Date.parse(String(a.createdAt ?? a.updatedAt ?? ''));
      const bms = Date.parse(String(b.createdAt ?? b.updatedAt ?? ''));
      const aSafe = Number.isFinite(ams) ? ams : 0;
      const bSafe = Number.isFinite(bms) ? bms : 0;
      return jobsSort === 'newest' ? bSafe - aSafe : aSafe - bSafe;
    });
  }, [rows, jobsIndustryFilter, jobsSearch, jobsSort]);

  const pagePathWithoutLang = isPostulacion ? '/app/dev/empleos/postulacion' : '/app/dev/empleos/ofertas';
  const pageTitle = `${t('sidebarDemo.navEmpleos')} — ${isPostulacion ? t('devEmpleosPage.tabPostulacion') : t('devEmpleosPage.tabOfertas')}`;
  const toggleApplicationFilter = (filter: ApplicationFilter) => {
    setApplicationFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter],
    );
  };

  if (!isPostulacion) {
    return <DevJobBoard variant="empleos" />;
  }

  return (
    <AppShell
      pathWithoutLang={pagePathWithoutLang}
      title={pageTitle}
      description={t('seo.appDevEmpleos')}
    >
      <div className={`mx-auto w-full ${isPostulacion ? 'max-w-7xl' : 'max-w-3xl'}`}>
        {isPostulacion ? (
          appsLoading ? (
            <p className="text-sm text-zinc-600">{t('devEmpleosPage.applicationsLoading')}</p>
          ) : appsError ? (
            <p className="text-sm text-amber-800" role="alert">
              {appsError}
            </p>
          ) : (
            <div className="space-y-4">
              <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Active Pipeline</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Tienes {applicationStats.inProgress} aplicaciones activas en progreso.
                </p>
                <div className="mt-4 max-w-md">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="search"
                      value={applicationSearch}
                      onChange={(e) => setApplicationSearch(e.target.value)}
                      placeholder="Buscar aplicación, rol o estado..."
                      className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 items-center gap-1 rounded-full border border-sky-200 bg-sky-100 px-3 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                    <Filter className="size-3.5" />
                    Filter
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={applicationFilters.length === 0 ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setApplicationFilters([])}
                  >
                    Todas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={applicationFilters.includes('applied') ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleApplicationFilter('applied')}
                  >
                    Aplicadas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={applicationFilters.includes('viewed') ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleApplicationFilter('viewed')}
                  >
                    Vistas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={applicationFilters.includes('finalist') ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleApplicationFilter('finalist')}
                  >
                    Finalista
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={applicationFilters.includes('rejected') ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => toggleApplicationFilter('rejected')}
                  >
                    Rechazada
                  </Button>
                  <label className="ml-auto flex h-9 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
                    Sort by
                    <select
                      value={applicationSort}
                      onChange={(e) => setApplicationSort(e.target.value as 'newest' | 'oldest')}
                      className="bg-transparent text-xs font-semibold outline-none"
                    >
                      <option value="newest">Recent</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </label>
                </div>
              </section>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div>
              {emptyApps ? (
                <div
                  className="flex min-h-[min(16rem,calc(100vh-12rem))] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-6 py-12 text-center"
                  aria-labelledby="dev-postulacion-empty"
                >
                  <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80">
                    <ClipboardList className="size-6 text-zinc-400" aria-hidden />
                  </span>
                  <h2 id="dev-postulacion-empty" className="text-base font-semibold text-[#0f172a]">
                    {t('devEmpleosPage.applicationsEmptyTitle')}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-zinc-600">
                    {t('devEmpleosPage.applicationsEmptyDescription')}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2">
                  {filteredApps.map((a) => {
                  const matchedJob = a.jobId ? jobsById.get(a.jobId) : undefined;
                  const title =
                    a.job?.title?.trim() ||
                    matchedJob?.title?.trim() ||
                    'Sin título';
                  const isClosedPosition = isClosedApplication(a, matchedJob);
                  const tracking = getDevApplicationTrackingFromStatus(a.status ?? '');
                  const isFinalist = appFilterBucket(a.status) === 'finalist';
                  const showFinalistBadge = isFinalist && !isClosedPosition;
                  const mainSteps: TrackingStepView[] = tracking.mainLine.map((s, idx) => ({
                    idx,
                    label: trackingStepLabelByIndex(t, idx),
                    state: s.state,
                  }));
                  const focusText = isClosedPosition
                    ? 'Posición cerrada'
                    : describeCurrentFocus(t, mainSteps, tracking.terminal);
                  return (
                    <Card
                      key={a.id}
                      className={[
                        'relative h-fit overflow-hidden rounded-2xl border-zinc-200/80 bg-white shadow-sm',
                        isClosedPosition ? 'border-zinc-300 bg-zinc-100/70 dark:border-zinc-700 dark:bg-zinc-900/80' : '',
                        showFinalistBadge ? 'ring-2 ring-fuchsia-200/70' : '',
                      ].join(' ')}
                    >
                      {showFinalistBadge ? (
                        <>
                          <div className="pointer-events-none absolute -top-16 -right-20 h-44 w-44 rounded-full bg-fuchsia-300/30 blur-3xl" />
                          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
                        </>
                      ) : null}
                    <CardHeader className="space-y-1 pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-lg font-bold text-[#0f172a]">{title}</CardTitle>
                          <p className="text-xs text-zinc-500">
                            {t('devEmpleosPage.applicationDate')}: {formatWhen(a.createdAt, i18n.language)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {isClosedPosition ? (
                            <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                              Posición cerrada
                            </span>
                          ) : null}
                          {showFinalistBadge ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-700">
                              <PartyPopper className="size-3" />
                              Finalista
                              <Sparkles className="size-3" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-3">
                      <ol className="flex items-start" aria-label={t('devEmpleosPage.trackingHeading')}>
                        {mainSteps.map((s, idx) => {
                          const isDone = s.state === 'completed';
                          const isCurrent = s.state === 'current';
                          return (
                            <li key={`${a.id}-step-${s.idx}`} className="relative min-w-0 flex-1 text-center">
                              <div className="relative z-10 flex min-w-0 flex-col items-center">
                                <span
                                  className={[
                                    'flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                                    isClosedPosition
                                      ? 'border-zinc-400 bg-zinc-200 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                                      : isDone
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : isCurrent
                                          ? 'border-blue-600 bg-white text-blue-700'
                                          : 'border-zinc-200 bg-zinc-50 text-zinc-400',
                                  ].join(' ')}
                                >
                                  {String(s.idx + 1).padStart(2, '0')}
                                </span>
                                <span
                                  className={[
                                    'mt-1 text-center text-[10px] font-semibold uppercase tracking-wide',
                                    isClosedPosition
                                      ? 'text-zinc-500 dark:text-zinc-400'
                                      : s.state === 'upcoming'
                                        ? 'text-zinc-400'
                                        : 'text-blue-700',
                                  ].join(' ')}
                                >
                                  {s.label}
                                </span>
                              </div>
                              {idx < mainSteps.length - 1 ? (
                                <span
                                  className={[
                                    'absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2',
                                    isClosedPosition
                                      ? 'bg-zinc-300 dark:bg-zinc-700'
                                      : isDone
                                        ? 'bg-blue-600'
                                        : 'bg-zinc-200',
                                  ].join(' ')}
                                  aria-hidden
                                />
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>

                      <div className={`rounded-xl p-4 ${isClosedPosition ? 'bg-zinc-200/80 dark:bg-zinc-800/70' : 'bg-slate-100/80'}`}>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            isClosedPosition ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          Current focus
                        </p>
                        <p
                          className={`mt-1 text-lg font-bold ${
                            isClosedPosition ? 'text-zinc-700 dark:text-zinc-100' : 'text-[#0f172a]'
                          }`}
                        >
                          {focusText}
                        </p>
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
                </div>
              )}
                </div>
                <aside className="space-y-4">
                  <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold">Application Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200/90 bg-slate-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:border-slate-700/80 dark:bg-slate-950/45 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            Total Applied
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-slate-950 dark:text-slate-50">
                            {applicationStats.total}
                          </p>
                        </div>
                        <div className="rounded-xl border border-sky-200/90 bg-sky-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:border-sky-900/50 dark:bg-sky-950/35 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
                            Aplicado
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-sky-950 dark:text-sky-50">
                            {applicationStats.applied}
                          </p>
                        </div>
                        <div className="rounded-xl border border-teal-200/90 bg-teal-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:border-teal-900/45 dark:bg-teal-950/35 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                            Vista
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-teal-950 dark:text-teal-50">
                            {applicationStats.viewed}
                          </p>
                        </div>
                        <div className="rounded-xl border border-fuchsia-200/90 bg-fuchsia-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:border-fuchsia-900/45 dark:bg-fuchsia-950/35 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-800 dark:text-fuchsia-300">
                            Finalista
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-fuchsia-950 dark:text-fuchsia-50">
                            {applicationStats.finalist}
                          </p>
                        </div>
                        <div className="rounded-xl border border-rose-200/90 bg-rose-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:border-rose-900/50 dark:bg-rose-950/35 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                            No seleccionado / Rechazado
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-rose-950 dark:text-rose-50">
                            {applicationStats.rejected}
                          </p>
                        </div>
                        <div className="rounded-xl border border-violet-200/90 bg-violet-50/95 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:border-violet-900/45 dark:bg-violet-950/35 dark:shadow-none">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-300">
                            Posiciones cerradas
                          </p>
                          <p className="mt-1 text-2xl font-black tabular-nums text-violet-950 dark:text-violet-50">
                            {applicationStats.closed}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold">{t('devEmpleosPage.applicationsRecentTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentApplicationsPreview.length === 0 ? (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {t('devEmpleosPage.applicationsRecentEmpty')}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {recentApplicationsPreview.map((item) => (
                            <div
                              key={item.id}
                              className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50 px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                            >
                              <p className="text-sm font-semibold leading-snug text-zinc-900 line-clamp-2 dark:text-zinc-100">
                                {item.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          )
        ) : jobsLoading ? (
          <p className="text-sm text-zinc-600">{t('devEmpleosPage.loading')}</p>
        ) : jobsError ? (
          <p className="text-sm text-red-700" role="alert">
            {jobsError}
          </p>
        ) : emptyJobs ? (
          <div
            className="flex min-h-[min(20rem,calc(100vh-12rem))] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-6 py-12 text-center"
            aria-labelledby="dev-empleos-empty-title"
          >
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80">
              <Briefcase className="size-7 text-zinc-400" aria-hidden />
            </span>
            <h2 id="dev-empleos-empty-title" className="text-lg font-semibold text-[#0f172a]">
              {t('devEmpleosPage.emptyTitle')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-600">{t('devEmpleosPage.emptyDescription')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white px-4 py-4 shadow-sm sm:px-5">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <div className="min-w-0 w-full max-w-md flex-1 sm:w-auto">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                      type="search"
                      value={jobsSearch}
                      onChange={(e) => setJobsSearch(e.target.value)}
                      placeholder="Buscar ofertas..."
                      className="h-10 w-full rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm placeholder:text-zinc-400"
                    />
                  </div>
                </div>
                <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-medium text-zinc-700">
                  Categoría
                  <select
                    value={jobsIndustryFilter}
                    onChange={(e) => setJobsIndustryFilter(e.target.value)}
                    className="bg-transparent text-sm outline-none"
                  >
                    <option value="all">Todas</option>
                    {jobsIndustryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-medium text-zinc-700">
                  Orden
                  <select
                    value={jobsSort}
                    onChange={(e) => setJobsSort(e.target.value as 'newest' | 'oldest')}
                    className="bg-transparent text-sm outline-none"
                  >
                    <option value="newest">Más nuevo</option>
                    <option value="oldest">Más viejo</option>
                  </select>
                </label>
              </div>
            </div>
            {filteredJobs.length === 0 ? (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-6 py-10 text-center">
                <p className="text-sm font-medium text-zinc-700">No hay ofertas para estos filtros.</p>
              </div>
            ) : (
            <div className="grid gap-3">
            {filteredJobs.map((job) => {
              const companyName = job.company?.name?.trim() || '—';
              const preview = job.summary?.trim() || stripHtml(job.description ?? '').slice(0, 220);
              return (
                <Card key={job.id} className="border-zinc-200/80 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-[#0f172a]">{job.title}</CardTitle>
                    <p className="text-sm text-zinc-600">
                      {companyName}
                      {job.location ? ` · ${job.location}` : ''}
                      {job.industry ? ` · ${job.industry}` : ''}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {preview ? (
                      <p className="line-clamp-3 text-sm text-zinc-700">{preview}</p>
                    ) : null}
                    <div className="flex justify-end">
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(job)}>
                        {t('devEmpleosPage.viewDetails')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-2 text-sm text-zinc-700">
              <p>
                <span className="font-medium text-zinc-900">{t('devEmpleosPage.company')}: </span>
                {selected.company?.name?.trim() || '—'}
              </p>
              {selected.location ? (
                <p>
                  <span className="font-medium text-zinc-900">{t('devEmpleosPage.location')}: </span>
                  {selected.location}
                </p>
              ) : null}
              {selected.description?.trim() || selected.summary?.trim() ? (
                <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 p-3">
                  <div
                    className="job-overview-display text-sm leading-relaxed text-zinc-800 [&_a]:text-sky-800 [&_a]:underline [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
                    // eslint-disable-next-line react/no-danger -- HTML de la API, saneado
                    dangerouslySetInnerHTML={{
                      __html: sanitizeOverviewHtmlForDisplay(
                        ensureEditorHtml(selected.description?.trim() || selected.summary?.trim() || ''),
                      ),
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={selectedApp !== null} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-left">
              {selectedApp?.job?.title?.trim() || t('devEmpleosPage.applicationDetailTitle')}
            </DialogTitle>
          </DialogHeader>
          {selectedApp ? (
            <div className="space-y-4 text-sm text-zinc-700">
              <p className="text-xs text-zinc-500">
                {t('devEmpleosPage.applicationDate')}: {formatWhen(selectedApp.createdAt, i18n.language)}
              </p>
              <DevApplicationTrackingBar
                tracking={getDevApplicationTrackingFromStatus(selectedApp.status ?? '')}
                showMockNotice={false}
              />
              {selectedApp.coverLetter?.trim() ? (
                <div>
                  <p className="font-medium text-zinc-900">{t('devEmpleosPage.coverLetter')}</p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-600">{selectedApp.coverLetter}</p>
                </div>
              ) : null}
              <p className="border-t border-zinc-100 pt-2 text-xs text-zinc-400">
                {t('devEmpleosPage.apiStatusRef')}: {selectedApp.status}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
