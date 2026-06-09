import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Copy,
  ExternalLink,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EvolveLeadCard } from '@/components/admin/EvolveLeadCard';
import { EvolveLeadDetailDialog } from '@/components/admin/EvolveLeadDetailDialog';
import { AdminSelect, type AdminSelectOption } from '@/components/app/AdminSelect';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { AppShell } from '@/components/layout/app/AppShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchEvolveLeads,
  type EvolveLeadRow,
} from '@/lib/adminEvolveLeadsApi';
import { ADMIN_PAGE_SIZE, slicePage } from '@/lib/adminPagination';
import { ADMIN_FILTER_BADGE_CLASS, ADMIN_FILTER_CONTROL_CLASS } from '@/lib/adminFilterUi';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
  ADMIN_TABLE_ACTIONS_TH_CLASS,
} from '@/lib/adminTableActionsUi';
import { calificacionBadgeClass, leadInitials } from '@/lib/evolveLeadUi';
import { cn } from '@/lib/utils';

type LoadState = 'idle' | 'loading' | 'done' | 'error';
type QualFilter = 'todos' | 'calificados' | 'no_calificados';
type DateSort = 'newest' | 'oldest';
type MeetingFilter = 'todos' | 'con_cita' | 'sin_cita';
type ViewMode = 'table' | 'cards';

const CARD_PAGE_SIZE = 12;

function isCalificado(tags: string): boolean {
  return /calificado/i.test(tags) && !/no calificado/i.test(tags);
}

function isNoCalificado(tags: string): boolean {
  return /no calificado/i.test(tags);
}

export default function AppAdminLeadsMyEvolve() {
  const { t } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<EvolveLeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [qualFilter, setQualFilter] = useState<QualFilter>('todos');
  const [dateSort, setDateSort] = useState<DateSort>('newest');
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [page, setPage] = useState(1);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selected, setSelected] = useState<EvolveLeadRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const pageSize = viewMode === 'cards' ? CARD_PAGE_SIZE : ADMIN_PAGE_SIZE;

  const qualityOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: 'todos', label: t('adminLeads.evolveQualAll') },
      { value: 'calificados', label: t('adminLeads.evolveQualCalificados') },
      { value: 'no_calificados', label: t('adminLeads.evolveQualNoCalificados') },
    ],
    [t],
  );

  const dateSortOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: 'newest', label: t('adminLeads.evolveSortNewest') },
      { value: 'oldest', label: t('adminLeads.evolveSortOldest') },
    ],
    [t],
  );

  const meetingFilterOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: 'todos', label: t('adminLeads.evolveMeetingFilterAll') },
      { value: 'con_cita', label: t('adminLeads.evolveMeetingFilterWith') },
      { value: 'sin_cita', label: t('adminLeads.evolveMeetingFilterWithout') },
    ],
    [t],
  );

  const loadLeads = useCallback(async () => {
    setLoadState('loading');
    setErrorMessage(null);
    const res = await fetchEvolveLeads({ includeMeetings: true });
    if (!res.ok) {
      setLoadState('error');
      setRows([]);
      setTotal(0);
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
    setTotal(res.data.total);
    setLoadState('done');
  }, [t]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, qualFilter, dateSort, meetingFilter, viewMode]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filteredRows = rows.filter((row) => {
      const qualOk =
        qualFilter === 'todos'
          ? true
          : qualFilter === 'calificados'
            ? isCalificado(row.calificacion)
            : isNoCalificado(row.calificacion);
      if (!qualOk) return false;

      const hasMeeting = Boolean(row.meetingLink || row.meetingStart);
      const meetingOk =
        meetingFilter === 'todos'
          ? true
          : meetingFilter === 'con_cita'
            ? hasMeeting
            : !hasMeeting;
      if (!meetingOk) return false;

      if (!q) return true;
      const haystack = [
        row.nombre,
        row.email,
        row.telefono,
        row.empresa,
        row.fuente,
        row.calificacion,
        row.urgencia,
        row.etapaNegocio,
        row.claridad,
        row.anuncio,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...filteredRows].sort((a, b) => {
      const ta = a.createdAtMs;
      const tb = b.createdAtMs;
      if (ta === tb) return 0;
      return dateSort === 'oldest' ? ta - tb : tb - ta;
    });
  }, [rows, searchTerm, qualFilter, meetingFilter, dateSort]);

  const paginated = useMemo(
    () => slicePage(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const openDetail = (lead: EvolveLeadRow) => {
    setSelected(lead);
    setDetailOpen(true);
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

  return (
    <AppShell
      pathWithoutLang="/app/admin/leads/my-evolve"
      title={t('sidebarDemo.navLeadsMyEvolve')}
      description={t('seo.appAdminLeadsMyEvolve')}
      contentOverflow="hidden"
    >
      <div className="flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
          <div className="shrink-0 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('adminLeads.myEvolveTitle')}
                  </h2>
                  <p className="text-xs leading-snug text-muted-foreground">
                    {t('adminLeads.myEvolveSubtitle')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <div
                  className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-0.5"
                  role="group"
                  aria-label={t('adminLeads.evolveViewMode')}
                >
                  <Button
                    type="button"
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setViewMode('cards')}
                    aria-pressed={viewMode === 'cards'}
                  >
                    <LayoutGrid className="size-3.5" aria-hidden />
                    {t('adminLeads.evolveViewCards')}
                  </Button>
                  <Button
                    type="button"
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2.5"
                    onClick={() => setViewMode('table')}
                    aria-pressed={viewMode === 'table'}
                  >
                    <List className="size-3.5" aria-hidden />
                    {t('adminLeads.evolveViewTable')}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={loadState === 'loading'}
                  onClick={() => void loadLeads()}
                >
                  {loadState === 'loading' ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                  )}
                  {t('adminLeads.evolveRefresh')}
                </Button>
              </div>
            </div>

            {loadState === 'loading' && rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('adminLeads.evolveLoading')}</p>
            ) : null}
            {loadState === 'error' && errorMessage ? (
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            ) : null}
            {loadState === 'done' ? (
              <p className="text-sm text-emerald-800 dark:text-emerald-400/90">
                {t('adminLeads.evolveCount', { count: total })}
              </p>
            ) : null}

            <div className="rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/25 dark:shadow-none">
              <div className="flex flex-col gap-2 p-2 sm:p-3">
                <div className="min-w-0 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin]">
                  <div className="flex w-max flex-nowrap items-center gap-1.5 pr-0.5">
                    <span className={ADMIN_FILTER_BADGE_CLASS}>
                      <Filter className="size-3" aria-hidden />
                      {t('adminLeads.evolveFilters')}
                    </span>
                    <AdminSelect
                      value={qualFilter}
                      onValueChange={(v) => setQualFilter(v as QualFilter)}
                      options={qualityOptions}
                      aria-label={t('adminLeads.evolveColCalificacion')}
                      triggerClassName="h-8 shrink-0"
                    />
                    <AdminSelect
                      value={dateSort}
                      onValueChange={(v) => setDateSort(v as DateSort)}
                      options={dateSortOptions}
                      aria-label={t('adminLeads.evolveSortLabel')}
                      triggerClassName="h-8 shrink-0"
                    />
                    <AdminSelect
                      value={meetingFilter}
                      onValueChange={(v) => setMeetingFilter(v as MeetingFilter)}
                      options={meetingFilterOptions}
                      aria-label={t('adminLeads.evolveMeetingFilterLabel')}
                      triggerClassName="h-8 shrink-0"
                    />
                  </div>
                </div>
                <div className="relative min-w-0">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('adminLeads.evolveSearchPlaceholder')}
                    aria-label={t('adminLeads.evolveSearchPlaceholder')}
                    className={cn(
                      'h-8 w-full pr-2 pl-8',
                      ADMIN_FILTER_CONTROL_CLASS,
                      'placeholder:text-muted-foreground',
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="isolate flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/20 dark:shadow-none">
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              {viewMode === 'cards' ? (
                <div className="absolute inset-0 overflow-auto overscroll-contain p-3">
                  {loadState === 'done' && paginated.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      {t('adminLeads.evolveEmpty')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {paginated.map((row) => (
                        <EvolveLeadCard
                          key={row.id}
                          lead={row}
                          initials={leadInitials(row.nombre)}
                          calificacionBadgeClass={calificacionBadgeClass}
                          onView={openDetail}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 overflow-auto overscroll-contain rounded-t-lg">
                  <table className="w-full min-w-[960px] border-collapse text-left text-[12px]">
                    <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted text-[10px] tracking-[0.05em] text-muted-foreground uppercase dark:bg-muted">
                      <tr>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColNombre')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColContacto')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColEmpresa')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColFuente')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColCalificacion')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColUrgencia')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColEtapa')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColAnuncio')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColPipeline')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColCita')}</th>
                        <th className="px-2 py-1.5 font-semibold xl:px-3 xl:py-2">{t('adminLeads.evolveColFecha')}</th>
                        <th className={ADMIN_TABLE_ACTIONS_TH_CLASS}>{t('adminLeads.evolveColAcciones')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadState === 'done' && paginated.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted-foreground">
                            {t('adminLeads.evolveEmpty')}
                          </td>
                        </tr>
                      ) : null}
                      {paginated.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-border/55 transition-colors hover:bg-muted/35 dark:hover:bg-muted/20"
                        >
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-semibold text-violet-900 dark:bg-violet-950/70 dark:text-violet-200">
                                {leadInitials(row.nombre)}
                              </div>
                              <p className="min-w-0 truncate font-semibold text-zinc-900 dark:text-zinc-100" title={row.nombre}>
                                {row.nombre}
                              </p>
                            </div>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <div className="flex min-w-0 items-center gap-1">
                              <p className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-300" title={row.email}>
                                {row.email}
                              </p>
                              {row.email !== '—' ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => void copyEmail(row.email)}
                                  title={t('adminLeads.evolveCopyEmail')}
                                  aria-label={t('adminLeads.evolveCopyEmail')}
                                >
                                  <Copy className="size-3.5" />
                                </Button>
                              ) : null}
                            </div>
                            {copiedEmail === row.email ? (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                {t('adminLeads.evolveEmailCopied')}
                              </p>
                            ) : null}
                            <p className="text-zinc-700 dark:text-zinc-400">{row.telefono}</p>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <p className="max-w-[10rem] truncate font-medium" title={row.empresa}>
                              {row.empresa}
                            </p>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <span className="inline-block max-w-[8rem] truncate rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
                              {row.fuente}
                            </span>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <Badge variant="secondary" className={cn('text-[10px] font-medium', calificacionBadgeClass(row.calificacion))}>
                              {row.calificacion}
                            </Badge>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <p className="max-w-[9rem] truncate text-[11px]" title={row.urgencia}>
                              {row.urgencia}
                            </p>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <p className="max-w-[10rem] truncate text-[11px]" title={row.etapaNegocio}>
                              {row.etapaNegocio}
                            </p>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <p className="max-w-[8rem] truncate text-[11px]" title={row.anuncio}>
                              {row.anuncio}
                            </p>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            <span className="text-[11px] capitalize text-zinc-700 dark:text-zinc-300">
                              {row.pipelineStatus}
                            </span>
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5">
                            {row.meetingLink ? (
                              <a
                                href={row.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-[8rem] items-center gap-1 truncate text-[11px] font-medium text-violet-700 hover:underline dark:text-violet-300"
                                title={row.meetingTitle ?? row.meetingLink}
                              >
                                <ExternalLink className="size-3 shrink-0" aria-hidden />
                                {t('adminLeads.evolveMeetingLink')}
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="align-top px-2 py-2 xl:px-3 xl:py-2.5 text-[11px] text-zinc-700 dark:text-zinc-400">
                            {row.fechaAlta}
                          </td>
                          <td className="align-top px-2 py-2 text-center xl:px-3 xl:py-2.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                              title={t('adminLeads.evolveViewDetail')}
                              aria-label={t('adminLeads.evolveViewDetailFor', { name: row.nombre })}
                              onClick={() => openDetail(row)}
                            >
                              <Eye className="size-4" strokeWidth={1.5} aria-hidden />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {filtered.length > pageSize ? (
              <AdminTablePagination
                page={page}
                pageSize={pageSize}
                totalItems={filtered.length}
                nounPlural="leads"
                onPageChange={setPage}
              />
            ) : null}
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
