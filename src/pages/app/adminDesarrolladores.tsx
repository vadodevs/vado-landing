import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Filter,
  KeyRound,
  Loader2,
  MoreVertical,
  Search,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';
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
  mapApiDeveloperToProfile,
  type ApiDeveloperPayload,
  type DeveloperProfile,
} from '@/lib/devDevelopers';
import {
  setAdminDevelopersSeenMax,
} from '@/lib/appNavBadges';

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

      return (
        matchesSearch &&
        matchesDisponibilidad &&
        matchesVisa &&
        matchesViajes &&
        matchesEmpleoActual &&
        matchesProcedencia
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
    setDevPage(1);
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
    >
      <section id="developers" className="min-w-0 scroll-mt-24">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#0b1f3a] dark:text-zinc-50">
              Gente Talentosa
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Administra y filtra el directorio global de desarrolladores.
            </p>
            {apiLoad === 'loading' ? (
              <p className="mt-2 text-sm text-muted-foreground">Cargando desarrolladores…</p>
            ) : null}
            {apiError === 'no-config' ? (
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300/95">
                Configura{' '}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-950/80 dark:text-amber-200">
                  VITE_API_BASE_URL
                </code>{' '}
                en el entorno para listar postulaciones desde la base de datos.
              </p>
            ) : null}
            {apiError === 'failed' ? (
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                No se pudo cargar el listado. Comprueba la API y vuelve a intentar.
              </p>
            ) : null}
            {accessActionError ? (
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">{accessActionError}</p>
            ) : null}
            {apiLoad === 'done' && apiError === 'none' && developers.length > 0 ? (
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400/90">
                {developers.length}{' '}
                {developers.length === 1 ? 'postulación' : 'postulaciones'} en el directorio.
              </p>
            ) : null}
            {apiLoad === 'done' && apiError === 'none' && developers.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Aún no hay postulaciones registradas en la base de datos.
              </p>
            ) : null}
          </div>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Nombre, apellido, correo o expertise…"
              aria-label="Buscar por nombre, correo o expertise"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
            />
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-none">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-semibold tracking-wide text-zinc-700 uppercase dark:bg-zinc-800/80 dark:text-zinc-300">
              <Filter className="size-3.5" />
              Filtros rapidos
            </span>
            <select
              value={fechaOrden}
              onChange={(event) => setFechaOrden(event.target.value as 'newest' | 'oldest')}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="newest">Más nuevos primero</option>
              <option value="oldest">Más viejos primero</option>
            </select>
            <select
              value={disponibilidadFilter}
              onChange={(event) => setDisponibilidadFilter(event.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Disponibilidad</option>
              {disponibilidadOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={visaFilter}
              onChange={(event) => setVisaFilter(event.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Visa vigente</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
            <select
              value={viajesFilter}
              onChange={(event) => setViajesFilter(event.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Viajes</option>
              <option value="si">Disponible</option>
              <option value="no">No disponible</option>
            </select>
            <select
              value={empleoActualFilter}
              onChange={(event) => setEmpleoActualFilter(event.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Empleo actual</option>
              <option value="si">Trabaja actualmente</option>
              <option value="no">Sin empleo actual</option>
            </select>
            <select
              value={procedenciaFilter}
              onChange={(event) => setProcedenciaFilter(event.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="">Procedencia</option>
              {procedenciaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-end sm:ml-auto sm:w-auto"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-none">
          <div className="overflow-x-auto xl:overflow-x-visible">
            <table className="w-full min-w-0 table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[24%]" />
              </colgroup>
            <thead className="bg-zinc-50/70 text-xs tracking-wide text-zinc-600 uppercase dark:bg-zinc-800/95 dark:text-zinc-400">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Nombre</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Contacto</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Expertise</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Documentacion</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDevelopers.map((developer) => (
                <tr
                  key={developer.rowKey ?? developer.correo}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 items-center gap-2 xl:gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-[#17304b] xl:size-10 xl:text-sm dark:bg-indigo-950/70 dark:text-indigo-200">
                        {developerInitials(developer)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{developer.nombre}</p>
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{developer.apellido}</p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeColorByDisponibilidad[developer.disponibilidad] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/90 dark:text-zinc-200 dark:ring-1 dark:ring-zinc-600'}`}
                        >
                          {developer.disponibilidad}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
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
                        aria-label={`Copiar correo de ${developer.nombre}`}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                    {copiedEmail === developer.correo ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Correo copiado</p>
                    ) : null}
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 max-w-full flex-wrap gap-1">
                      {developer.expertis.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-1 dark:ring-indigo-800/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="space-y-1.5 text-xs">
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
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    {(() => {
                      const developerId = getDeveloperApiId(developer);
                      const isBusy = accessBusyByDeveloper[developerId] === true;
                      return (
                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 xl:flex-nowrap xl:gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 gap-1 border-zinc-300 px-2 text-xs xl:h-9 xl:gap-1.5 xl:px-3 xl:text-sm dark:border-zinc-600 dark:bg-transparent dark:text-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => openCvPreview(developer)}
                      >
                        <Eye className="size-3.5 shrink-0 xl:size-4" />
                        Ver CV
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="h-8 shrink-0 gap-1 bg-[#0b2a55] px-2 text-xs hover:bg-[#0a2347] xl:h-9 xl:gap-1.5 xl:px-3 xl:text-sm dark:bg-sky-900/80 dark:hover:bg-sky-900"
                      >
                        <a
                          href={
                            developer.resumeUrl
                              ? developer.resumeUrl
                              : buildCvDownloadHref(developer)
                          }
                          download={developer.resumeUrl ? undefined : developer.cvFileName}
                          target={developer.resumeUrl ? '_blank' : undefined}
                          rel={developer.resumeUrl ? 'noopener noreferrer' : undefined}
                        >
                          <Download className="size-3.5 shrink-0 xl:size-4" />
                          Descargar CV
                        </a>
                      </Button>
                      <span
                        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${
                          developer.accessEnabled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-800/40'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                        title={developer.accessEnabled ? 'Acceso habilitado' : 'Sin acceso'}
                        aria-label={developer.accessEnabled ? 'Acceso habilitado' : 'Sin acceso'}
                      >
                        <KeyRound className="size-4" />
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="shrink-0"
                            disabled={isBusy}
                            aria-label={`Acciones de acceso para ${developer.nombre}`}
                          >
                            <MoreVertical className="size-4" />
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
              ))}
              {filteredDevelopers.length === 0 ? (
                <tr className="border-t border-zinc-100 dark:border-zinc-800">
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground xl:px-5">
                    {developers.length === 0
                      ? 'No hay desarrolladores para mostrar.'
                      : 'No hay resultados con la búsqueda o los filtros seleccionados.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          </div>
          <AdminTablePagination
            page={devPage}
            totalItems={filteredDevelopers.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setDevPage}
            nounPlural="desarrolladores"
          />
        </div>
      </section>

      <Dialog open={cvPreview.open} onOpenChange={closeCvPreview}>
        <DialogContent className="flex max-h-[90vh] min-w-0 max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
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
            <iframe
              title="Vista previa del CV en PDF"
              src={cvPreview.pdfBlobUrl}
              className="min-h-[72vh] w-full flex-1 border-0 bg-zinc-100"
            />
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
    </AppShell>
  );
}
