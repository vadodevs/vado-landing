import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Copy,
  Eye,
  Filter,
  KeyRound,
  Mail,
  MoreVertical,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAdminAssignedProjects } from '@/contexts/AdminAssignedProjectsContext';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { ADMIN_PAGE_SIZE, slicePage } from '@/lib/adminPagination';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import type { AdminProspecto } from '@/lib/adminProspectos';
import {
  mapApiCompanySubmission,
  type ApiCompanySubmissionRow,
  type CompanyContact,
} from '@/lib/companyAdminContact';
import {
  COMPANY_LEAD_STATUSES,
  COMPANY_LEAD_STATUS_BADGE_CLASS,
  COMPANY_LEAD_STATUS_DOT_CLASS,
  COMPANY_LEAD_STATUS_LABELS,
  applyCompanyLeadStatusOverride,
  getCompanyLeadStatus,
  LEAD_STATUS_CHANGED_EVENT,
  loadCompanyLeadStatusOverrides,
  persistCompanyLeadStatus,
  saveCompanyLeadStatusOverrides,
  type CompanyLeadStatus,
} from '@/lib/companyLeadStatus';
import { getCompanySessionProfile } from '@/lib/companyProfile';
import {
  DEVELOPERS,
  developerProfileToAssignableRow,
  mapApiDeveloperToProfile,
  type ApiDeveloperPayload,
  type DeveloperProfile,
} from '@/lib/devDevelopers';
import {
  setAdminCompaniesSeenMax,
} from '@/lib/appNavBadges';
import { cn } from '@/lib/utils';

type TimeFilter = 'todos' | 'hoy' | 'semana' | 'mes';

type FlowStep = 'detalle' | 'prospectos' | 'confirmacion' | 'exito';

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateOnly(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number);
  return new Date(y, m - 1, day);
}

function startOfWeekMonday(ref: Date): Date {
  const x = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeekSunday(ref: Date): Date {
  const start = startOfWeekMonday(ref);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(ref: Date): Date {
  return new Date(ref.getFullYear(), ref.getMonth(), 1);
}

function endOfMonth(ref: Date): Date {
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
}

function searchFold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Búsqueda en el directorio al asignar (nombre, rol, correo, expertise, disponibilidad). */
function matchesAssignableDirectorySearch(
  raw: string,
  dev: {
    nombre: string;
    rol: string;
    correo: string;
    expertis: string;
    disponibilidad: string;
  },
): boolean {
  const q = searchFold(raw);
  if (!q) return true;
  const hay = searchFold(
    [dev.nombre, dev.rol, dev.correo, dev.expertis, dev.disponibilidad].join(' '),
  );
  const tokens = q.split(' ').filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

/** Búsqueda por nombre, empresa, correo o servicio (todas las palabras deben coincidir). */
function matchesCompanySearch(raw: string, c: CompanyContact): boolean {
  const q = searchFold(raw);
  if (!q) return true;
  const hay = searchFold([c.nombre, c.empresa, c.correo, c.servicio].join(' '));
  const tokens = q.split(' ').filter(Boolean);
  return tokens.every((t) => hay.includes(t));
}

function fechaSolicitudToMs(iso: string): number {
  const parts = iso.split('-').map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return 0;
  const t = new Date(y, m - 1, d).getTime();
  return Number.isFinite(t) ? t : 0;
}

function leadInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) || '??').toUpperCase();
}

function matchesTimeFilter(fechaSolicitud: string, filter: TimeFilter, now: Date): boolean {
  const fecha = parseDateOnly(fechaSolicitud);
  fecha.setHours(12, 0, 0, 0);

  if (filter === 'todos') return true;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  if (filter === 'hoy') {
    return fecha >= todayStart && fecha <= todayEnd;
  }

  if (filter === 'semana') {
    const ws = startOfWeekMonday(now);
    const we = endOfWeekSunday(now);
    return fecha >= ws && fecha <= we;
  }

  if (filter === 'mes') {
    const ms = startOfMonth(now);
    const me = endOfMonth(now);
    return fecha >= ms && fecha <= me;
  }

  return true;
}

function buildDemoContacts(): CompanyContact[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDateOnly(d);
  };

  const demoPrincipal = getCompanySessionProfile();

  const f1 = demoPrincipal.fechaSolicitud;
  const f2 = daysAgo(4);
  const f3 = daysAgo(45);
  return [
    {
      id: '1',
      ...demoPrincipal,
      createdAtMs: fechaSolicitudToMs(f1),
    },
    {
      id: '2',
      servicio: 'Custom Software Development',
      nombre: 'Luis Andrade',
      correo: 'luis@ejemplo.com',
      empresa: 'Nova Labs',
      telefono: '555 123 9988',
      mensaje: 'Hola, buscamos un equipo para un MVP en 8 semanas.',
      sector: '',
      ciudad: '',
      fechaSolicitud: f2,
      createdAtMs: fechaSolicitudToMs(f2),
    },
    {
      id: '3',
      servicio: 'Staff Augmentation',
      nombre: 'Marina Ortiz',
      correo: 'm.ortiz@ejemplo.com',
      empresa: 'Delta Tech',
      telefono: '555 000 1122',
      mensaje: 'Necesitamos ampliar el equipo de backend.',
      sector: '',
      ciudad: '',
      fechaSolicitud: f3,
      createdAtMs: fechaSolicitudToMs(f3),
    },
  ];
}

export default function AppAdminCompanyPage() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const portalBase = location.includes('/app/recruiter/') ? '/app/recruiter' : '/app/admin';
  const { addAssignedProject, removeAssignedProjectByContactId } = useAdminAssignedProjects();
  const [selected, setSelected] = useState<CompanyContact | null>(null);
  const [open, setOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('detalle');
  const [seleccionProspectos, setSeleccionProspectos] = useState<Record<string, boolean>>({});
  const [assignDeveloperSearch, setAssignDeveloperSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLeadEmail, setCopiedLeadEmail] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaOrden, setFechaOrden] = useState<'newest' | 'oldest'>('newest');
  const [asuntoFilter, setAsuntoFilter] = useState('');
  /** Vacío = todos los estados; si hay valores, solo filas con uno de esos estados. */
  const [estadoFilterSelection, setEstadoFilterSelection] = useState<CompanyLeadStatus[]>([]);
  const [companyPage, setCompanyPage] = useState(1);
  const [leadStatusOverrides, setLeadStatusOverrides] = useState<
    Record<string, CompanyLeadStatus>
  >(() => loadCompanyLeadStatusOverrides());
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [contactsLoad, setContactsLoad] = useState<'idle' | 'loading' | 'done'>('idle');
  const [contactsSource, setContactsSource] = useState<'demo' | 'api'>('demo');
  const [contactsError, setContactsError] = useState<'none' | 'no-config' | 'fail'>('none');
  const [assignDirectory, setAssignDirectory] = useState<DeveloperProfile[]>([]);
  const [assignDirectoryLoad, setAssignDirectoryLoad] = useState<'idle' | 'loading' | 'done'>('idle');
  const [assignDirectoryError, setAssignDirectoryError] = useState<'none' | 'no-config' | 'fail'>(
    'none',
  );
  const [companyAccessById, setCompanyAccessById] = useState<Record<string, boolean>>({});
  const [companyAccessBusyById, setCompanyAccessBusyById] = useState<Record<string, boolean>>({});
  const [companyAccessError, setCompanyAccessError] = useState<string | null>(null);
  const [companyAccessDialog, setCompanyAccessDialog] = useState<{
    open: boolean;
    title: string;
    email: string;
    password: string;
  }>({ open: false, title: '', email: '', password: '' });
  const [copiedGeneratedPassword, setCopiedGeneratedPassword] = useState(false);

  useEffect(() => {
    const onLeadStatusExternal = () => setLeadStatusOverrides(loadCompanyLeadStatusOverrides());
    window.addEventListener(LEAD_STATUS_CHANGED_EVENT, onLeadStatusExternal);
    return () => window.removeEventListener(LEAD_STATUS_CHANGED_EVENT, onLeadStatusExternal);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const base = import.meta.env.VITE_API_BASE_URL;
      if (typeof base !== 'string' || !base.trim()) {
        setAssignDirectory(DEVELOPERS);
        setAssignDirectoryError('no-config');
        setAssignDirectoryLoad('done');
        return;
      }
      const url = `${base.replace(/\/$/, '')}/users/developers`;
      setAssignDirectoryLoad('loading');
      setAssignDirectoryError('none');
      void fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<unknown>;
        })
        .then((data: unknown) => {
          if (!Array.isArray(data)) {
            setAssignDirectory([]);
            return;
          }
          setAssignDirectory(data.map((row) => mapApiDeveloperToProfile(row as ApiDeveloperPayload)));
        })
        .catch(() => {
          setAssignDirectoryError('fail');
          setAssignDirectory([]);
        })
        .finally(() => setAssignDirectoryLoad('done'));
    });
  }, []);

  useEffect(() => {
    if (contactsLoad !== 'done') return;
    const maxTs = Math.max(
      0,
      ...contacts.map((c) => (Number.isFinite(c.createdAtMs) ? c.createdAtMs : 0)),
    );
    setAdminCompaniesSeenMax(maxTs);
  }, [contactsLoad, contacts]);

  useEffect(() => {
    queueMicrotask(() => {
      const base = import.meta.env.VITE_API_BASE_URL;
      if (typeof base !== 'string' || !base.trim()) {
        setContacts(buildDemoContacts());
        setCompanyAccessById({});
        setContactsSource('demo');
        setContactsError('no-config');
        setContactsLoad('done');
        return;
      }
      const baseUrl = base.replace(/\/$/, '');
      const url = `${baseUrl}/contact/company-submissions`;
      const accessUrl = `${baseUrl}/contact/company-submissions/access-status`;
      setContactsLoad('loading');
      setContactsError('none');
      void Promise.all([
        fetch(url).then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<unknown>;
        }),
        fetch(accessUrl).then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<
            Array<{ companySubmissionId: string; accessEnabled: boolean }>
          >;
        }),
      ])
        .then(([data, accessRows]) => {
          if (!Array.isArray(data)) {
            setContacts([]);
            setContactsSource('api');
            return;
          }
          const mapped = data.map((row) => mapApiCompanySubmission(row as ApiCompanySubmissionRow));
          setContacts(mapped);
          const byId: Record<string, boolean> = {};
          for (const row of accessRows) {
            if (row && typeof row.companySubmissionId === 'string') {
              byId[row.companySubmissionId] = !!row.accessEnabled;
            }
          }
          setCompanyAccessById(byId);
          setContactsSource('api');
        })
        .catch(() => {
          setContactsError('fail');
          setContacts([]);
          setCompanyAccessById({});
          setContactsSource('api');
        })
        .finally(() => setContactsLoad('done'));
    });
  }, []);

  const now = useMemo(() => new Date(), []);

  const asuntoOptions = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.servicio))).sort((a, b) => a.localeCompare(b)),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    const filtered = contacts.filter((c) => {
      const estado = getCompanyLeadStatus(leadStatusOverrides, c.id);
      return (
        matchesTimeFilter(c.fechaSolicitud, timeFilter, now) &&
        matchesCompanySearch(searchTerm, c) &&
        (asuntoFilter === '' || c.servicio === asuntoFilter) &&
        (estadoFilterSelection.length === 0 || estadoFilterSelection.includes(estado))
      );
    });
    return [...filtered].sort((a, b) => {
      const ta = a.createdAtMs;
      const tb = b.createdAtMs;
      if (ta === tb) return 0;
      return fechaOrden === 'oldest' ? ta - tb : tb - ta;
    });
  }, [contacts, timeFilter, now, searchTerm, fechaOrden, asuntoFilter, estadoFilterSelection, leadStatusOverrides]);

  const paginatedContacts = useMemo(
    () => slicePage(filteredContacts, companyPage, ADMIN_PAGE_SIZE),
    [filteredContacts, companyPage],
  );

  useEffect(() => {
    queueMicrotask(() => setCompanyPage(1));
  }, [searchTerm, timeFilter, fechaOrden, asuntoFilter, estadoFilterSelection]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredContacts.length / ADMIN_PAGE_SIZE));
    queueMicrotask(() => setCompanyPage((p) => Math.min(p, tp)));
  }, [filteredContacts.length]);

  const toggleEstadoFilter = (s: CompanyLeadStatus) => {
    setEstadoFilterSelection((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const updateLeadStatus = (id: string, next: CompanyLeadStatus) => {
    setLeadStatusOverrides((prev) => {
      const merged = applyCompanyLeadStatusOverride(prev, id, next);
      saveCompanyLeadStatusOverrides(merged);
      return merged;
    });
    if (next !== 'en_curso') {
      void removeAssignedProjectByContactId(id);
    }
  };

  const clearFilters = () => {
    setTimeFilter('todos');
    setSearchTerm('');
    setFechaOrden('newest');
    setAsuntoFilter('');
    setEstadoFilterSelection([]);
  };

  const openDetail = (contact: CompanyContact) => {
    setSelected(contact);
    setFlowStep('detalle');
    setSeleccionProspectos({});
    setOpen(true);
    setCopied(false);
  };

  const openAssignLead = (contact: CompanyContact) => {
    setSelected(contact);
    setFlowStep('prospectos');
    setSeleccionProspectos({});
    setAssignDeveloperSearch('');
    setOpen(true);
    setCopied(false);
  };

  const copyLeadTableEmail = (email: string) => {
    void navigator.clipboard.writeText(email).then(() => {
      setCopiedLeadEmail(email);
      window.setTimeout(() => setCopiedLeadEmail(null), 1200);
    });
  };

  const idsProspectosSeleccionados = Object.entries(seleccionProspectos)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const assignableDevelopers = useMemo(
    () => assignDirectory.map(developerProfileToAssignableRow),
    [assignDirectory],
  );

  const assignableDevelopersFiltered = useMemo(
    () =>
      assignableDevelopers.filter((d) =>
        matchesAssignableDirectorySearch(assignDeveloperSearch, d),
      ),
    [assignableDevelopers, assignDeveloperSearch],
  );

  const prospectosElegidos: AdminProspecto[] = assignableDevelopers.filter(
    (p) => seleccionProspectos[p.id],
  );

  const confirmarAsignacion = () => {
    if (!selected || prospectosElegidos.length === 0) return;
    addAssignedProject({
      contactId: selected.id,
      titulo: `${selected.servicio} — ${selected.empresa}`,
      empresa: selected.empresa,
      contactoNombre: selected.nombre,
      servicio: selected.servicio,
      descripcion: selected.mensaje.trim() || 'Sin descripción proporcionada por el cliente.',
      prospectos: prospectosElegidos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        rol: p.rol,
        correo: p.correo,
      })),
    });
    persistCompanyLeadStatus(selected.id, 'en_curso');
    setFlowStep('exito');
  };

  const copyEmail = (email: string) => {
    void navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const copyGeneratedPassword = (password: string) => {
    void navigator.clipboard.writeText(password).then(() => {
      setCopiedGeneratedPassword(true);
      window.setTimeout(() => setCopiedGeneratedPassword(false), 1400);
    });
  };

  const runCompanyAccessAction = (
    contact: CompanyContact,
    action: 'enable-access' | 'reset-password' | 'disable-access',
  ) => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (typeof base !== 'string' || !base.trim()) {
      setCompanyAccessError('Configura VITE_API_BASE_URL para gestionar accesos.');
      return;
    }
    const id = contact.id;
    setCompanyAccessError(null);
    setCompanyAccessBusyById((prev) => ({ ...prev, [id]: true }));
    const url = `${base.replace(/\/$/, '')}/contact/company-submissions/${id}/${action}`;
    void fetch(url, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{
          companySubmissionId: string;
          email: string;
          password?: string;
          accessEnabled: boolean;
        }>;
      })
      .then((payload) => {
        setCompanyAccessById((prev) => ({
          ...prev,
          [payload.companySubmissionId]: payload.accessEnabled,
        }));
        if (payload.password) {
          setCopiedGeneratedPassword(false);
          setCompanyAccessDialog({
            open: true,
            title: action === 'enable-access' ? 'Acceso de compañía habilitado' : 'Contraseña regenerada',
            email: payload.email,
            password: payload.password,
          });
        }
      })
      .catch(() => {
        setCompanyAccessError('No se pudo completar la acción de acceso de compañía.');
      })
      .finally(() => {
        setCompanyAccessBusyById((prev) => ({ ...prev, [id]: false }));
      });
  };

  return (
    <AppShell
      pathWithoutLang={`${portalBase}/company`}
      title={t('sidebarDemo.navCompanies')}
      description={t('seo.appAdminCompanies')}
    >
      <section className="min-w-0 scroll-mt-24">
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Compañías</h2>
        {contactsLoad === 'loading' ? (
          <p className="mb-4 text-sm text-muted-foreground">Cargando solicitudes…</p>
        ) : null}
        {contactsError === 'no-config' ? (
          <p className="mb-4 text-sm text-amber-800 dark:text-amber-300/95">
            Sin{' '}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-950/80 dark:text-amber-200">
              VITE_API_BASE_URL
            </code>{' '}
            se muestran datos de demostración. Con la API configurada verás aquí los envíos del formulario
            de contacto.
          </p>
        ) : null}
        {contactsError === 'fail' ? (
          <p className="mb-4 text-sm text-red-700 dark:text-red-400">
            No se pudo cargar el listado desde la API. Revisa la red o el servidor.
          </p>
        ) : null}
        {companyAccessError ? (
          <p className="mb-4 text-sm text-red-700 dark:text-red-400">{companyAccessError}</p>
        ) : null}
        {contactsSource === 'api' && contactsLoad === 'done' && contactsError === 'none' ? (
          <p className="mb-4 text-sm text-emerald-800 dark:text-emerald-400/90">
            {contacts.length === 0
              ? 'Aún no hay solicitudes desde el formulario de contacto.'
              : `${contacts.length} solicitud(es) desde el formulario de contacto.`}
          </p>
        ) : null}

        <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-semibold tracking-wide text-zinc-700 uppercase dark:bg-zinc-800/80 dark:text-zinc-300">
              <Filter className="size-3.5" aria-hidden />
              Filtros rápidos
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:focus-visible:ring-zinc-500/30"
                aria-label="Periodo"
              >
                <option value="todos">Periodo: todos</option>
                <option value="hoy">Periodo: hoy</option>
                <option value="semana">Periodo: esta semana</option>
                <option value="mes">Periodo: este mes</option>
              </select>
              <select
                value={asuntoFilter}
                onChange={(e) => setAsuntoFilter(e.target.value)}
                className="h-9 w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:focus-visible:ring-zinc-500/30 sm:min-w-[12rem] sm:max-w-[280px]"
                aria-label="Filtrar por asunto"
              >
                <option value="">Asunto: todos</option>
                {asuntoOptions.map((asunto) => (
                  <option key={asunto} value={asunto}>
                    {asunto}
                  </option>
                ))}
              </select>
              <select
                value={fechaOrden}
                onChange={(e) => setFechaOrden(e.target.value as 'newest' | 'oldest')}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:focus-visible:ring-zinc-500/30"
                aria-label="Orden por fecha"
              >
                <option value="newest">Más nuevos primero</option>
                <option value="oldest">Más viejos primero</option>
              </select>
              <div className="relative w-full min-w-0 max-w-md flex-1 sm:min-w-[12rem]">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, empresa, correo o asunto…"
                  aria-label="Buscar por nombre, empresa, correo o asunto"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>
              <Button variant="ghost" size="sm" type="button" className="shrink-0" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
            <div className="flex w-full flex-col gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800 lg:pl-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[11px] font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
                  Filtrar por estado
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                  Pulsa uno o varios. Sin ninguno activo se muestran todos.
                </span>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado del lead">
                {COMPANY_LEAD_STATUSES.map((s) => {
                  const on = estadoFilterSelection.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleEstadoFilter(s)}
                      aria-pressed={on}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/30 dark:focus-visible:ring-zinc-500/40',
                        on
                          ? cn(
                              COMPANY_LEAD_STATUS_BADGE_CLASS[s],
                              'ring-2 ring-zinc-400/80 ring-offset-1 dark:ring-zinc-500 dark:ring-offset-zinc-950',
                            )
                          : 'border border-dashed border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800',
                      )}
                    >
                      {COMPANY_LEAD_STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60 dark:shadow-none">
          <div className="overflow-x-auto xl:overflow-x-visible">
            <table className="w-full min-w-0 table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[24%]" />
              </colgroup>
            <thead className="bg-zinc-50/70 text-xs tracking-wide text-zinc-600 uppercase dark:bg-zinc-800/95 dark:text-zinc-400">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Nombre</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Contacto</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Empresa</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Asunto</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Estado</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Mensaje</th>
                <th className="px-3 py-2.5 text-left font-semibold xl:px-5 xl:py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map((contact) => {
                const leadEstado = getCompanyLeadStatus(leadStatusOverrides, contact.id);
                return (
                <tr key={contact.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 items-center gap-2 xl:gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-[#17304b] xl:size-10 xl:text-sm dark:bg-indigo-950/70 dark:text-indigo-200">
                        {leadInitials(contact.nombre)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{contact.nombre}</p>
                        <span className="mt-1 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {contact.fechaSolicitud}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 items-center gap-1">
                      <p className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-300" title={contact.correo}>
                        {contact.correo}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => copyLeadTableEmail(contact.correo)}
                        title="Copiar correo"
                        aria-label={`Copiar correo de ${contact.nombre}`}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                    {copiedLeadEmail === contact.correo ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Correo copiado</p>
                    ) : null}
                    <p className="text-zinc-700 dark:text-zinc-400">{contact.telefono}</p>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={contact.empresa}>
                      {contact.empresa}
                    </p>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <span className="inline-block max-w-full truncate rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-1 dark:ring-indigo-800/50">
                      {contact.servicio}
                    </span>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'size-2.5 shrink-0 rounded-full',
                          COMPANY_LEAD_STATUS_DOT_CLASS[leadEstado],
                        )}
                        title={COMPANY_LEAD_STATUS_LABELS[leadEstado]}
                        aria-hidden
                      />
                      <select
                        value={leadEstado}
                        onChange={(e) =>
                          updateLeadStatus(contact.id, e.target.value as CompanyLeadStatus)
                        }
                        className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-500/30"
                        aria-label={`Estado de ${contact.nombre}`}
                      >
                        {COMPANY_LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {COMPANY_LEAD_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <p className="text-muted-foreground line-clamp-4 min-w-0 text-xs leading-relaxed">
                      {contact.mensaje.trim() !== '' ? (
                        contact.mensaje
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">(sin mensaje)</span>
                      )}
                    </p>
                  </td>
                  <td className="align-top min-w-0 px-3 py-3 xl:px-5 xl:py-4">
                    <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 xl:flex-nowrap xl:gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 gap-1 border-zinc-300 px-2 text-xs xl:h-9 xl:gap-1.5 xl:px-3 xl:text-sm dark:border-zinc-600 dark:bg-transparent dark:text-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => openDetail(contact)}
                      >
                        <Eye className="size-3.5 shrink-0 xl:size-4" />
                        Ver
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 shrink-0 gap-1 bg-[#0b2a55] px-2 text-xs hover:bg-[#0a2347] xl:h-9 xl:gap-1.5 xl:px-3 xl:text-sm dark:bg-sky-900/80 dark:hover:bg-sky-900"
                        onClick={() => openAssignLead(contact)}
                      >
                        <UserPlus className="size-3.5 shrink-0 xl:size-4" />
                        Asignar
                      </Button>
                      <span
                        className={cn(
                          'inline-flex size-7 shrink-0 items-center justify-center rounded-full',
                          companyAccessById[contact.id]
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-800/40'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
                        )}
                        title={
                          companyAccessById[contact.id] ? 'Acceso habilitado' : 'Sin acceso'
                        }
                        aria-label={
                          companyAccessById[contact.id] ? 'Acceso habilitado' : 'Sin acceso'
                        }
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
                            disabled={companyAccessBusyById[contact.id] === true}
                            aria-label={`Acceso para ${contact.nombre}`}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {companyAccessById[contact.id] ? (
                            <>
                              <DropdownMenuItem
                                onSelect={(event) => {
                                  event.preventDefault();
                                  runCompanyAccessAction(contact, 'reset-password');
                                }}
                              >
                                <KeyRound className="size-4" />
                                Regenerar contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={(event) => {
                                  event.preventDefault();
                                  runCompanyAccessAction(contact, 'disable-access');
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
                                runCompanyAccessAction(contact, 'enable-access');
                              }}
                            >
                              <UserCheck className="size-4" />
                              Habilitar acceso
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
              })}
              {filteredContacts.length === 0 && contactsLoad === 'done' ? (
                <tr className="border-t border-zinc-100 dark:border-zinc-800">
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground xl:px-5">
                    {contacts.length === 0
                      ? 'No hay contactos para mostrar.'
                      : 'No hay contactos con los filtros u orden seleccionados.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          </div>
          <AdminTablePagination
            page={companyPage}
            totalItems={filteredContacts.length}
            pageSize={ADMIN_PAGE_SIZE}
            onPageChange={setCompanyPage}
            nounPlural="leads"
          />
        </div>
      </section>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSelected(null);
            setFlowStep('detalle');
            setSeleccionProspectos({});
            setAssignDeveloperSearch('');
          }
        }}
      >
        <DialogContent
          className={cn(
            'max-h-[90vh] overflow-y-auto',
            flowStep === 'confirmacion' ? 'sm:max-w-md' : 'sm:max-w-lg',
          )}
          showCloseButton
        >
          {selected && flowStep === 'detalle' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selected.nombre}</DialogTitle>
                <DialogDescription>{selected.empresa}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div className="rounded-lg border border-border p-4">
                  <Label htmlFor="lead-estado-detalle" className="text-xs uppercase tracking-wide text-muted-foreground">
                    Estado del lead
                  </Label>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2.5 shrink-0 rounded-full',
                        COMPANY_LEAD_STATUS_DOT_CLASS[
                          getCompanyLeadStatus(leadStatusOverrides, selected.id)
                        ],
                      )}
                      aria-hidden
                    />
                    <select
                      id="lead-estado-detalle"
                      value={getCompanyLeadStatus(leadStatusOverrides, selected.id)}
                      onChange={(e) =>
                        updateLeadStatus(selected.id, e.target.value as CompanyLeadStatus)
                      }
                      className="flex h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-500/30"
                    >
                      {COMPANY_LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {COMPANY_LEAD_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Asunto
                  </p>
                  <p className="mt-1 font-medium text-foreground">{selected.servicio}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Correo</p>
                      <p className="break-all text-sm font-medium">{selected.correo}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 h-8"
                        onClick={() => copyEmail(selected.correo)}
                      >
                        <Copy className="size-3.5" />
                        {copied ? 'Copiado' : 'Copiar correo'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Telefono</p>
                      <p className="text-sm font-medium">{selected.telefono}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa</p>
                    <p className="text-sm font-medium">{selected.empresa}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Fecha de recepción</p>
                  <p className="text-sm font-medium">{selected.fechaSolicitud}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Mensaje (formulario)</p>
                  <p className="mt-2 rounded-md bg-muted/80 px-3 py-2.5 text-sm leading-relaxed text-foreground">
                    {selected.mensaje.trim() !== '' ? (
                      selected.mensaje
                    ) : (
                      <span className="text-muted-foreground">(sin mensaje enviado)</span>
                    )}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  className="w-full bg-[#0b2a55] hover:bg-[#0a2347] dark:bg-sky-900/90 dark:hover:bg-sky-900 sm:w-auto"
                  onClick={() => {
                    setAssignDeveloperSearch('');
                    setFlowStep('prospectos');
                  }}
                >
                  <UserPlus className="size-4" />
                  Asignar proyecto
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {selected && flowStep === 'prospectos' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Seleccionar desarrolladores</DialogTitle>
                <DialogDescription>
                  {selected.empresa} — misma lista que en Desarrolladores (postulaciones con API; demo
                  si no hay URL).
                </DialogDescription>
              </DialogHeader>

              {assignDirectoryLoad === 'loading' ? (
                <p className="text-sm text-muted-foreground">Cargando directorio…</p>
              ) : null}
              {assignDirectoryError === 'no-config' ? (
                <p className="text-xs text-amber-800 dark:text-amber-300/95">
                  Sin API: se usan desarrolladores de demostración para asignar.
                </p>
              ) : null}
              {assignDirectoryError === 'fail' ? (
                <p className="text-xs text-red-700 dark:text-red-400">
                  No se pudo cargar el directorio. Revisa la API o vuelve a intentar.
                </p>
              ) : null}

              {assignDirectoryLoad === 'done' && assignableDevelopers.length > 0 ? (
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    value={assignDeveloperSearch}
                    onChange={(e) => setAssignDeveloperSearch(e.target.value)}
                    placeholder="Buscar por nombre, rol, correo, expertise…"
                    aria-label="Buscar desarrolladores para asignar"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                  />
                </div>
              ) : null}

              {assignDirectoryLoad === 'done' &&
              assignableDevelopers.length > 0 &&
              assignDeveloperSearch.trim() !== '' ? (
                <p className="text-xs text-muted-foreground">
                  Mostrando <strong>{assignableDevelopersFiltered.length}</strong> de{' '}
                  {assignableDevelopers.length}
                </p>
              ) : null}

              <div className="space-y-3">
                {assignableDevelopers.length === 0 && assignDirectoryLoad === 'done' ? (
                  <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                    No hay desarrolladores en el directorio. Revisa la sección Desarrolladores del
                    admin.
                  </p>
                ) : null}
                {assignableDevelopers.length > 0 &&
                assignableDevelopersFiltered.length === 0 &&
                assignDirectoryLoad === 'done' ? (
                  <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                    Ningún desarrollador coincide con la búsqueda. Prueba con otras palabras.
                  </p>
                ) : null}
                {assignableDevelopersFiltered.map((dev) => (
                  <div
                    key={dev.id}
                    className="flex items-start gap-3 rounded-md border border-border bg-background p-3"
                  >
                    <Checkbox
                      id={`pro-${dev.id}`}
                      checked={Boolean(seleccionProspectos[dev.id])}
                      onCheckedChange={(v) =>
                        setSeleccionProspectos((prev) => ({ ...prev, [dev.id]: v === true }))
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <Label htmlFor={`pro-${dev.id}`} className="cursor-pointer font-medium">
                        {dev.nombre}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {dev.rol} · {dev.expertis}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Disponibilidad: {dev.disponibilidad}
                      </p>
                      <p className="text-xs text-muted-foreground">{dev.correo}</p>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAssignDeveloperSearch('');
                    setFlowStep('detalle');
                  }}
                >
                  Volver
                </Button>
                <Button
                  type="button"
                  className="bg-[#0b2a55] hover:bg-[#0a2347] dark:bg-sky-900/90 dark:hover:bg-sky-900"
                  disabled={idsProspectosSeleccionados.length === 0}
                  onClick={() => setFlowStep('confirmacion')}
                >
                  Continuar a confirmacion
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {selected && flowStep === 'confirmacion' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Confirmar asignacion</DialogTitle>
                <DialogDescription>
                  Revisa los datos antes de crear el proyecto en el panel.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                <p>
                  <span className="text-muted-foreground">Proyecto: </span>
                  <span className="font-medium">{selected.servicio}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Empresa: </span>
                  <span className="font-medium">{selected.empresa}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Contacto: </span>
                  <span className="font-medium">{selected.nombre}</span>
                </p>
                <div>
                  <p className="text-muted-foreground">Prospectos asignados:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {prospectosElegidos.map((p) => (
                      <li key={p.id}>
                        {p.nombre} ({p.rol})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setFlowStep('prospectos')}>
                  Volver
                </Button>
                <Button
                  type="button"
                  className="bg-[#0b2a55] hover:bg-[#0a2347] dark:bg-sky-900/90 dark:hover:bg-sky-900"
                  onClick={confirmarAsignacion}
                >
                  Confirmar y crear proyecto
                </Button>
              </DialogFooter>
            </>
          ) : null}

          {selected && flowStep === 'exito' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Listo</DialogTitle>
                <DialogDescription>
                  El proyecto se ha guardado. Lo veras en la seccion Proyectos del menu lateral.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <p className="font-medium">{selected.servicio}</p>
                <p className="mt-1 text-emerald-800/90 dark:text-emerald-300/90">
                  {prospectosElegidos.length} prospecto(s) vinculado(s).
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="w-full bg-[#0b2a55] hover:bg-[#0a2347] dark:bg-sky-900/90 dark:hover:bg-sky-900 sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={companyAccessDialog.open}
        onOpenChange={(open) => {
          if (!open) setCopiedGeneratedPassword(false);
          setCompanyAccessDialog((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{companyAccessDialog.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-zinc-700 dark:text-zinc-300">
              Comparte estas credenciales con la compañía. La contraseña se muestra solo una vez.
            </p>
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Correo
              </p>
              <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                {companyAccessDialog.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                Contraseña
              </p>
              <p className="mt-1 rounded border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                {companyAccessDialog.password}
              </p>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => copyGeneratedPassword(companyAccessDialog.password)}
            >
              {copiedGeneratedPassword ? 'Contraseña copiada' : 'Copiar contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
