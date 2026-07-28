import { useEffect, useMemo, useState } from 'react';
import { Briefcase, ChevronRight, LayoutGrid, List, Sparkles, UserPlus, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAdminAssignedProjects } from '@/contexts/AdminAssignedProjectsContext';
import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { ADMIN_PAGE_SIZE, slicePage } from '@/lib/adminPagination';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  COMPANY_LEAD_STATUS_BADGE_CLASS,
  COMPANY_LEAD_STATUS_DOT_CLASS,
  COMPANY_LEAD_STATUS_LABELS,
  applyCompanyLeadStatusOverride,
  dispatchLeadStatusChanged,
  getCompanyLeadStatus,
  LEAD_STATUS_CHANGED_EVENT,
  type CompanyLeadStatus,
} from '@/lib/companyLeadStatus';
import { fetchCompanyLeadStatuses, patchCompanyLeadStatusApi } from '@/lib/adminWorkspaceApi';
import { adminAuthorizedFetch } from '@/lib/adminAuth';
import { cn } from '@/lib/utils';
import { persistAdminProjectsSeenMax } from '@/lib/userPreferencesSync';
import {
  ADMIN_FIELD_INPUT_SM_CLASS,
  ADMIN_PRIMARY_BTN_CLASS,
  ADMIN_SUBCARD_CLASS,
} from '@/lib/adminVadoUi';
import {
  DEVELOPERS,
  developerProfileToAssignableRow,
  mapApiDeveloperToProfile,
  type ApiDeveloperPayload,
  type DeveloperProfile,
} from '@/lib/devDevelopers';

const badgeTrabajo = 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-700/30';

function formatFecha(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function personInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || '?').toUpperCase();
}

type ViewMode = 'cards' | 'list';

function AssignedProjectCard({
  p,
  onOpen,
}: {
  p: AssignedProjectRecord;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group flex flex-col rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 p-5 text-left shadow-sm transition',
        'hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/25 dark:border-zinc-700 dark:from-zinc-950 dark:to-zinc-900/90 dark:hover:border-indigo-600 dark:focus-visible:ring-sky-500/30',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase',
            badgeTrabajo,
          )}
        >
          <Sparkles className="size-3" aria-hidden />
          En trabajo
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-zinc-900 group-hover:text-[#0b2a55] dark:text-zinc-100 dark:group-hover:text-sky-300">
        {p.titulo}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{p.empresa}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4">
        <div className="flex -space-x-2">
          {p.prospectos.slice(0, 5).map((pr) => (
            <span
              key={pr.id}
              title={pr.nombre}
              className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[11px] font-bold text-[#17304b] dark:border-zinc-900 dark:bg-indigo-950/70 dark:text-indigo-200"
            >
              {personInitials(pr.nombre)}
            </span>
          ))}
          {p.prospectos.length > 5 ? (
            <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-200">
              +{p.prospectos.length - 5}
            </span>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{p.prospectos.length} en equipo</span>
      </div>
      <p className="mt-3 text-xs text-zinc-500">{formatFecha(p.createdAt)}</p>
    </button>
  );
}

export default function AppAdminProyectosPage() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const portalBase = location.includes('/app/recruiter/') ? '/app/recruiter' : '/app/admin';
  const {
    assignedProjects,
    projectsLoad,
    projectsRemoteEnabled,
    projectsRemoteFetchFailed,
    addAssignedProject,
    removeAssignedProjectByContactId,
  } = useAdminAssignedProjects();
  const [detalleId, setDetalleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [leadStatusFeedback, setLeadStatusFeedback] = useState<string | null>(null);
  const [leadStatusOverrides, setLeadStatusOverrides] = useState<Record<string, CompanyLeadStatus>>(
    () => ({}),
  );
  const [projectPage, setProjectPage] = useState(1);
  const [assignDirectory, setAssignDirectory] = useState<DeveloperProfile[]>([]);
  const [assignDirectoryLoad, setAssignDirectoryLoad] = useState<'idle' | 'loading' | 'done'>('idle');
  const [assignDeveloperSearch, setAssignDeveloperSearch] = useState('');
  const [teamDraft, setTeamDraft] = useState<AssignedProjectRecord['prospectos']>([]);

  const abierto = detalleId !== null;
  const registroAbierto = assignedProjects.find((p) => p.id === detalleId) ?? null;
  const showProjectGrid = projectsLoad === 'done';

  const visibleAssignedProjects = useMemo(
    () =>
      assignedProjects.filter((p) => {
        const cid = p.contactId.trim();
        if (cid === '') return false;
        return getCompanyLeadStatus(leadStatusOverrides, cid) === 'en_curso';
      }),
    [assignedProjects, leadStatusOverrides],
  );

  const paginatedVisibleProjects = useMemo(
    () => slicePage(visibleAssignedProjects, projectPage, ADMIN_PAGE_SIZE),
    [visibleAssignedProjects, projectPage],
  );

  const emptyProjectsMessage = useMemo(() => {
    if (!projectsRemoteEnabled) {
      return 'Los proyectos salen solo de la base de datos vía API. Configura VITE_API_BASE_URL con la URL base del backend para cargar GET /projects.';
    }
    if (projectsRemoteFetchFailed) {
      return 'No se pudo cargar el listado desde el servidor. Revisa la API, la ruta /projects o la red.';
    }
    if (assignedProjects.length === 0) {
      return 'No hay proyectos en el servidor. Asigna uno desde Compañías.';
    }
    return `No hay proyectos con el lead en «${COMPANY_LEAD_STATUS_LABELS.en_curso}» en Compañías. Solo se listan aquí cuando el estado del lead es ese.`;
  }, [projectsRemoteEnabled, projectsRemoteFetchFailed, assignedProjects.length]);

  useEffect(() => {
    void fetchCompanyLeadStatuses().then(setLeadStatusOverrides);
  }, [assignedProjects, location]);

  useEffect(() => {
    const maxTs = Math.max(
      0,
      ...assignedProjects.map((p) => {
        const x = new Date(p.createdAt).getTime();
        return Number.isFinite(x) ? x : 0;
      }),
    );
    void persistAdminProjectsSeenMax(maxTs);
  }, [assignedProjects]);

  useEffect(() => {
    const sync = () => {
      void fetchCompanyLeadStatuses().then(setLeadStatusOverrides);
    };
    window.addEventListener(LEAD_STATUS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(LEAD_STATUS_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!registroAbierto) return;
    const cid = registroAbierto.contactId.trim();
    if (cid !== '' && getCompanyLeadStatus(leadStatusOverrides, cid) !== 'en_curso') {
      queueMicrotask(() => setDetalleId(null));
    }
  }, [registroAbierto, leadStatusOverrides]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(visibleAssignedProjects.length / ADMIN_PAGE_SIZE));
    queueMicrotask(() => setProjectPage((p) => Math.min(p, tp)));
  }, [visibleAssignedProjects.length]);

  useEffect(() => {
    queueMicrotask(() => {
      const base = import.meta.env.VITE_API_BASE_URL;
      if (typeof base !== 'string' || !base.trim()) {
        setAssignDirectory(DEVELOPERS);
        setAssignDirectoryLoad('done');
        return;
      }
      setAssignDirectoryLoad('loading');
      void adminAuthorizedFetch(`${base.replace(/\/$/, '')}/users/developers`)
        .then((res) => {
          if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
          return res.json() as Promise<unknown>;
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            setAssignDirectory([]);
            return;
          }
          setAssignDirectory(data.map((row) => mapApiDeveloperToProfile(row as ApiDeveloperPayload)));
        })
        .catch(() => {
          setAssignDirectory(DEVELOPERS);
        })
        .finally(() => setAssignDirectoryLoad('done'));
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      if (!registroAbierto) {
        setTeamDraft([]);
        setAssignDeveloperSearch('');
        return;
      }
      setTeamDraft(registroAbierto.prospectos);
      setAssignDeveloperSearch('');
    });
  }, [registroAbierto]);

  const assignableDevelopers = useMemo(
    () => assignDirectory.map(developerProfileToAssignableRow),
    [assignDirectory],
  );

  const directoryFiltered = useMemo(() => {
    const q = assignDeveloperSearch.trim().toLowerCase();
    if (!q) return assignableDevelopers;
    return assignableDevelopers.filter((d) =>
      [d.nombre, d.rol, d.correo, d.expertis].join(' ').toLowerCase().includes(q),
    );
  }, [assignableDevelopers, assignDeveloperSearch]);

  const teamIds = useMemo(() => new Set(teamDraft.map((p) => p.id)), [teamDraft]);

  return (
    <AppShell
      pathWithoutLang={`${portalBase}/proyectos`}
      title={t('sidebarDemo.navProjects')}
      description={t('seo.appAdminProjects')}
      contentOverflow="hidden"
    >
      <div className="flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden scroll-mt-24">
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Proyectos</h2>
            {projectsLoad === 'loading' ? (
              <p className="mt-1 text-xs text-muted-foreground">Cargando proyectos…</p>
            ) : null}
          </div>
          <div
            className="inline-flex w-fit shrink-0 rounded-lg border border-border bg-muted/40 p-0.5"
            role="group"
            aria-label="Modo de vista"
          >
            <Button
              type="button"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'gap-1.5 rounded-lg',
                viewMode === 'cards'
                  ? 'bg-[#0b2a55] text-white shadow-sm hover:bg-[#0a2347] dark:bg-sky-800 dark:hover:bg-sky-700'
                  : 'text-zinc-700 hover:bg-muted/70 dark:text-zinc-200 dark:hover:bg-muted/50',
              )}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="size-4" aria-hidden />
              Cards
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'gap-1.5 rounded-lg',
                viewMode === 'list'
                  ? 'bg-[#0b2a55] text-white shadow-sm hover:bg-[#0a2347] dark:bg-sky-800 dark:hover:bg-sky-700'
                  : 'text-zinc-700 hover:bg-muted/70 dark:text-zinc-200 dark:hover:bg-muted/50',
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="size-4" aria-hidden />
              Lista
            </Button>
          </div>
        </div>

        {showProjectGrid ? (
          viewMode === 'cards' ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
              <h3 className="flex shrink-0 items-center gap-2 text-xs font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
                <Briefcase className="size-3.5 text-indigo-600" aria-hidden />
                {COMPANY_LEAD_STATUS_LABELS.en_curso}
              </h3>
              {visibleAssignedProjects.length === 0 ? (
                <p className="shrink-0 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                  {emptyProjectsMessage}
                </p>
              ) : (
                <>
                  <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                    <div className="absolute inset-0 overflow-auto overscroll-contain rounded-t-lg">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {paginatedVisibleProjects.map((p) => (
                          <AssignedProjectCard key={p.id} p={p} onOpen={() => setDetalleId(p.id)} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <AdminTablePagination
                    page={projectPage}
                    totalItems={visibleAssignedProjects.length}
                    pageSize={ADMIN_PAGE_SIZE}
                    onPageChange={setProjectPage}
                    nounPlural="proyectos"
                    className="shrink-0 gap-1 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-muted/20"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden">
              <h3 className="shrink-0 text-xs font-semibold tracking-wide text-zinc-700 uppercase dark:text-zinc-300">
                {COMPANY_LEAD_STATUS_LABELS.en_curso}
              </h3>
              {visibleAssignedProjects.length === 0 ? (
                <p className="shrink-0 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  {emptyProjectsMessage}
                </p>
              ) : (
                <div className="isolate flex h-0 min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
                  <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                    <ul className="absolute inset-0 divide-y divide-border overflow-auto overscroll-contain rounded-t-lg">
                    {paginatedVisibleProjects.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setDetalleId(p.id)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200">
                            <Users className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{p.titulo}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.empresa} · {p.prospectos.length} en equipo · {formatFecha(p.createdAt)}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase sm:inline-flex',
                              badgeTrabajo,
                            )}
                          >
                            En trabajo
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        </button>
                      </li>
                    ))}
                    </ul>
                  </div>
                  <AdminTablePagination
                    page={projectPage}
                    totalItems={visibleAssignedProjects.length}
                    pageSize={ADMIN_PAGE_SIZE}
                    onPageChange={setProjectPage}
                    nounPlural="proyectos"
                    className="shrink-0 gap-1 border-border/60 bg-muted/20 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-muted/10"
                  />
                </div>
              )}
            </div>
          )
        ) : null}
      </section>
      </div>

      <Dialog
        open={abierto}
        onOpenChange={(o) => {
          if (!o) {
            setDetalleId(null);
            setLeadStatusFeedback(null);
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] w-[min(96vw,1100px)] overflow-auto border-0 bg-gradient-to-b from-zinc-50 to-white p-0 sm:max-w-4xl dark:from-zinc-950 dark:to-zinc-900"
          showCloseButton
        >
          {registroAbierto ? (
            <div className="p-6 pt-8">
              <DialogHeader className="space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase',
                      badgeTrabajo,
                    )}
                  >
                    <Sparkles className="size-3.5" aria-hidden />
                    En trabajo
                  </span>
                </div>
                <DialogTitle className="text-2xl leading-tight">{registroAbierto.titulo}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Contacto:{' '}
                  <span className="font-medium text-foreground">{registroAbierto.contactoNombre}</span>
                  {' · '}
                  {formatFecha(registroAbierto.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className={ADMIN_SUBCARD_CLASS}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Empresa
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{registroAbierto.empresa}</p>
                </div>
                <div className={ADMIN_SUBCARD_CLASS}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Servicio / asunto
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{registroAbierto.servicio}</p>
                </div>
                <div className={cn(ADMIN_SUBCARD_CLASS, 'lg:col-span-2')}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Equipo asignado
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{teamDraft.length} seleccionado(s)</span>
                  </div>
                  <div className="grid gap-3 xl:grid-cols-2">
                    <div className="rounded-lg border border-zinc-100 bg-zinc-50/40 p-2.5 dark:border-zinc-700 dark:bg-zinc-900/40">
                      <p className="mb-2 text-[11px] font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
                        Actual
                      </p>
                      <ul className="max-h-52 space-y-2 overflow-auto pr-1">
                        {teamDraft.map((pr) => (
                          <li
                            key={pr.id}
                            className="flex items-start gap-2 rounded-md border border-zinc-100 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-950/80"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-[#17304b] dark:bg-indigo-950/70 dark:text-indigo-200">
                              {personInitials(pr.nombre)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-foreground">{pr.nombre}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{pr.rol}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="ml-auto"
                              onClick={() => setTeamDraft((prev) => prev.filter((x) => x.id !== pr.id))}
                              aria-label={`Quitar ${pr.nombre}`}
                            >
                              <X className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-dashed border-zinc-200 p-2.5 dark:border-zinc-600">
                      <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
                        <UserPlus className="size-3.5" />
                        Agregar
                      </p>
                      <input
                        value={assignDeveloperSearch}
                        onChange={(e) => setAssignDeveloperSearch(e.target.value)}
                        placeholder="Buscar nombre/rol/correo"
                        className={ADMIN_FIELD_INPUT_SM_CLASS}
                      />
                      <div className="max-h-52 space-y-1.5 overflow-auto pr-1">
                        {assignDirectoryLoad === 'loading' ? (
                          <p className="text-xs text-muted-foreground">Cargando directorio…</p>
                        ) : (
                          directoryFiltered.map((d) => (
                            <label
                              key={d.id}
                              className="flex cursor-pointer items-start gap-2 rounded-md border border-zinc-100 bg-white px-2 py-2 dark:border-zinc-700 dark:bg-zinc-950/80"
                            >
                              <Checkbox
                                checked={teamIds.has(d.id)}
                                onCheckedChange={(v) => {
                                  if (v === true) {
                                    setTeamDraft((prev) => [
                                      ...prev,
                                      { id: d.id, nombre: d.nombre, rol: d.rol, correo: d.correo },
                                    ]);
                                  } else {
                                    setTeamDraft((prev) => prev.filter((x) => x.id !== d.id));
                                  }
                                }}
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-medium text-zinc-900">{d.nombre}</span>
                                <span className="block truncate text-[11px] text-zinc-500">{d.rol}</span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      type="button"
                      size="sm"
                      className={cn('w-full', ADMIN_PRIMARY_BTN_CLASS)}
                      disabled={teamDraft.length === 0}
                      onClick={() => {
                        addAssignedProject({
                          contactId: registroAbierto.contactId,
                          titulo: registroAbierto.titulo,
                          empresa: registroAbierto.empresa,
                          contactoNombre: registroAbierto.contactoNombre,
                          servicio: registroAbierto.servicio,
                          descripcion: registroAbierto.descripcion,
                          prospectos: teamDraft,
                        });
                        setLeadStatusFeedback('Equipo actualizado correctamente.');
                        window.setTimeout(() => setLeadStatusFeedback(null), 1800);
                      }}
                    >
                      Guardar equipo
                    </Button>
                  </div>
                </div>
              </div>

              {registroAbierto.contactId.trim() !== '' ? (
                <div className={cn(ADMIN_SUBCARD_CLASS, 'mt-4')}>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Estado del lead en Compañías
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Misma columna Estado que en Compañías.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'h-10 min-w-[10rem] justify-center rounded-full border text-sm font-semibold shadow-xs',
                        COMPANY_LEAD_STATUS_BADGE_CLASS.completado,
                        'hover:bg-emerald-200/90 hover:text-emerald-950 dark:hover:bg-emerald-900/45 dark:hover:text-emerald-50',
                      )}
                      onClick={() => {
                        const contactId = registroAbierto.contactId;
                        void patchCompanyLeadStatusApi(contactId, 'completado').then(() => {
                          setLeadStatusOverrides((prev) =>
                            applyCompanyLeadStatusOverride(prev, contactId, 'completado'),
                          );
                          dispatchLeadStatusChanged();
                        });
                        setLeadStatusFeedback(
                          `Actualizado en Compañías: ${COMPANY_LEAD_STATUS_LABELS.completado}`,
                        );
                        window.setTimeout(() => setLeadStatusFeedback(null), 2200);
                      }}
                    >
                      <span
                        className={cn('size-2 shrink-0 rounded-full', COMPANY_LEAD_STATUS_DOT_CLASS.completado)}
                        aria-hidden
                      />
                      {COMPANY_LEAD_STATUS_LABELS.completado}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'h-10 min-w-[10rem] justify-center rounded-full border text-sm font-semibold shadow-xs',
                        COMPANY_LEAD_STATUS_BADGE_CLASS.descartado,
                        'hover:bg-rose-200/90 hover:text-rose-950 dark:hover:bg-rose-900/45 dark:hover:text-rose-50',
                      )}
                      onClick={() => {
                        const contactId = registroAbierto.contactId;
                        void patchCompanyLeadStatusApi(contactId, 'descartado').then(() => {
                          setLeadStatusOverrides((prev) =>
                            applyCompanyLeadStatusOverride(prev, contactId, 'descartado'),
                          );
                          dispatchLeadStatusChanged();
                        });
                        void removeAssignedProjectByContactId(registroAbierto.contactId);
                        setDetalleId(null);
                      }}
                    >
                      <span
                        className={cn('size-2 shrink-0 rounded-full', COMPANY_LEAD_STATUS_DOT_CLASS.descartado)}
                        aria-hidden
                      />
                      {COMPANY_LEAD_STATUS_LABELS.descartado}
                    </Button>
                  </div>
                  {leadStatusFeedback ? (
                    <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                      {leadStatusFeedback}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-6 text-xs text-muted-foreground">
                  Este proyecto no tiene ID de contacto; no se puede vincular con un lead en Compañías.
                </p>
              )}

              <Button
                type="button"
                className={cn('mt-6 w-full', ADMIN_PRIMARY_BTN_CLASS)}
                onClick={() => setDetalleId(null)}
              >
                Cerrar
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
