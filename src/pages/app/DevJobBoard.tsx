import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Bookmark, Search, SearchX, Share2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app/AppShell';
import { JobOfferCreateStylePreview } from '@/components/app/JobOfferCreateStylePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isLocale } from '@/app/i18n';
import { useLocale } from '@/hooks/useLocale';
import { ensureEditorHtml } from '@/lib/jobOverviewHtml';
import {
  fetchDeveloperPostedJobs,
  fetchDeveloperSavedJobs,
  fetchPublicPostedJobs,
  isPublicJobExpired,
  jobMatchesSearch,
  previewTextForJob,
  saveDeveloperJob,
  unsaveDeveloperJob,
  type PublicJobListItem,
} from '@/lib/devPublicJobs';
import { postDeveloperApplication } from '@/lib/devApplicationsApi';
import { DEV_AUTH_CHANGE_EVENT, getDevAccessToken } from '@/lib/devAuth';
import { cn } from '@/lib/utils';

const DASHBOARD_OPENINGS_COUNT = 100;
const DASHBOARD_RECENT_COUNT = 20;
const NEW_OPENINGS_MIN_HOURS = 1;
const NEW_OPENINGS_MAX_HOURS = 72;

function appPathWithoutLocale(wouterLocation: string): string {
  const pathOnly = wouterLocation.split('?')[0].split('#')[0];
  const parts = pathOnly.split('/').filter(Boolean);
  if (parts[0] && isLocale(parts[0])) {
    const rest = parts.slice(1);
    return rest.length > 0 ? `/${rest.join('/')}` : '/';
  }
  return pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
}

function toNum(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatSalaryRange(job: PublicJobListItem, locale: string): string | null {
  const min = toNum(job.minSalary);
  const max = toNum(job.maxSalary);
  const currency = locale.startsWith('es') ? 'MXN' : 'USD';
  const fmt = (x: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(x);
  if (min != null && max != null && min !== max) {
    return `${fmt(min)} – ${fmt(max)}`;
  }
  const single = min ?? max;
  if (single != null) return fmt(single);
  return null;
}

function relativeOrShortDate(iso: string | undefined | null, locale: string): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const sec = abs / 1000;
  const min = sec / 60;
  const hr = min / 60;
  const day = hr / 24;
  const lang = locale.startsWith('es') ? 'es' : 'en';
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (sec < 60) return rtf.format(Math.round(diffMs / 1000), 'second');
  if (min < 60) return rtf.format(Math.round(diffMs / (60 * 1000)), 'minute');
  if (hr < 24) return rtf.format(Math.round(diffMs / (3600 * 1000)), 'hour');
  if (day < 42) return rtf.format(Math.round(diffMs / (86400 * 1000)), 'day');
  return d.toLocaleDateString(locale, { dateStyle: 'medium' });
}

function isWithinNewOpeningsWindow(job: PublicJobListItem): boolean {
  const baseMs = Date.parse(String(job.updatedAt ?? job.createdAt ?? ''));
  if (!Number.isFinite(baseMs)) return false;
  const ageMs = Date.now() - baseMs;
  if (ageMs < 0) return false;
  const ageHours = ageMs / (60 * 60 * 1000);
  return ageHours >= NEW_OPENINGS_MIN_HOURS && ageHours <= NEW_OPENINGS_MAX_HOURS;
}

export type DevJobBoardProps = {
  /** Dashboard = ofertas más recientes; `guardadas` = solo ofertas guardadas (submenú Trabajo). */
  variant: 'dashboard' | 'guardadas' | 'empleos';
};

export function DevJobBoard({ variant }: DevJobBoardProps) {
  const { t, i18n } = useTranslation();
  const { path } = useLocale();
  const [wouterPath] = useLocation();
  const pathWithoutLang = appPathWithoutLocale(wouterPath);

  const [rows, setRows] = useState<PublicJobListItem[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [jobsSort, setJobsSort] = useState<'newest' | 'oldest'>('newest');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [shareHint, setShareHint] = useState(false);
  const [authSessionTick, setAuthSessionTick] = useState(0);
  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<'ok' | 'err' | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    const bump = () => setAuthSessionTick((n) => n + 1);
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, bump);
    return () => window.removeEventListener(DEV_AUTH_CHANGE_EVENT, bump);
  }, []);

  useEffect(() => {
    if (!apiBase) {
      setError(t('devEmpleosPage.configError'));
      setLoadState('done');
      return;
    }
    const token = getDevAccessToken();
    let cancelled = false;
    setLoadState('loading');
    setError(null);
    const load =
      token && variant === 'guardadas'
        ? fetchDeveloperSavedJobs(apiBase, token, DASHBOARD_OPENINGS_COUNT)
        : token
          ? fetchDeveloperPostedJobs(apiBase, token, DASHBOARD_OPENINGS_COUNT)
          : fetchPublicPostedJobs(apiBase, DASHBOARD_OPENINGS_COUNT);
    void load
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setError(t('devEmpleosPage.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoadState('done');
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, t, authSessionTick, variant]);

  const baseFiltered = useMemo(() => {
    return rows.filter((job) => {
      if (!jobMatchesSearch(job, searchQuery)) return false;
      if (industryFilter !== 'all' && (job.industry ?? '').trim() !== industryFilter) return false;
      return true;
    });
  }, [rows, searchQuery, industryFilter]);

  const displayRows = useMemo(() => {
    const sorted = [...baseFiltered].sort((a, b) => {
      const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return jobsSort === 'newest' ? tb - ta : ta - tb;
    });
    if (variant === 'dashboard') {
      return sorted.filter(isWithinNewOpeningsWindow).slice(0, DASHBOARD_RECENT_COUNT);
    }
    return sorted;
  }, [baseFiltered, variant, jobsSort]);
  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const j of rows) {
      const v = (j.industry ?? '').trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  useEffect(() => {
    if (displayRows.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && displayRows.some((j) => j.id === prev) ? prev : displayRows[0].id,
    );
  }, [displayRows]);

  const toggleSaved = async (id: string) => {
    const token = getDevAccessToken();
    if (!token || !apiBase) return;
    const currentlySaved = rows.find((job) => job.id === id)?.saved === true;
    if (currentlySaved) {
      await unsaveDeveloperJob(apiBase, token, id);
    } else {
      await saveDeveloperJob(apiBase, token, id);
    }
    setRows((prev) => prev.map((job) => (job.id === id ? { ...job, saved: !currentlySaved } : job)));
  };

  useEffect(() => {
    if (!selectedId) return;
    const el = listItemRefs.current.get(selectedId);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  useEffect(() => {
    setApplyFeedback(null);
    setApplyError(null);
  }, [selectedId]);

  const selectedJob = useMemo(
    () => displayRows.find((j) => j.id === selectedId) ?? null,
    [displayRows, selectedId],
  );

  const submitApplication = async () => {
    if (!selectedJob || !apiBase) return;
    const token = getDevAccessToken();
    if (!token) {
      setApplyError(t('devEmpleosPage.applicationsNoSession'));
      setApplyFeedback('err');
      return;
    }
    if (selectedJob.applied) return;
    setApplying(true);
    setApplyError(null);
    setApplyFeedback(null);
    try {
      await postDeveloperApplication(apiBase, token, selectedJob.id);
      setRows((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, applied: true } : j)));
      setApplyFeedback('ok');
      window.setTimeout(() => setApplyFeedback(null), 5000);
    } catch (e) {
      setApplyFeedback('err');
      setApplyError(e instanceof Error ? e.message : t('devEmpleosPage.applicationsError'));
    } finally {
      setApplying(false);
    }
  };

  const shareJob = async (job: PublicJobListItem) => {
    const href = path(`/app/dev/empleos/ofertas?job=${encodeURIComponent(job.id)}`);
    const full = `${typeof window !== 'undefined' ? window.location.origin : ''}${href}`;
    try {
      await navigator.clipboard.writeText(full);
      setShareHint(true);
      window.setTimeout(() => setShareHint(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const empty = loadState === 'done' && !error && rows.length === 0;
  const showGuardadasEmpty =
    variant === 'guardadas' && loadState === 'done' && !error && rows.length === 0;
  const emptyAfterFilter =
    loadState === 'done' && !error && rows.length > 0 && displayRows.length === 0 && !showGuardadasEmpty;

  const postulacionHref = path('/app/dev/empleos/postulacion');

  const pageTitle =
    variant === 'dashboard'
      ? t('devDashboard.newOpeningsSection')
      : variant === 'guardadas'
        ? t('devDashboard.tabSavedJobs')
        : t('sidebarDemo.navEmpleos');
  const pageSeo = variant === 'guardadas' ? t('seo.appDevGuardadas') : t('seo.appDev');

  return (
    <AppShell pathWithoutLang={pathWithoutLang} title={pageTitle} description={pageSeo}>
      <section className="mx-auto w-full max-w-[min(100%,80rem)] space-y-5">
        {variant === 'dashboard' ? (
          <header className="border-b border-zinc-200/80 pb-5">
            <h1 className="text-[1.7rem] font-black leading-tight tracking-tight text-[#0f172a] sm:text-[2rem]">
              {t('devDashboard.recentListIntro')}
            </h1>
          </header>
        ) : variant === 'empleos' ? (
          <header className="border-b border-zinc-200/80 pb-5">
            <h1 className="text-[1.7rem] font-black leading-tight tracking-tight text-[#0f172a] sm:text-[2rem]">
              {t('sidebarDemo.navEmpleos')}
            </h1>
          </header>
        ) : (
          <header className="border-b border-zinc-200/80 pb-5 dark:border-zinc-700">
            <h1 className="text-[1.7rem] font-black leading-tight tracking-tight text-[#0f172a] sm:text-[2rem]">
              {t('devDashboard.tabSavedJobs')}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-zinc-600">
              {t('devDashboard.savedPageSubtitle')}
            </p>
          </header>
        )}

        <div
          className={cn(
            'flex flex-col gap-3 rounded-2xl border border-zinc-200/90 px-4 py-4 shadow-md shadow-zinc-200/40 dark:border-zinc-700 dark:shadow-black/35 sm:px-5',
            variant === 'dashboard' ? 'bg-zinc-50/95' : 'bg-white',
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <div className="min-w-0 w-full max-w-md flex-1 sm:w-auto">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-[1.125rem] -translate-y-1/2 text-zinc-400"
                  aria-hidden
                />
                <Input
                  type="search"
                  name={variant === 'dashboard' ? 'dev-dashboard-job-search' : 'dev-guardadas-job-search'}
                  className="h-11 w-full rounded-xl border-zinc-200 bg-zinc-50/50 pl-10 text-[15px] placeholder:text-zinc-400 focus-visible:bg-white dark:focus-visible:bg-zinc-900"
                  placeholder={t('devDashboard.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-[13px] font-medium text-zinc-700 dark:border-zinc-600">
              Categoría
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-transparent text-[14px] outline-none"
              >
                <option value="all">Todas</option>
                {industryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 text-[13px] font-medium text-zinc-700 dark:border-zinc-600">
              Orden
              <select
                value={jobsSort}
                onChange={(e) => setJobsSort(e.target.value as 'newest' | 'oldest')}
                className="bg-transparent text-[14px] outline-none"
              >
                <option value="newest">Más nuevo</option>
                <option value="oldest">Más viejo</option>
              </select>
            </label>
          </div>
        </div>

        {loadState === 'loading' ? (
          <p className="text-sm text-zinc-600">{t('devEmpleosPage.loading')}</p>
        ) : error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : empty ? (
          <div className="rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-4 py-10 text-center">
            <h3 className="text-base font-semibold text-zinc-900">{t('devEmpleosPage.emptyTitle')}</h3>
            <p className="mt-2 text-sm text-zinc-600">{t('devEmpleosPage.emptyDescription')}</p>
          </div>
        ) : showGuardadasEmpty ? (
          <div className="relative overflow-hidden rounded-3xl border border-sky-100/90 bg-gradient-to-br from-sky-50/90 via-white to-violet-50/30 px-6 py-14 text-center shadow-lg shadow-sky-100/50 dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:shadow-xl dark:shadow-black/40">
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-sky-200/25 blur-2xl dark:bg-sky-500/10"
              aria-hidden
            />
            <div className="relative mx-auto flex max-w-md flex-col items-center gap-5">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-sky-200/50 ring-1 ring-sky-100 dark:!bg-zinc-800 dark:shadow-black/40 dark:ring-zinc-600">
                <Bookmark className="size-10 text-sky-600 dark:text-sky-400" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                  {t('devDashboard.savedEmptyTitle')}
                </h2>
                <p className="text-base leading-relaxed text-zinc-600">
                  {t('devDashboard.savedTabEmpty')}
                </p>
              </div>
            </div>
          </div>
        ) : emptyAfterFilter ? (
          <div className="relative overflow-hidden rounded-3xl border border-amber-100/90 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/20 px-6 py-12 text-center shadow-md dark:border-zinc-700 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 dark:shadow-lg dark:shadow-black/35">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-800 ring-1 ring-amber-200/80 dark:!bg-zinc-800 dark:text-amber-400 dark:ring-zinc-600">
                <SearchX className="size-8" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">{t('devDashboard.filterEmptyTitle')}</h2>
                <p className="text-[15px] leading-relaxed text-zinc-600">{t('devDashboard.noFilterResults')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'overflow-hidden rounded-2xl border border-zinc-200/90 shadow-sm',
              variant === 'dashboard' ? 'bg-zinc-50/95' : 'bg-white',
            )}
          >
            <div className="flex min-h-[min(28rem,78vh)] flex-col divide-y divide-zinc-200 lg:flex-row lg:divide-x lg:divide-y-0">
              <div className="flex max-h-[min(42vh,22rem)] shrink-0 flex-col gap-2 overflow-y-auto p-2 lg:max-h-none lg:w-[min(100%,22rem)] lg:min-w-[17rem] lg:shrink-0">
                {displayRows.map((job) => {
                  const salary = formatSalaryRange(job, i18n.language);
                  const whenIso = job.updatedAt ?? job.createdAt;
                  const when = relativeOrShortDate(whenIso, i18n.language);
                  const preview = previewTextForJob(job, 140);
                  const isSelected = selectedId === job.id;
                  const expired = isPublicJobExpired(job);

                  return (
                    <button
                      key={job.id}
                      type="button"
                      ref={(el) => {
                        if (el) listItemRefs.current.set(job.id, el);
                        else listItemRefs.current.delete(job.id);
                      }}
                      className={cn(
                        'dev-job-list-item flex w-full flex-col gap-1.5 rounded-xl border px-4 py-3.5 text-left transition-colors sm:rounded-2xl',
                        isSelected
                          ? 'dev-job-list-item-selected border-sky-600 bg-sky-50/60 shadow-[inset_0_0_0_1px_rgba(2,132,199,0.2)]'
                          : 'border-zinc-200 bg-white hover:border-zinc-300',
                        expired && 'opacity-70 grayscale-[0.45]',
                      )}
                      onClick={() => setSelectedId(job.id)}
                    >
                      {expired ? (
                        <span className="pointer-events-none absolute inset-0 rounded-xl bg-zinc-300/10 backdrop-blur-[1px]" aria-hidden />
                      ) : null}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 sm:text-base">
                            {job.title}
                          </p>
                          <p className="mt-0.5 truncate text-[13px] text-zinc-600">
                            {job.company?.name?.trim() || '—'}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {expired ? (
                            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-700">
                              No disponible
                            </span>
                          ) : null}
                          {job.isEvergreen ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                              {t('devDashboard.featuredBadge')}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-600">
                        {salary ? (
                          <span>
                            {salary}{' '}
                            <span className="text-zinc-400">({t('devDashboard.salaryMonthlyHint')})</span>
                          </span>
                        ) : null}
                      </div>
                      {preview ? (
                        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{preview}</p>
                      ) : null}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {when ? (
                          <span className="text-[11px] text-zinc-400">
                            {t('devDashboard.publishedAgo', { when })}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="dev-job-list-view-badge rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                          {t('devDashboard.viewShort')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[min(50vh,28rem)] flex-1 overflow-y-auto">
                {selectedJob ? (
                  <div className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100/90 pb-4">
                      <p className="hidden min-w-0 text-sm font-medium text-zinc-500 sm:block sm:max-w-[50%] sm:truncate">
                        {selectedJob.company?.name?.trim()
                          ? `${selectedJob.company.name.trim()} — ${selectedJob.title}`
                          : selectedJob.title}
                      </p>
                      <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
                        <Button
                          type="button"
                          size="lg"
                          className="h-12 shrink-0 rounded-xl px-6 text-base font-semibold shadow-sm"
                          disabled={applying || selectedJob.applied || isPublicJobExpired(selectedJob)}
                          onClick={() => void submitApplication()}
                        >
                          {applying
                            ? t('devDashboard.applyingCta')
                            : selectedJob.applied
                              ? t('devDashboard.alreadyAppliedCta')
                              : isPublicJobExpired(selectedJob)
                                ? 'No disponible'
                              : t('devDashboard.applyCta')}
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          className="h-12 w-12 shrink-0 rounded-xl border-zinc-200 bg-zinc-50/70 hover:bg-white"
                          aria-label={
                            selectedJob.saved
                              ? t('devDashboard.bookmarkRemove')
                              : t('devDashboard.bookmarkAdd')
                          }
                          aria-pressed={selectedJob.saved === true}
                          onClick={() => void toggleSaved(selectedJob.id)}
                        >
                          <Bookmark
                            className={cn('size-5', selectedJob.saved && 'fill-current text-sky-600')}
                            aria-hidden
                          />
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          className="h-12 w-12 shrink-0 rounded-xl border-zinc-200 bg-zinc-50/70 hover:bg-white"
                          aria-label={t('devDashboard.shareJobAria')}
                          onClick={() => void shareJob(selectedJob)}
                        >
                          <Share2 className="size-5" aria-hidden />
                        </Button>
                      </div>
                    </div>
                    {applyFeedback === 'ok' ? (
                      <p className="text-sm text-emerald-700" role="status">
                        {t('devDashboard.applySuccess')}{' '}
                        <Link className="font-medium underline" href={postulacionHref}>
                          {t('devDashboard.viewApplicationsLink')}
                        </Link>
                      </p>
                    ) : null}
                    {applyFeedback === 'err' && applyError ? (
                      <p className="text-sm text-red-700" role="alert">
                        {applyError}
                      </p>
                    ) : null}
                    {shareHint ? (
                      <p className="text-sm font-medium text-emerald-700" role="status">
                        {t('devDashboard.shareCopied')}
                      </p>
                    ) : null}

                    <JobOfferCreateStylePreview
                      title={selectedJob.title}
                      titleFallback={t('devDashboard.previewPlaceholder')}
                      companyName={selectedJob.company?.name}
                      companyLabel={t('devEmpleosPage.company')}
                      location={selectedJob.location ?? ''}
                      industry={selectedJob.industry ?? ''}
                      locationFallback={t('devDashboard.previewPlaceholder')}
                      industryFallback={t('devDashboard.previewPlaceholder')}
                      overview={ensureEditorHtml(
                        (selectedJob.description?.trim() || selectedJob.summary?.trim() || '') as string,
                      )}
                      showPreviewLabel={false}
                      locationLabel={t('devDashboard.previewLocation')}
                      industryLabel={t('devDashboard.previewIndustry')}
                      overviewLabel={t('devDashboard.previewOverview')}
                      emptyOverviewMessage={t('devDashboard.previewEmpty')}
                      titleSupplement={(() => {
                        const parts: string[] = [];
                        const sal = formatSalaryRange(selectedJob, i18n.language);
                        if (sal) parts.push(sal);
                        const when = relativeOrShortDate(
                          selectedJob.updatedAt ?? selectedJob.createdAt,
                          i18n.language,
                        );
                        if (when) parts.push(when);
                        return parts.length ? parts.join(' · ') : null;
                      })()}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 p-10 text-center">
                    <div className="rounded-2xl bg-zinc-100/80 p-4 ring-1 ring-zinc-200/80">
                      <Search className="size-10 text-zinc-400" strokeWidth={1.35} aria-hidden />
                    </div>
                    <p className="max-w-[20rem] text-base font-medium text-zinc-600">
                      {t('devDashboard.selectJob')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
