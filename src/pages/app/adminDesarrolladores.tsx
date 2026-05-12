import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Filter,
  Heart,
  Key,
  KeyRound,
  Loader2,
  MoreVertical,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { AdminSelect, type AdminSelectOption } from '@/components/app/AdminSelect';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { ADMIN_PAGE_SIZE, slicePage } from '@/lib/adminPagination';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  buildCvDownloadHref,
  buildCvPlainText,
  developerInitials,
  getDeveloperDirectoryRowKey,
  mapApiDeveloperToProfile,
  type ApiDeveloperPayload,
  type DeveloperProfile,
} from '@/lib/devDevelopers';
import {
  loadDeveloperFavoriteIds,
  persistDeveloperFavoriteIds,
  toggleDeveloperFavoriteId,
} from '@/lib/developerFavorites';
import {
  setAdminDevelopersSeenMax,
} from '@/lib/appNavBadges';
import { ADMIN_FILTER_BADGE_CLASS, ADMIN_FILTER_CONTROL_CLASS, ADMIN_FAVORITES_TOOLBAR_BUTTON_ACTIVE, ADMIN_FAVORITES_TOOLBAR_BUTTON_INACTIVE } from '@/lib/adminFilterUi';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
  ADMIN_ROW_ACTION_ICON_MUTED_CLASS,
  ADMIN_TABLE_ACTIONS_TH_CLASS,
  adminRowActionHeartIconClass,
} from '@/lib/adminTableActionsUi';
import { cn } from '@/lib/utils';

const FECHA_ORDEN_DEV_OPTIONS: AdminSelectOption[] = [
  { value: 'newest', label: 'Más nuevos primero' },
  { value: 'oldest', label: 'Más viejos primero' },
];

const VISA_FILTER_OPTIONS: AdminSelectOption[] = [
  { value: '', label: 'Visa vigente' },
  { value: 'si', label: 'Si' },
  { value: 'no', label: 'No' },
];

const VIAJES_FILTER_OPTIONS: AdminSelectOption[] = [
  { value: '', label: 'Viajes' },
  { value: 'si', label: 'Disponible' },
  { value: 'no', label: 'No disponible' },
];

const EMPLEO_FILTER_OPTIONS: AdminSelectOption[] = [
  { value: '', label: 'Empleo actual' },
  { value: 'si', label: 'Trabaja actualmente' },
  { value: 'no', label: 'Sin empleo actual' },
];

/** Texto para comparar búsquedas: minúsculas, sin acentos comunes, espacios colapsados. */
function searchFold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Coincide solo con nombre, apellido, correo y etiquetas de expertise; varias palabras = todas deben aparecer. */
function matchesDeveloperSearch(raw: string, d: DeveloperProfile): boolean {
  const q = searchFold(raw);
  if (!q) return true;
  const hay = searchFold(
    [d.nombre, d.apellido, `${d.nombre} ${d.apellido}`.trim(), d.correo, ...d.expertis].join(' '),
  );
  const tokens = q.split(' ').filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

export default function AppAdminDesarrolladoresPage() {
  const [location] = useLocation();
  const portalBase = location.includes('/app/recruiter/') ? '/app/recruiter' : '/app/admin';
  const [developers, setDevelopers] = useState<DeveloperProfile[]>([]);
  const [apiLoad, setApiLoad] = useState<'idle' | 'loading' | 'done'>('idle');
  const [apiError, setApiError] = useState<'none' | 'no-config' | 'failed'>('none');
  const [accessActionError, setAccessActionError] = useState<string | null>(null);
  const [accessBusyByDeveloper, setAccessBusyByDeveloper] = useState<Record<string, boolean>>({});
  const [accessDialog, setAccessDialog] = useState<{
    open: boolean;
    title: string;
    email: string;
    password: string;
  }>({ open: false, title: '', email: '', password: '' });
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [devFavoriteIds, setDevFavoriteIds] = useState<Set<string>>(() => loadDeveloperFavoriteIds());
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (typeof base !== 'string' || !base.trim()) {
      queueMicrotask(() => {
        setApiError('no-config');
        setApiLoad('done');
      });
      return;
    }
    const baseUrl = base.replace(/\/$/, '');
    const url = `${baseUrl}/users/developers`;
    const accessUrl = `${baseUrl}/users/developers/access-status`;
    queueMicrotask(() => {
      setApiLoad('loading');
      setApiError('none');
    });
    void Promise.all([
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<unknown>;
      }),
      fetch(accessUrl).then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<
          Array<{ developerId: string; accessEnabled: boolean }>
        >;
      }),
    ])
      .then(([developersRaw, accessRaw]) => {
        if (!Array.isArray(developersRaw)) return;
        const accessById = new Map<string, boolean>();
        for (const row of accessRaw) {
          if (row && typeof row.developerId === 'string') {
            accessById.set(row.developerId, !!row.accessEnabled);
          }
        }
        setDevelopers(
          developersRaw.map((row) => {
            const parsed = row as ApiDeveloperPayload;
            return mapApiDeveloperToProfile({
              ...parsed,
              accessEnabled: accessById.get(parsed.id) ?? parsed.accessEnabled ?? false,
            });
          }),
        );
      })
      .catch(() => {
        setApiError('failed');
      })
      .finally(() => setApiLoad('done'));
  }, []);

  useEffect(() => {
    if (apiLoad !== 'done') return;
    const maxTs = Math.max(
      0,
      ...developers.map((d) => (Number.isFinite(d.createdAtMs) ? d.createdAtMs : 0)),
    );
    setAdminDevelopersSeenMax(maxTs);
  }, [apiLoad, developers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [cvPreview, setCvPreview] = useState<{
    open: boolean;
    kind: 'pdf' | 'pdf-loading' | 'pdf-error' | 'text';
    /** URL del blob (mismo origen que el admin) para el iframe; revocar al cerrar. */
    pdfBlobUrl?: string;
    /** URL original del API (fallback si falla el fetch). */
    pdfSourceUrl?: string;
    textBody?: string;
    title: string;
  }>({ open: false, kind: 'text', title: '' });

  const openCvPreview = (developer: DeveloperProfile) => {
    const title = `${developer.nombre} ${developer.apellido}`.trim();
    if (!developer.resumeUrl) {
      setCvPreview({
        open: true,
        kind: 'text',
        textBody: buildCvPlainText(developer),
        title,
      });
      return;
    }
    const sourceUrl = developer.resumeUrl;
    setCvPreview({
      open: true,
      kind: 'pdf-loading',
      title,
      pdfSourceUrl: sourceUrl,
    });
    void fetch(sourceUrl, { mode: 'cors', credentials: 'omit' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.blob();
      })
      .then((blob) => {
        const typed =
          blob.type === 'application/pdf'
            ? blob
            : new Blob([blob], { type: 'application/pdf' });
        const pdfBlobUrl = URL.createObjectURL(typed);
        setCvPreview({
          open: true,
          kind: 'pdf',
          title,
          pdfBlobUrl,
          pdfSourceUrl: sourceUrl,
        });
      })
      .catch(() => {
        setCvPreview({
          open: true,
          kind: 'pdf-error',
          title,
          pdfSourceUrl: sourceUrl,
        });
      });
  };

  const closeCvPreview = (open: boolean) => {
    if (!open) {
      setCvPreview((p) => {
        if (p.kind === 'pdf' && p.pdfBlobUrl) {
          URL.revokeObjectURL(p.pdfBlobUrl);
        }
        return { open: false, kind: 'text', title: '' };
      });
    }
  };
  const [disponibilidadFilter, setDisponibilidadFilter] = useState('');
  const [visaFilter, setVisaFilter] = useState('');
  const [viajesFilter, setViajesFilter] = useState('');
  const [empleoActualFilter, setEmpleoActualFilter] = useState('');
  const [procedenciaFilter, setProcedenciaFilter] = useState('');
  /** Orden por fecha de alta (`createdAt` del API). */
  const [fechaOrden, setFechaOrden] = useState<'newest' | 'oldest'>('newest');
  const [devPage, setDevPage] = useState(1);

  const disponibilidadOptions = useMemo(
    () => Array.from(new Set(developers.map((d) => d.disponibilidad))),
    [developers],
  );
  const procedenciaOptions = useMemo(
    () => Array.from(new Set(developers.map((d) => d.procedencia))),
    [developers],
  );

  const disponibilidadSelectOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: '', label: 'Disponibilidad' },
      ...disponibilidadOptions.map((o) => ({ value: o, label: o })),
    ],
    [disponibilidadOptions],
  );
  const procedenciaSelectOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: '', label: 'Procedencia' },
      ...procedenciaOptions.map((o) => ({ value: o, label: o })),
    ],
    [procedenciaOptions],
  );

  const filteredDevelopers = useMemo(() => {
    const filtered = developers.filter((developer) => {
      const matchesSearch = matchesDeveloperSearch(searchTerm, developer);

      const matchesDisponibilidad =
        disponibilidadFilter === '' || developer.disponibilidad === disponibilidadFilter;
      const matchesVisa =
        visaFilter === '' || (developer.visaVigente ? 'si' : 'no') === visaFilter;
      const matchesViajes =
        viajesFilter === '' || (developer.disponibilidadViajar ? 'si' : 'no') === viajesFilter;
      const matchesEmpleoActual =
        empleoActualFilter === '' ||
        (developer.currentlyEmployed ? 'si' : 'no') === empleoActualFilter;
      const matchesProcedencia =
        procedenciaFilter === '' || developer.procedencia === procedenciaFilter;

      const favKey = getDeveloperDirectoryRowKey(developer);
      return (
        matchesSearch &&
        matchesDisponibilidad &&
        matchesVisa &&
        matchesViajes &&
        matchesEmpleoActual &&
        matchesProcedencia &&
        (!favoritesOnly || devFavoriteIds.has(favKey))
      );
    });

    return [...filtered].sort((a, b) => {
      const ta = a.createdAtMs;
      const tb = b.createdAtMs;
      if (ta === tb) return 0;
      return fechaOrden === 'oldest' ? ta - tb : tb - ta;
    });
  }, [
    searchTerm,
    disponibilidadFilter,
    visaFilter,
    viajesFilter,
    empleoActualFilter,
    procedenciaFilter,
    fechaOrden,
    developers,
    favoritesOnly,
    devFavoriteIds,
  ]);

  const paginatedDevelopers = useMemo(
    () => slicePage(filteredDevelopers, devPage, ADMIN_PAGE_SIZE),
    [filteredDevelopers, devPage],
  );

  useEffect(() => {
    queueMicrotask(() => setDevPage(1));
  }, [
    searchTerm,
    disponibilidadFilter,
    visaFilter,
    viajesFilter,
    empleoActualFilter,
    procedenciaFilter,
    fechaOrden,
    favoritesOnly,
  ]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredDevelopers.length / ADMIN_PAGE_SIZE));
    queueMicrotask(() => setDevPage((p) => Math.min(p, tp)));
  }, [filteredDevelopers.length]);

  const clearFilters = () => {
    setSearchTerm('');
    setDisponibilidadFilter('');
    setVisaFilter('');
    setViajesFilter('');
    setEmpleoActualFilter('');
    setProcedenciaFilter('');
    setFechaOrden('newest');
    setFavoritesOnly(false);
    setDevPage(1);
  };

  const toggleDeveloperFavorite = (developer: DeveloperProfile) => {
    const id = getDeveloperDirectoryRowKey(developer);
    setDevFavoriteIds((prev) => {
      const next = toggleDeveloperFavoriteId(prev, id);
      persistDeveloperFavoriteIds(next);
      return next;
    });
  };

  const copyEmail = (email: string) => {
    void navigator.clipboard
      .writeText(email)
      .then(() => {
        setCopiedEmail(email);
        window.setTimeout(() => setCopiedEmail(null), 1200);
      })
      .catch(() => {
        setCopiedEmail(null);
      });
  };

  const copyGeneratedPassword = (value: string) => {
    void navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedPassword(true);
        window.setTimeout(() => setCopiedPassword(false), 1400);
      })
      .catch(() => {
        setCopiedPassword(false);
      });
  };

  const getDeveloperApiId = (developer: DeveloperProfile): string => {
    if (developer.id) return developer.id;
    if (developer.rowKey?.startsWith('api-')) return developer.rowKey.slice(4);
    return '';
  };

  const setDeveloperAccessEnabled = (developerId: string, enabled: boolean) => {
    setDevelopers((prev) =>
      prev.map((d) => (getDeveloperApiId(d) === developerId ? { ...d, accessEnabled: enabled } : d)),
    );
  };

  const runDeveloperAccessAction = (
    developer: DeveloperProfile,
    action: 'enable-access' | 'reset-password' | 'disable-access',
  ) => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (typeof base !== 'string' || !base.trim()) {
      setApiError('no-config');
      return;
    }
    const developerId = getDeveloperApiId(developer);
    if (!developerId) {
      setAccessActionError('No se pudo identificar al desarrollador para esta acción.');
      return;
    }
    setAccessActionError(null);
    setAccessBusyByDeveloper((prev) => ({ ...prev, [developerId]: true }));
    const url = `${base.replace(/\/$/, '')}/users/developers/${developerId}/${action}`;
    void fetch(url, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{
          developerId: string;
          email: string;
          password?: string;
          accessEnabled: boolean;
        }>;
      })
      .then((payload) => {
        setDeveloperAccessEnabled(payload.developerId, payload.accessEnabled);
        if (payload.password) {
          setCopiedPassword(false);
          setAccessDialog({
            open: true,
            title: action === 'enable-access' ? 'Acceso habilitado' : 'Contraseña regenerada',
            email: payload.email,
            password: payload.password,
          });
        }
      })
      .catch(() => {
        setAccessActionError('No se pudo completar la acción de acceso. Intenta nuevamente.');
      })
      .finally(() => {
        setAccessBusyByDeveloper((prev) => ({ ...prev, [developerId]: false }));
      });
  };

  const badgeColorByDisponibilidad: Record<string, string> = {
    Inmediata:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-800/40',
    '2 semanas':
      'bg-slate-200 text-slate-800 dark:bg-zinc-700/80 dark:text-zinc-200 dark:ring-1 dark:ring-zinc-600',
    '1 mes':
      'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-1 dark:ring-amber-800/40',
  };

  return (
    <AppShell
      pathWithoutLang={`${portalBase}/desarrolladores`}
      title="Desarrolladores"
      description="Admin panel"
      contentOverflow="hidden"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <section
        id="developers"
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden scroll-mt-24"
      >
        <div className="min-h-0 shrink-0 space-y-2">
          <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-[#0b1f3a] dark:text-zinc-50">
                Gente Talentosa
              </h2>
              {apiLoad === 'loading' ? (
                <p className="mt-1 text-xs text-muted-foreground">Cargando desarrolladores…</p>
              ) : null}
              {apiError === 'no-config' ? (
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/95">
                  Configura{' '}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-950/80 dark:text-amber-200">
                    VITE_API_BASE_URL
                  </code>{' '}
                  para listar desde la base de datos.
                </p>
              ) : null}
              {apiError === 'failed' ? (
                <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                  No se pudo cargar el listado. Comprueba la API.
                </p>
              ) : null}
              {accessActionError ? (
                <p className="mt-1 text-xs text-red-700 dark:text-red-400">{accessActionError}</p>
              ) : null}
              {apiLoad === 'done' && apiError === 'none' && developers.length > 0 ? (
                <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-400/90">
                  {developers.length}{' '}
                  {developers.length === 1 ? 'postulación' : 'postulaciones'} en el directorio.
                </p>
              ) : null}
              {apiLoad === 'done' && apiError === 'none' && developers.length === 0 ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Aún no hay postulaciones en la base de datos.
                </p>
              ) : null}
          </div>
        </div>

        <div className="shrink-0 rounded-lg border border-border/70 bg-card p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/25 dark:shadow-none sm:p-3">
          <div className="flex flex-col gap-2">
            <div className="min-w-0 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:thin]">
              <div className="flex w-max flex-nowrap items-center gap-1.5 pr-0.5">
                <span className={ADMIN_FILTER_BADGE_CLASS}>
                  <Filter className="size-3" aria-hidden />
                  Filtros rápidos
                </span>
                <AdminSelect
                  value={fechaOrden}
                  onValueChange={(v) => setFechaOrden(v as 'newest' | 'oldest')}
                  options={FECHA_ORDEN_DEV_OPTIONS}
                  aria-label="Orden por fecha de alta"
                  triggerClassName="h-8 shrink-0"
                />
                <AdminSelect
                  value={disponibilidadFilter}
                  onValueChange={setDisponibilidadFilter}
                  options={disponibilidadSelectOptions}
                  aria-label="Filtrar por disponibilidad"
                  triggerClassName="h-8 shrink-0"
                />
                <AdminSelect
                  value={visaFilter}
                  onValueChange={setVisaFilter}
                  options={VISA_FILTER_OPTIONS}
                  aria-label="Filtrar por visa vigente"
                  triggerClassName="h-8 shrink-0"
                />
                <AdminSelect
                  value={viajesFilter}
                  onValueChange={setViajesFilter}
                  options={VIAJES_FILTER_OPTIONS}
                  aria-label="Filtrar por disponibilidad para viajar"
                  triggerClassName="h-8 shrink-0"
                />
                <AdminSelect
                  value={empleoActualFilter}
                  onValueChange={setEmpleoActualFilter}
                  options={EMPLEO_FILTER_OPTIONS}
                  aria-label="Filtrar por empleo actual"
                  triggerClassName="h-8 shrink-0"
                />
                <AdminSelect
                  value={procedenciaFilter}
                  onValueChange={setProcedenciaFilter}
                  options={procedenciaSelectOptions}
                  aria-label="Filtrar por procedencia"
                  triggerClassName="h-8 shrink-0"
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Nombre, apellido, correo o expertise…"
                  aria-label="Buscar por nombre, correo o expertise"
                  className={cn(
                    'h-8 w-full pr-2 pl-8',
                    ADMIN_FILTER_CONTROL_CLASS,
                    'placeholder:text-muted-foreground',
                  )}
                />
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={favoritesOnly ? ADMIN_FAVORITES_TOOLBAR_BUTTON_ACTIVE : ADMIN_FAVORITES_TOOLBAR_BUTTON_INACTIVE}
                  aria-pressed={favoritesOnly}
                  title={favoritesOnly ? 'Mostrar todos los desarrolladores' : 'Solo desarrolladores marcados como favoritos'}
                  onClick={() => setFavoritesOnly((v) => !v)}
                >
                  <Heart
                    className={cn(
                      'shrink-0',
                      favoritesOnly ? 'size-4 fill-white text-white' : 'size-3.5 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400',
                    )}
                    aria-hidden
                  />
                  <span className="text-[11px] font-semibold">Favoritos</span>
                </Button>
                <Button variant="ghost" size="sm" type="button" className="shrink-0" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="isolate flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/20 dark:shadow-none">
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 overflow-auto overscroll-contain rounded-t-lg">
            <table className="w-full min-w-0 table-fixed border-collapse text-left text-[12px]">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[17%]" />
                <col className="w-[20%]" />
                <col className="w-[19%]" />
                <col className="w-[18%]" />
              </colgroup>
            <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted text-[10px] tracking-[0.05em] text-muted-foreground uppercase dark:bg-muted">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Nombre</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Disponibilidad</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Contacto</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Expertise</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Documentación</th>
                <th className={ADMIN_TABLE_ACTIONS_TH_CLASS}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevelopers.map((developer) => {
                const developerFullName = `${developer.nombre} ${developer.apellido}`.trim();
                const developerFavoriteKey = getDeveloperDirectoryRowKey(developer);
                const isDeveloperFavorite = devFavoriteIds.has(developerFavoriteKey);
                return (
                <tr
                  key={developer.rowKey ?? developer.correo}
                  className="border-t border-zinc-100 transition-colors hover:bg-muted/30 dark:border-zinc-800 dark:hover:bg-muted/15"
                >
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <div className="flex min-w-0 items-center gap-1.5 xl:gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-semibold text-[#17304b] xl:size-9 xl:text-xs dark:bg-indigo-950/70 dark:text-indigo-200">
                        {developerInitials(developer)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-zinc-900 dark:text-zinc-100"
                          title={developerFullName}
                        >
                          {developerFullName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <span
                      className={`inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeColorByDisponibilidad[developer.disponibilidad] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/90 dark:text-zinc-200 dark:ring-1 dark:ring-zinc-600'}`}
                      title={developer.disponibilidad}
                    >
                      {developer.disponibilidad}
                    </span>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <div className="flex min-w-0 items-center gap-1">
                      <p className="min-w-0 truncate text-zinc-800 dark:text-zinc-300" title={developer.correo}>
                        {developer.correo}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => copyEmail(developer.correo)}
                        title="Copiar correo"
                        aria-label={`Copiar correo de ${developerFullName}`}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                    {copiedEmail === developer.correo ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Correo copiado</p>
                    ) : null}
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <div className="flex min-h-0 min-w-0 max-w-full flex-wrap gap-1">
                      {developer.expertis.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-1 dark:ring-indigo-800/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {developer.visaVigente ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-red-500" />
                        )}
                        <span
                          className={developer.visaVigente ? 'text-zinc-800 dark:text-zinc-300' : 'text-red-600 dark:text-red-400'}
                        >
                          Visa vigente
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {developer.disponibilidadViajar ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-red-500" />
                        )}
                        <span
                          className={
                            developer.disponibilidadViajar
                              ? 'text-zinc-800 dark:text-zinc-300'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          Disponibilidad viaje
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {developer.currentlyEmployed ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="size-3.5 text-red-500" />
                        )}
                        <span
                          className={
                            developer.currentlyEmployed
                              ? 'text-zinc-800 dark:text-zinc-300'
                              : 'text-red-600 dark:text-red-400'
                          }
                        >
                          {developer.currentlyEmployed
                            ? 'Trabaja actualmente'
                            : 'Sin empleo actual'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle px-2 py-2 text-center xl:px-4 xl:py-2.5">
                    {(() => {
                      const developerId = getDeveloperApiId(developer);
                      const isBusy = accessBusyByDeveloper[developerId] === true;
                      return (
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                            aria-label={
                              isDeveloperFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'
                            }
                            aria-pressed={isDeveloperFavorite}
                            title={isDeveloperFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                            onClick={() => toggleDeveloperFavorite(developer)}
                          >
                            <Heart
                              className={adminRowActionHeartIconClass(isDeveloperFavorite)}
                              strokeWidth={1.5}
                              aria-hidden
                            />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                            title="Ver CV"
                            aria-label={`Ver CV de ${developerFullName}`}
                            onClick={() => openCvPreview(developer)}
                          >
                            <Eye className="size-4" strokeWidth={1.5} aria-hidden />
                          </Button>
                          <Button variant="ghost" size="icon" className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS} asChild>
                            <a
                              href={
                                developer.resumeUrl
                                  ? developer.resumeUrl
                                  : buildCvDownloadHref(developer)
                              }
                              download={developer.resumeUrl ? undefined : developer.cvFileName}
                              target={developer.resumeUrl ? '_blank' : undefined}
                              rel={developer.resumeUrl ? 'noopener noreferrer' : undefined}
                              title="Descargar CV"
                              aria-label={`Descargar CV de ${developerFullName}`}
                            >
                              <Download className="size-4" strokeWidth={1.5} aria-hidden />
                            </a>
                          </Button>
                          <span
                            className="inline-flex size-8 shrink-0 items-center justify-center"
                            title={
                              developer.accessEnabled
                                ? 'Acceso al panel habilitado'
                                : 'Sin acceso al panel'
                            }
                            aria-label={
                              developer.accessEnabled ? 'Acceso habilitado' : 'Sin acceso al panel'
                            }
                          >
                            <Key
                              className={cn(
                                'size-4',
                                developer.accessEnabled
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
                                disabled={isBusy}
                                title="Más acciones de acceso"
                                aria-label={`Más acciones de acceso para ${developerFullName}`}
                              >
                                {isBusy ? (
                                  <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : (
                                  <MoreVertical className="size-4" strokeWidth={1.5} aria-hidden />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {developer.accessEnabled ? (
                                <>
                                  <DropdownMenuItem
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      runDeveloperAccessAction(developer, 'reset-password');
                                    }}
                                  >
                                    <KeyRound className="size-4" />
                                    Regenerar contraseña
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(event) => {
                                      event.preventDefault();
                                      runDeveloperAccessAction(developer, 'disable-access');
                                    }}
                                  >
                                    <UserX className="size-4" />
                                    Deshabilitar acceso
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    runDeveloperAccessAction(developer, 'enable-access');
                                  }}
                                >
                                  <UserCheck className="size-4" />
                                  Habilitar acceso
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
                );
              })}
              {filteredDevelopers.length === 0 ? (
                <tr className="border-t border-zinc-100 dark:border-zinc-800">
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground xl:px-5">
                    {developers.length === 0
                      ? 'No hay desarrolladores para mostrar.'
                      : 'No hay resultados con la búsqueda o los filtros seleccionados.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
            </div>
          </div>
          <AdminTablePagination
            page={devPage}
            totalItems={filteredDevelopers.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setDevPage}
            nounPlural="desarrolladores"
            className="shrink-0 gap-1 border-border/60 bg-muted/20 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-muted/10"
          />
        </div>
      </section>

      <Dialog open={cvPreview.open} onOpenChange={closeCvPreview}>
        <DialogContent
          className={cn(
            'flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0',
            /* Dialog base usa sm:w-auto: el iframe hace colapsar el ancho; forzar ancho tipo max-w-4xl (56rem) */
            'w-[min(calc(100vw-2rem),56rem)] max-w-[min(calc(100vw-2rem),56rem)] sm:w-[min(calc(100vw-2rem),56rem)] sm:max-w-[min(calc(100vw-2rem),56rem)]',
          )}
        >
          <DialogHeader className="border-b border-zinc-200 px-6 py-4">
            <DialogTitle>Vista previa CV — {cvPreview.title}</DialogTitle>
          </DialogHeader>
          {cvPreview.kind === 'pdf-loading' ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" aria-hidden />
              <p className="text-sm">Cargando PDF…</p>
            </div>
          ) : cvPreview.kind === 'pdf-error' ? (
            <div className="flex flex-col gap-4 p-6">
              <p className="text-sm text-zinc-700">
                No se pudo cargar la vista previa (CORS, red o el archivo). Puedes abrir el CV en una
                pestaña nueva.
              </p>
              {cvPreview.pdfSourceUrl ? (
                <Button asChild variant="outline" className="w-fit">
                  <a href={cvPreview.pdfSourceUrl} target="_blank" rel="noopener noreferrer">
                    Abrir PDF en nueva pestaña
                  </a>
                </Button>
              ) : null}
            </div>
          ) : cvPreview.kind === 'pdf' && cvPreview.pdfBlobUrl ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <iframe
                title="Vista previa del CV en PDF"
                src={cvPreview.pdfBlobUrl}
                className="min-h-[72vh] w-full flex-1 border-0 bg-zinc-100"
              />
            </div>
          ) : (
            <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap p-6 text-left text-sm leading-relaxed text-zinc-800">
              {cvPreview.textBody ?? ''}
            </pre>
          )}
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
            <p className="text-zinc-700">
              Entrega estas credenciales al desarrollador. Se muestra una sola vez en este panel.
            </p>
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Correo</p>
              <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900">
                {accessDialog.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Contraseña</p>
              <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-zinc-900">
                {accessDialog.password}
              </p>
            </div>
            <Button type="button" className="w-full" onClick={() => copyGeneratedPassword(accessDialog.password)}>
              {copiedPassword ? 'Contraseña copiada' : 'Copiar contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}
