import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Eye,
  Filter,
  Key,
  KeyRound,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserSearch,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app/AppShell';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocale } from '@/hooks/useLocale';
import {
  RECRUITER_PERMISSION_KEYS,
  createRecruiter,
  defaultRecruiterPermissions,
  deleteRecruiter,
  fetchRecruiterAccessStatus,
  fetchRecruiterById,
  fetchRecruiters,
  recruiterPortalAccessAction,
  updateRecruiter,
  type RecruiterApiRecord,
} from '@/lib/adminRecruitersApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN_PAGE_SIZE } from '@/lib/adminPagination';
import { ADMIN_FILTER_BADGE_CLASS, ADMIN_FILTER_CONTROL_CLASS } from '@/lib/adminFilterUi';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
  ADMIN_ROW_ACTION_ICON_MUTED_CLASS,
  ADMIN_TABLE_ACTIONS_TH_CLASS,
} from '@/lib/adminTableActionsUi';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  permissions: Record<string, boolean>;
};

const emptyForm = (): FormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  permissions: defaultRecruiterPermissions(),
});

function recordToForm(r: RecruiterApiRecord): FormState {
  return {
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    phone: r.phone ?? '',
    permissions: { ...defaultRecruiterPermissions(), ...r.permissions },
  };
}

function recruiterInitials(firstName: string, lastName: string): string {
  const a = firstName.trim()[0] ?? '';
  const b = lastName.trim()[0] ?? '';
  const out = `${a}${b}`.trim();
  return out ? out.toUpperCase() : '?';
}

export default function AppAdminReclutadoresPage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location, setLocation] = useLocation();
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  const isCreateRoute = /\/app\/admin\/reclutadores\/crear\/?$/.test(location);
  const editMatch = location.match(/\/app\/admin\/reclutadores\/([^/]+)\/?$/);
  const editId =
    editMatch && editMatch[1] && editMatch[1] !== 'crear'
      ? decodeURIComponent(editMatch[1])
      : '';
  const isEditRoute = Boolean(editId);
  const isListRoute = !isCreateRoute && !isEditRoute;

  const pathWithoutLang = isCreateRoute
    ? '/app/admin/reclutadores/crear'
    : isEditRoute
      ? `/app/admin/reclutadores/${editId}`
      : '/app/admin/reclutadores';

  const pageTitle = isCreateRoute
    ? t('recruitersPage.createTitle')
    : isEditRoute
      ? t('recruitersPage.editTitle')
      : t('sidebarDemo.navRecruiters');

  const [rows, setRows] = useState<RecruiterApiRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [listPage, setListPage] = useState(1);
  const [nameInput, setNameInput] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [detailRecruiter, setDetailRecruiter] = useState<RecruiterApiRecord | null>(null);
  const [accessByRecruiterId, setAccessByRecruiterId] = useState<Record<string, boolean>>({});
  const [accessBusyByRecruiterId, setAccessBusyByRecruiterId] = useState<Record<string, boolean>>(
    {},
  );
  const [accessActionError, setAccessActionError] = useState<string | null>(null);
  const [accessDialog, setAccessDialog] = useState<{
    open: boolean;
    title: string;
    email: string;
    password: string;
  }>({ open: false, title: '', email: '', password: '' });
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedEmailRow, setCopiedEmailRow] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setNameFilter((prev) => {
        if (nameInput === prev) return prev;
        queueMicrotask(() => setListPage(1));
        return nameInput;
      });
    }, 400);
    return () => window.clearTimeout(id);
  }, [nameInput]);

  const loadList = useCallback(async () => {
    if (!apiBase) {
      setListError('Falta configurar VITE_API_BASE_URL.');
      setRows([]);
      setTotalCount(0);
      return;
    }
    setListError(null);
    const [res, accessRows] = await Promise.all([
      fetchRecruiters(apiBase, listPage, ADMIN_PAGE_SIZE, nameFilter),
      fetchRecruiterAccessStatus(apiBase),
    ]);
    if (!res) {
      setListError('No se pudo cargar reclutadores. ¿Sesión de admin o API?');
      setRows([]);
      setTotalCount(0);
      setAccessByRecruiterId({});
      return;
    }
    setRows(res.data);
    setTotalCount(res.count);
    if (accessRows) {
      const next: Record<string, boolean> = {};
      for (const row of accessRows) {
        next[row.recruiterId] = row.accessEnabled;
      }
      setAccessByRecruiterId(next);
    } else {
      setAccessByRecruiterId({});
    }
  }, [apiBase, listPage, nameFilter]);

  const refreshList = useCallback(() => loadList(), [loadList]);

  useEffect(() => {
    if (!isListRoute) return;
    setLoadState('loading');
    void (async () => {
      await loadList();
      setLoadState('done');
    })();
  }, [isListRoute, location, loadList]);

  useEffect(() => {
    setFormError(null);
    if (isCreateRoute) {
      setForm(emptyForm());
      return;
    }
    if (isEditRoute && editId) {
      void (async () => {
        if (!apiBase) {
          setFormError('Falta configurar VITE_API_BASE_URL.');
          return;
        }
        const r = await fetchRecruiterById(apiBase, editId);
        if (!r) {
          setLocation(path('/app/admin/reclutadores'));
          return;
        }
        setForm(recordToForm(r));
      })();
    }
  }, [isCreateRoute, isEditRoute, editId, location, path, setLocation, apiBase]);

  const permLabels = useMemo(
    () =>
      ({
        'panel:developers': t('sidebarDemo.navDevelopers'),
        'panel:jobs': t('sidebarDemo.navJobs'),
        'panel:projects': t('sidebarDemo.navProjects'),
        'panel:companies': t('sidebarDemo.navCompanies'),
      }) as Record<string, string>,
    [t],
  );

  const goList = () => setLocation(path('/app/admin/reclutadores'));
  const goCreate = () => setLocation(path('/app/admin/reclutadores/crear'));
  const goEdit = (id: string) =>
    setLocation(path(`/app/admin/reclutadores/${encodeURIComponent(id)}`));

  const onSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      return;
    }
    if (!apiBase) {
      setFormError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (isCreateRoute) {
        const out = await createRecruiter(apiBase, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          permissions: { ...form.permissions },
        });
        if (!out.ok) {
          setFormError(out.message);
          return;
        }
        await refreshList();
        goList();
      } else if (isEditRoute && editId) {
        const out = await updateRecruiter(apiBase, editId, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          permissions: { ...form.permissions },
        });
        if (!out.ok) {
          setFormError(out.message);
          return;
        }
        await refreshList();
        goList();
      }
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = (email: string) => {
    void navigator.clipboard.writeText(email).then(
      () => {
        setCopiedEmailRow(email);
        window.setTimeout(() => setCopiedEmailRow(null), 1200);
      },
      () => setCopiedEmailRow(null),
    );
  };

  const clearFilters = useCallback(() => {
    setNameInput('');
    setNameFilter('');
    setListPage(1);
  }, []);

  const onDelete = async (id: string) => {
    if (!window.confirm(t('recruitersPage.confirmDelete'))) return;
    if (!apiBase) return;
    const out = await deleteRecruiter(apiBase, id);
    if (!out.ok) {
      setListError(out.message ?? 'No se pudo eliminar.');
      return;
    }
    await refreshList();
  };

  const setPerm = (key: string, checked: boolean) => {
    setForm((f) => ({
      ...f,
      permissions: { ...f.permissions, [key]: checked },
    }));
  };

  const copyGeneratedPassword = (value: string) => {
    void navigator.clipboard.writeText(value).then(
      () => {
        setCopiedPassword(true);
        window.setTimeout(() => setCopiedPassword(false), 1400);
      },
      () => setCopiedPassword(false),
    );
  };

  const runRecruiterAccessAction = (
    recruiterId: string,
    action: 'enable-access' | 'reset-password' | 'disable-access',
  ) => {
    if (!apiBase) {
      setAccessActionError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    setAccessActionError(null);
    setAccessBusyByRecruiterId((prev) => ({ ...prev, [recruiterId]: true }));
    void recruiterPortalAccessAction(apiBase, recruiterId, action)
      .then((out) => {
        if (!out.ok) {
          setAccessActionError(out.message);
          return;
        }
        setAccessByRecruiterId((prev) => ({
          ...prev,
          [out.recruiterId]: out.accessEnabled,
        }));
        if (out.password) {
          setCopiedPassword(false);
          setAccessDialog({
            open: true,
            title:
              action === 'enable-access'
                ? t('recruitersPage.accessDialogTitleEnable')
                : t('recruitersPage.accessDialogTitleReset'),
            email: out.email,
            password: out.password,
          });
        }
      })
      .catch(() => {
        setAccessActionError(t('recruitersPage.accessActionError'));
      })
      .finally(() => {
        setAccessBusyByRecruiterId((prev) => ({ ...prev, [recruiterId]: false }));
      });
  };

  return (
    <AppShell
      pathWithoutLang={pathWithoutLang}
      title={pageTitle}
      description={isListRoute ? 'Admin panel' : t('seo.appAdminRecruiters')}
      contentOverflow={isListRoute ? 'hidden' : 'scroll'}
    >
      {isListRoute ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <section
          id="recruiters"
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden scroll-mt-24"
        >
          <div className="min-h-0 shrink-0 space-y-2">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight text-[#0b1f3a] dark:text-zinc-50">
                  {t('recruitersPage.listTitle')}
                </h2>
                <p className="text-xs text-muted-foreground">{t('recruitersPage.listSubtitle')}</p>
                {loadState === 'loading' ? (
                  <p className="mt-1 text-xs text-muted-foreground">{t('recruitersPage.loadingList')}</p>
                ) : null}
                {!apiBase ? (
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/95">{t('recruitersPage.envMissingApi')}</p>
                ) : null}
                {listError ? <p className="mt-1 text-xs text-red-700 dark:text-red-400">{listError}</p> : null}
                {accessActionError ? (
                  <p className="mt-1 text-xs text-red-700 dark:text-red-400">{accessActionError}</p>
                ) : null}
                {loadState === 'done' && !listError && totalCount > 0 ? (
                  <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-400/90">
                    {totalCount}{' '}
                    {totalCount === 1
                      ? t('recruitersPage.inDirectoryOne')
                      : t('recruitersPage.inDirectoryMany')}
                  </p>
                ) : null}
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:max-w-xl lg:justify-end">
                <div className="relative w-full max-w-md flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="recruiters-name-search"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={t('recruitersPage.searchPlaceholder')}
                    aria-label={t('recruitersPage.searchByName')}
                    autoComplete="off"
                    className={cn(
                      'h-8 w-full pr-2 pl-8',
                      ADMIN_FILTER_CONTROL_CLASS,
                      'placeholder:text-muted-foreground',
                    )}
                  />
                </div>
                <Button
                  type="button"
                  onClick={goCreate}
                  className={cn(ADMIN_PRIMARY_BTN_CLASS, 'h-8 shrink-0 px-3 text-xs sm:w-auto')}
                >
                  <Plus className="size-3.5" />
                  {t('recruitersPage.createCta')}
                </Button>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-lg border border-border/70 bg-card p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/25 dark:shadow-none">
            <div className="flex w-full flex-wrap items-center justify-between gap-1.5">
              <span className={ADMIN_FILTER_BADGE_CLASS}>
                <Filter className="size-3" aria-hidden />
                {t('recruitersPage.quickFiltersLabel')}
              </span>
              <Button variant="ghost" size="sm" type="button" className="shrink-0" onClick={clearFilters}>
                {t('recruitersPage.clearFilters')}
              </Button>
            </div>
          </div>

          <div className="isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/20 dark:shadow-none">
            <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
              <div className="absolute inset-0 overflow-auto overscroll-contain rounded-t-lg">
              <table className="w-full min-w-0 table-fixed border-collapse text-left text-[12px]">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[30%]" />
                  <col className="w-[16%]" />
                  <col className="w-[32%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted text-[10px] tracking-[0.05em] text-muted-foreground uppercase dark:bg-muted">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">
                      {t('recruitersPage.tableName')}
                    </th>
                    <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">
                      {t('recruitersPage.tableContact')}
                    </th>
                    <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">
                      {t('recruitersPage.tableUpdated')}
                    </th>
                    <th className={ADMIN_TABLE_ACTIONS_TH_CLASS}>
                      {t('recruitersPage.tableActions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadState === 'loading' ? (
                    <tr className="border-t border-zinc-100 dark:border-zinc-800">
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground xl:px-5">
                        {t('recruitersPage.loadingList')}
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr className="border-t border-zinc-100 dark:border-zinc-800">
                      <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground xl:px-5">
                        {nameFilter.trim()
                          ? t('recruitersPage.noSearchResults')
                          : t('recruitersPage.empty')}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const enabled = accessByRecruiterId[r.id] === true;
                      const busy = accessBusyByRecruiterId[r.id] === true;
                      const recruiterFullName = `${r.firstName} ${r.lastName}`.trim();
                      return (
                        <tr key={r.id} className="border-t border-zinc-100 dark:border-zinc-800">
                          <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                            <div className="flex min-w-0 items-center gap-1.5 xl:gap-2">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-semibold text-[#17304b] xl:size-9 xl:text-xs dark:bg-indigo-950/70 dark:text-indigo-200">
                                {recruiterInitials(r.firstName, r.lastName)}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="truncate font-semibold text-zinc-900 dark:text-zinc-100"
                                  title={recruiterFullName}
                                >
                                  {recruiterFullName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                            <div className="flex min-w-0 items-center gap-1">
                              <p className="min-w-0 truncate text-zinc-800 dark:text-zinc-300" title={r.email}>
                                {r.email}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => copyEmail(r.email)}
                                title={t('recruitersPage.copyEmail')}
                                aria-label={`${t('recruitersPage.copyEmail')} ${recruiterFullName}`}
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            </div>
                            {copiedEmailRow === r.email ? (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('recruitersPage.copyEmailInline')}</p>
                            ) : null}
                          </td>
                          <td className="align-top min-w-0 px-2 py-2 text-[11px] text-zinc-600 tabular-nums dark:text-zinc-400 xl:px-4 xl:py-2.5">
                            {formatDate(r.updatedAt)}
                          </td>
                          <td className="align-middle px-2 py-2 text-center xl:px-4 xl:py-2.5">
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                                title={t('recruitersPage.viewDetails')}
                                aria-label={`${t('recruitersPage.viewDetails')} ${recruiterFullName}`}
                                onClick={() => setDetailRecruiter(r)}
                              >
                                <Eye className="size-4" strokeWidth={1.5} aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                                title={t('recruitersPage.edit')}
                                aria-label={`${t('recruitersPage.edit')} ${recruiterFullName}`}
                                onClick={() => goEdit(r.id)}
                              >
                                <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
                                  'text-zinc-400 hover:text-red-700 dark:hover:text-red-400',
                                )}
                                title={t('recruitersPage.delete')}
                                aria-label={`${t('recruitersPage.delete')} ${recruiterFullName}`}
                                onClick={() => void onDelete(r.id)}
                              >
                                <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
                              </Button>
                              <span
                                className="inline-flex size-8 shrink-0 items-center justify-center"
                                title={
                                  enabled
                                    ? t('recruitersPage.accessActive')
                                    : t('recruitersPage.accessInactive')
                                }
                                aria-label={
                                  enabled
                                    ? t('recruitersPage.accessActive')
                                    : t('recruitersPage.accessInactive')
                                }
                              >
                                <Key
                                  className={cn(
                                    'size-4',
                                    enabled
                                      ? 'text-emerald-500 dark:text-emerald-400'
                                      : ADMIN_ROW_ACTION_ICON_MUTED_CLASS,
                                  )}
                                  strokeWidth={1.5}
                                  aria-hidden
                                />
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                                    disabled={busy}
                                    title={t('recruitersPage.accessMenuAria')}
                                    aria-label={t('recruitersPage.accessMenuAria')}
                                  >
                                    {busy ? (
                                      <Loader2 className="size-4 animate-spin" aria-hidden />
                                    ) : (
                                      <MoreVertical className="size-4" strokeWidth={1.5} aria-hidden />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {enabled ? (
                                    <>
                                      <DropdownMenuItem
                                        onSelect={(event) => {
                                          event.preventDefault();
                                          runRecruiterAccessAction(r.id, 'reset-password');
                                        }}
                                      >
                                        <KeyRound className="size-4" />
                                        {t('recruitersPage.actionResetPassword')}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={(event) => {
                                          event.preventDefault();
                                          runRecruiterAccessAction(r.id, 'disable-access');
                                        }}
                                      >
                                        <UserX className="size-4" />
                                        {t('recruitersPage.actionDisableAccess')}
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem
                                      onSelect={(event) => {
                                        event.preventDefault();
                                        runRecruiterAccessAction(r.id, 'enable-access');
                                      }}
                                    >
                                      <UserCheck className="size-4" />
                                      {t('recruitersPage.actionEnableAccess')}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
            {loadState === 'done' && totalCount > 0 ? (
              <AdminTablePagination
                page={listPage}
                totalItems={totalCount}
                pageSize={ADMIN_PAGE_SIZE}
                onPageChange={setListPage}
                nounPlural="reclutadores"
                className="shrink-0 gap-1 border-border/60 bg-muted/20 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-muted/10"
              />
            ) : null}
          </div>
        </section>

          <Dialog open={detailRecruiter != null} onOpenChange={(open) => !open && setDetailRecruiter(null)}>
            <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
              {detailRecruiter ? (
                <>
                  <DialogHeader className="border-b border-zinc-200 bg-zinc-50/90 px-6 py-4 text-left dark:border-zinc-800 dark:bg-zinc-900/50">
                    <DialogTitle className="text-left text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      {detailRecruiter.firstName} {detailRecruiter.lastName}
                    </DialogTitle>
                    <DialogDescription className="text-left text-sm text-zinc-600 dark:text-zinc-400">
                      {detailRecruiter.email}
                    </DialogDescription>
                    <p className="pt-1 text-left text-xs text-zinc-500 dark:text-zinc-500">
                      {t('recruitersPage.summaryIntro')}
                    </p>
                  </DialogHeader>
                  <div className="space-y-4 px-6 py-5">
                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/80">
                      <dl className="grid gap-3 text-sm">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {t('recruitersPage.fieldPhone')}
                          </dt>
                          <dd className="min-w-0 break-all text-zinc-900 dark:text-zinc-100">
                            {detailRecruiter.phone?.trim() ? detailRecruiter.phone : '—'}
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {t('recruitersPage.labelCreated')}
                          </dt>
                          <dd className="text-zinc-800 tabular-nums dark:text-zinc-200">
                            {formatDate(detailRecruiter.createdAt)}
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                          <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {t('recruitersPage.labelUpdated')}
                          </dt>
                          <dd className="text-zinc-800 tabular-nums dark:text-zinc-200">
                            {formatDate(detailRecruiter.updatedAt)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {t('recruitersPage.sectionPermissions')}
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {RECRUITER_PERMISSION_KEYS.map((key) => {
                          const on = detailRecruiter.permissions[key] === true;
                          return (
                            <li
                              key={key}
                              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                            >
                              <span className="min-w-0 text-zinc-800 dark:text-zinc-200">
                                {permLabels[key] ?? key}
                              </span>
                              <span
                                className={
                                  on
                                    ? 'shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                                    : 'shrink-0 rounded-full bg-zinc-200/80 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-600/40 dark:text-zinc-300'
                                }
                              >
                                {on ? t('recruitersPage.permOn') : t('recruitersPage.permOff')}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </>
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog
            open={accessDialog.open}
            onOpenChange={(open) => {
              if (!open) setCopiedPassword(false);
              setAccessDialog((prev) => ({ ...prev, open }));
            }}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{accessDialog.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300">{t('recruitersPage.accessCredentialsIntro')}</p>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    {t('recruitersPage.fieldEmail')}
                  </p>
                  <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                    {accessDialog.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                    {t('recruitersPage.accessPasswordLabel')}
                  </p>
                  <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                    {accessDialog.password}
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => copyGeneratedPassword(accessDialog.password)}
                >
                  {copiedPassword ? t('recruitersPage.passwordCopied') : t('recruitersPage.copyPasswordBtn')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <section className="scroll-mt-24 mx-auto max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
              <UserSearch className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white">
                {pageTitle}
              </h2>
            </div>
          </div>

          {formError ? (
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('recruitersPage.sectionGeneral')}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rec-nom">{t('recruitersPage.fieldFirstName')}</Label>
                  <input
                    id="rec-nom"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rec-ape">{t('recruitersPage.fieldLastName')}</Label>
                  <input
                    id="rec-ape"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rec-email">{t('recruitersPage.fieldEmail')}</Label>
                  <input
                    id="rec-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rec-tel">{t('recruitersPage.fieldPhone')}</Label>
                  <input
                    id="rec-tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="flex h-10 w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('recruitersPage.sectionPermissions')}
              </h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t('recruitersPage.permissionsMockHint')}
              </p>
              <div className="mt-4 space-y-3">
                {RECRUITER_PERMISSION_KEYS.map((key) => (
                  <div
                    key={key}
                    className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <Checkbox
                      id={`perm-${key}`}
                      checked={form.permissions[key] === true}
                      onCheckedChange={(c) => setPerm(key, c === true)}
                    />
                    <Label htmlFor={`perm-${key}`} className="text-sm font-normal leading-snug">
                      {permLabels[key] ?? key}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={goList}>
                {t('recruitersPage.cancel')}
              </Button>
              <Button
                type="button"
                onClick={() => void onSave()}
                disabled={
                  saving ||
                  !form.firstName.trim() ||
                  !form.lastName.trim() ||
                  !form.email.trim()
                }
                className={ADMIN_PRIMARY_BTN_CLASS}
              >
                {t('recruitersPage.save')}
              </Button>
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
