import { useEffect, useMemo, useState } from 'react';
import {
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Heart,
  Key,
  KeyRound,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  Search,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAdminAssignedProjects } from '@/contexts/AdminAssignedProjectsContext';
import { AdminSelect, type AdminSelectOption } from '@/components/app/AdminSelect';
import { AdminTablePagination } from '@/components/app/AdminTablePagination';
import { CompanyLeadCard } from '@/components/admin/CompanyLeadCard';
import {
  CompanyLeadDetailPanel,
  type CompanyLeadDetailTab,
} from '@/components/admin/CompanyLeadDetailPanel';
import { ImportWorkflowLeadsDialog } from '@/components/admin/ImportWorkflowLeadsDialog';
import { ExportPipedriveDialog } from '@/components/admin/ExportPipedriveDialog';
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
  createCompanySubmission,
  mapApiCompanySubmission,
  type ApiCompanySubmissionRow,
  type CompanyContact,
} from '@/lib/companyAdminContact';
import {
  fetchCompanyLeadStatuses,
  createCompanyLeadUpdateApi,
  patchCompanyLeadStatusApi,
  toggleFavoriteApi,
  fetchFavoriteIds,
} from '@/lib/adminWorkspaceApi';
import {
  COMPANY_LEAD_STATUSES,
  COMPANY_LEAD_STATUS_DOT_CLASS,
  COMPANY_LEAD_STATUS_LABELS,
  applyCompanyLeadStatusOverride,
  dispatchLeadStatusChanged,
  getCompanyLeadStatus,
  LEAD_STATUS_CHANGED_EVENT,
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
import { persistAdminCompaniesSeenMax } from '@/lib/userPreferencesSync';
import {
  chatWidgetDetailForAdmin,
  getChatWidgetBudgetQualification,
} from '@/lib/chatWidgetLead';
import { toggleLeadFavoriteId } from '@/lib/companyLeadFavorites';
import {
  appendCompanyLeadUpdate,
  dispatchCompanyLeadUpdatesChange,
  formatCompanyLeadUpdateWhen,
  getNextReminderCode,
  loadCompanyLeadUpdates,
  type CompanyLeadUpdate,
} from '@/lib/companyLeadUpdates';
import { consumeOpenCompanyLeadRequest } from '@/lib/companyLeadDeepLink';
import { ADMIN_FAVORITES_TOOLBAR_BUTTON_ACTIVE, ADMIN_FAVORITES_TOOLBAR_BUTTON_INACTIVE, ADMIN_FILTER_PILL_CLASS, ADMIN_FILTER_VIEW_TOGGLE_CLASS, ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
  ADMIN_ROW_ACTION_ICON_MUTED_CLASS,
  ADMIN_TABLE_ACTIONS_TH_CLASS,
  adminRowActionHeartIconClass,
} from '@/lib/adminTableActionsUi';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { adminAuthorizedFetch } from '@/lib/adminAuth';
import { cn } from '@/lib/utils';

type TimeFilter = 'todos' | 'hoy' | 'semana' | 'mes';

type FlowStep = 'detalle' | 'prospectos' | 'confirmacion' | 'exito';

type ViewMode = 'table' | 'cards';

const PERIODO_FILTER_OPTIONS: AdminSelectOption[] = [
  { value: 'todos', label: 'Periodo: todos' },
  { value: 'hoy', label: 'Periodo: hoy' },
  { value: 'semana', label: 'Periodo: esta semana' },
  { value: 'mes', label: 'Periodo: este mes' },
];

const CARD_PAGE_SIZE = 12;

const LEAD_QUALITY_OPTIONS: AdminSelectOption[] = [
  { value: 'todos', label: 'Leads: todos' },
  { value: 'calificados', label: 'Leads: calificados' },
  { value: 'no_calificados', label: 'Leads: no calificados' },
];

const FECHA_ORDEN_OPTIONS: AdminSelectOption[] = [
  { value: 'newest', label: 'Más nuevos primero' },
  { value: 'oldest', label: 'Más viejos primero' },
];

const LEAD_STATUS_TABLE_OPTIONS: AdminSelectOption[] = COMPANY_LEAD_STATUSES.map((s) => ({
  value: s,
  label: COMPANY_LEAD_STATUS_LABELS[s],
}));

const ESTADO_FILTER_OPTIONS: AdminSelectOption[] = [
  { value: '', label: 'Estado: todos' },
  ...COMPANY_LEAD_STATUSES.map((s) => ({
    value: s,
    label: `Estado: ${COMPANY_LEAD_STATUS_LABELS[s]}`,
  })),
];

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
  const { addAssignedProject, removeAssignedProjectByContactId, assignedProjects } =
    useAdminAssignedProjects();
  const [selected, setSelected] = useState<CompanyContact | null>(null);
  const [open, setOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('detalle');
  const [seleccionProspectos, setSeleccionProspectos] = useState<Record<string, boolean>>({});
  const [assignDeveloperSearch, setAssignDeveloperSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLeadEmail, setCopiedLeadEmail] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('todos');
  const [leadQualityFilter, setLeadQualityFilter] = useState<'todos' | 'calificados' | 'no_calificados'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaOrden, setFechaOrden] = useState<'newest' | 'oldest'>('newest');
  const [asuntoFilter, setAsuntoFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  const [estadoFilter, setEstadoFilter] = useState<'' | CompanyLeadStatus>('');
  const [leadFavoriteIds, setLeadFavoriteIds] = useState<Set<string>>(() => new Set());
  
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [companyPage, setCompanyPage] = useState(1);
  const [leadStatusOverrides, setLeadStatusOverrides] = useState<
    Record<string, CompanyLeadStatus>
  >({});
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [contactsLoad, setContactsLoad] = useState<'idle' | 'loading' | 'done'>('idle');
  const [contactsError, setContactsError] = useState<'none' | 'no-config' | 'fail'>('none');
  const [contactsRefreshKey, setContactsRefreshKey] = useState(0);
  const [importWorkflowsOpen, setImportWorkflowsOpen] = useState(false);
  const [exportPipedriveOpen, setExportPipedriveOpen] = useState(false);
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
  const [manualLeadForm, setManualLeadForm] = useState<{
    nombre: string;
    correo: string;
    empresa: string;
    telefono: string;
    servicio: string;
    mensaje: string;
  } | null>(null);
  const [manualLeadSaving, setManualLeadSaving] = useState(false);
  const [manualLeadError, setManualLeadError] = useState<string | null>(null);
  const [leadUpdatesById, setLeadUpdatesById] = useState<Record<string, CompanyLeadUpdate[]>>(
    () => ({}),
  );
  const [leadUpdateDraft, setLeadUpdateDraft] = useState('');
  const [detailTab, setDetailTab] = useState<CompanyLeadDetailTab>('cuestionario');

  useEffect(() => {
    setLeadUpdateDraft('');
    setDetailTab('cuestionario');
  }, [selected?.id]);

  useEffect(() => {
    void (async () => {
      const [statuses, updates, favorites] = await Promise.all([
        fetchCompanyLeadStatuses(),
        loadCompanyLeadUpdates(),
        fetchFavoriteIds('company_lead'),
      ]);
      setLeadStatusOverrides(statuses);
      setLeadUpdatesById(updates);
      setLeadFavoriteIds(new Set(favorites));
    })();
  }, []);

  useEffect(() => {
    const onLeadStatusExternal = () => {
      void fetchCompanyLeadStatuses().then(setLeadStatusOverrides);
    };
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
      void adminAuthorizedFetch(url)
        .then((res) => {
          if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
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
    void persistAdminCompaniesSeenMax(maxTs);
  }, [contactsLoad, contacts]);

  useEffect(() => {
    if (contactsLoad !== 'done') return;
    const req = consumeOpenCompanyLeadRequest();
    if (!req) return;
    const contact = contacts.find((c) => c.id === req.contactId);
    if (!contact) return;
    setSelected(contact);
    setFlowStep('detalle');
    setSeleccionProspectos({});
    setOpen(true);
    setCopied(false);
    if (req.tab) setDetailTab(req.tab);
  }, [contactsLoad, contacts]);

  useEffect(() => {
    queueMicrotask(() => {
      const base = import.meta.env.VITE_API_BASE_URL;
      if (typeof base !== 'string' || !base.trim()) {
        setContacts(buildDemoContacts());
        setCompanyAccessById({});
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
        adminAuthorizedFetch(url).then((res) => {
          if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
          return res.json() as Promise<unknown>;
        }),
        adminAuthorizedFetch(accessUrl).then((res) => {
          if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
          return res.json() as Promise<
            Array<{ companySubmissionId: string; accessEnabled: boolean }>
          >;
        }),
      ])
        .then(([data, accessRows]) => {
          if (!Array.isArray(data)) {
            setContacts([]);
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
        })
        .catch(() => {
          setContactsError('fail');
          setContacts([]);
          setCompanyAccessById({});
        })
        .finally(() => setContactsLoad('done'));
    });
  }, [contactsRefreshKey]);

  const now = useMemo(() => new Date(), []);

  const asuntoOptions = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.servicio))).sort((a, b) => a.localeCompare(b)),
    [contacts],
  );

  const asuntoSelectOptions = useMemo(
    (): AdminSelectOption[] => [
      { value: '', label: 'Asunto: todos' },
      ...asuntoOptions.map((a) => ({ value: a, label: `Asunto: ${a}` })),
    ],
    [asuntoOptions],
  );

  const filteredContacts = useMemo(() => {
    const filtered = contacts.filter((c) => {
      const estado = getCompanyLeadStatus(leadStatusOverrides, c.id);
      const budgetQ = getChatWidgetBudgetQualification(c.mensaje);
      const matchesQuality =
        leadQualityFilter === 'todos'
          ? true
          : leadQualityFilter === 'calificados'
            ? budgetQ !== 'unqualified'
            : budgetQ === 'unqualified';
      return (
        matchesTimeFilter(c.fechaSolicitud, timeFilter, now) &&
        matchesCompanySearch(searchTerm, c) &&
        matchesQuality &&
        (asuntoFilter === '' || c.servicio === asuntoFilter) &&
        (estadoFilter === '' || estado === estadoFilter) &&
        (!favoritesOnly || leadFavoriteIds.has(c.id))
      );
    });
    return [...filtered].sort((a, b) => {
      const ta = a.createdAtMs;
      const tb = b.createdAtMs;
      if (ta === tb) return 0;
      return fechaOrden === 'oldest' ? ta - tb : tb - ta;
    });
  }, [
    contacts,
    timeFilter,
    leadQualityFilter,
    now,
    searchTerm,
    fechaOrden,
    asuntoFilter,
    estadoFilter,
    leadStatusOverrides,
    favoritesOnly,
    leadFavoriteIds,
  ]);

  const paginatedContacts = useMemo(
    () => {
      const pageSize = viewMode === 'cards' ? CARD_PAGE_SIZE : ADMIN_PAGE_SIZE;
      return slicePage(filteredContacts, companyPage, pageSize);
    },
    [filteredContacts, companyPage, viewMode],
  );

  useEffect(() => {
    queueMicrotask(() => setCompanyPage(1));
  }, [searchTerm, timeFilter, leadQualityFilter, fechaOrden, asuntoFilter, estadoFilter, favoritesOnly]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredContacts.length / ADMIN_PAGE_SIZE));
    queueMicrotask(() => setCompanyPage((p) => Math.min(p, tp)));
  }, [filteredContacts.length]);

  const toggleLeadFavorite = (id: string) => {
    setLeadFavoriteIds((prev) => toggleLeadFavoriteId(prev, id));
    void toggleFavoriteApi('company_lead', id).then((ids) => setLeadFavoriteIds(new Set(ids)));
  };

  const updateLeadStatus = (id: string, next: CompanyLeadStatus) => {
    setLeadStatusOverrides((prev) => applyCompanyLeadStatusOverride(prev, id, next));
    void patchCompanyLeadStatusApi(id, next).then(() => dispatchLeadStatusChanged());
    if (next !== 'en_curso') {
      void removeAssignedProjectByContactId(id);
    }
  };

  const clearFilters = () => {
    setTimeFilter('todos');
    setLeadQualityFilter('todos');
    setSearchTerm('');
    setFechaOrden('newest');
    setAsuntoFilter('');
    setEstadoFilter('');
    setFavoritesOnly(false);
  };

  const openDetail = (contact: CompanyContact, opts?: { tab?: CompanyLeadDetailTab }) => {
    setSelected(contact);
    setFlowStep('detalle');
    setSeleccionProspectos({});
    setOpen(true);
    setCopied(false);
    setDetailTab(opts?.tab ?? 'cuestionario');
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
    void patchCompanyLeadStatusApi(selected.id, 'en_curso').then(() => {
      setLeadStatusOverrides((prev) =>
        applyCompanyLeadStatusOverride(prev, selected.id, 'en_curso'),
      );
      dispatchLeadStatusChanged();
    });
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

  const addManualLead = () => {
    if (!manualLeadForm || manualLeadSaving) return;
    const { nombre, correo, empresa, telefono, servicio, mensaje } = manualLeadForm;
    if (!nombre.trim() || !correo.trim()) return;

    setManualLeadSaving(true);
    setManualLeadError(null);
    void createCompanySubmission({
      nombre,
      correo,
      empresa,
      telefono,
      servicio,
      mensaje,
    })
      .then((result) => {
        if (!result.ok) {
          if (result.reason === 'no-config') {
            setManualLeadError(
              'Configura VITE_API_BASE_URL para guardar leads en la base de datos.',
            );
            return;
          }
          setManualLeadError(
            result.detail ?? 'No se pudo guardar el lead. Revisa la red o el servidor.',
          );
          return;
        }
        setContacts((prev) => [result.contact, ...prev]);
        setManualLeadForm(null);
      })
      .finally(() => setManualLeadSaving(false));
  };

  const addLeadUpdate = () => {
    if (!selected) return;
    const body = leadUpdateDraft.trim();
    if (!body) return;
    void createCompanyLeadUpdateApi(selected.id, { body, kind: 'note' }).then((created) => {
      if (!created) return;
      setLeadUpdatesById((prev) => appendCompanyLeadUpdate(prev, selected.id, created));
      dispatchCompanyLeadUpdatesChange();
      setLeadUpdateDraft('');
      setDetailTab('actividad');
    });
  };

  const addLeadReminder = (scheduledAtMs: number, note?: string) => {
    if (!selected) return;
    const list = leadUpdatesById[selected.id] ?? [];
    const reminderCode = getNextReminderCode(list);
    const scheduledLabel = formatCompanyLeadUpdateWhen(scheduledAtMs);
    const trimmedNote = note?.trim();
    const body = trimmedNote || `Seguimiento ${reminderCode} agendado para ${scheduledLabel}`;
    void createCompanyLeadUpdateApi(selected.id, {
      body,
      kind: 'reminder',
      scheduledAtMs,
      contactName: selected.nombre,
      contactEmail: selected.correo,
    }).then((created) => {
      if (!created) return;
      setLeadUpdatesById((prev) => appendCompanyLeadUpdate(prev, selected.id, created));
      dispatchCompanyLeadUpdatesChange();
      setDetailTab('actividad');
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
    void adminAuthorizedFetch(url, { method: 'POST' })
      .then((res) => {
        if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
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

  const leadDetailWidget = useMemo(
    () =>
      selected
        ? chatWidgetDetailForAdmin(selected)
        : { isWidget: false as const, rows: [] as { label: string; value: string }[] },
    [selected],
  );

  const selectedLeadUpdates = useMemo(
    () => (selected ? (leadUpdatesById[selected.id] ?? []) : []),
    [selected, leadUpdatesById],
  );

  const selectedAssignedMemberCount = useMemo(() => {
    if (!selected) return 0;
    const project = assignedProjects.find((p) => p.contactId === selected.id);
    return project?.prospectos.length ?? 0;
  }, [assignedProjects, selected]);

  return (
    <AppShell
      pathWithoutLang={`${portalBase}/company`}
      title={t('sidebarDemo.navCompanies')}
      description={t('seo.appAdminCompanies')}
      contentOverflow="hidden"
    >
      <div className="flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden scroll-mt-24">
        
        <div className="min-h-0 shrink-0 space-y-2">
          {contactsLoad === 'loading' ? (
            <p className="text-sm text-muted-foreground">Cargando solicitudes…</p>
          ) : null}
          {contactsError === 'no-config' ? (
            <p className="text-sm text-amber-800 dark:text-amber-300/95">
              Sin{' '}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-950/80 dark:text-amber-200">
                VITE_API_BASE_URL
              </code>{' '}
              se muestran datos de demostración. Con la API configurada verás aquí los envíos del formulario
              de contacto.
            </p>
          ) : null}
          {contactsError === 'fail' ? (
            <p className="text-sm text-red-700 dark:text-red-400">
              No se pudo cargar el listado desde la API. Revisa la red o el servidor.
            </p>
          ) : null}
          {companyAccessError ? (
            <p className="text-sm text-red-700 dark:text-red-400">{companyAccessError}</p>
          ) : null}

        <div
          id="company-leads-filters-panel"
          className="rounded-xl border border-border/70 bg-card p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] dark:border-border/50 dark:bg-muted/25 dark:shadow-none sm:p-3.5"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
              <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
                <AdminSelect
                  value={timeFilter}
                  onValueChange={(v) => setTimeFilter(v as TimeFilter)}
                  options={PERIODO_FILTER_OPTIONS}
                  aria-label="Periodo"
                  triggerClassName={ADMIN_FILTER_PILL_CLASS}
                />
                <AdminSelect
                  value={asuntoFilter}
                  onValueChange={setAsuntoFilter}
                  options={asuntoSelectOptions}
                  aria-label="Filtrar por asunto"
                  triggerClassName={cn(ADMIN_FILTER_PILL_CLASS, 'min-w-[9.5rem] max-w-[15rem]')}
                />
                <AdminSelect
                  value={leadQualityFilter}
                  onValueChange={(v) =>
                    setLeadQualityFilter(v as 'todos' | 'calificados' | 'no_calificados')
                  }
                  options={LEAD_QUALITY_OPTIONS}
                  aria-label="Tipo de lead"
                  triggerClassName={ADMIN_FILTER_PILL_CLASS}
                />
                <AdminSelect
                  value={estadoFilter}
                  onValueChange={(v) => setEstadoFilter(v === '' ? '' : (v as CompanyLeadStatus))}
                  options={ESTADO_FILTER_OPTIONS}
                  aria-label="Filtrar por estado del lead"
                  triggerClassName={cn(ADMIN_FILTER_PILL_CLASS, 'min-w-[10rem] max-w-[16rem]')}
                />
                <AdminSelect
                  value={fechaOrden}
                  onValueChange={(v) => setFechaOrden(v as 'newest' | 'oldest')}
                  options={FECHA_ORDEN_OPTIONS}
                  aria-label="Orden por fecha"
                  triggerClassName={ADMIN_FILTER_PILL_CLASS}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={
                    favoritesOnly
                      ? ADMIN_FAVORITES_TOOLBAR_BUTTON_ACTIVE
                      : ADMIN_FAVORITES_TOOLBAR_BUTTON_INACTIVE
                  }
                  aria-pressed={favoritesOnly}
                  title={favoritesOnly ? 'Mostrar todos los leads' : 'Solo leads marcados como favoritos'}
                  onClick={() => setFavoritesOnly((v) => !v)}
                >
                  <Heart
                    className={cn(
                      'shrink-0',
                      favoritesOnly
                        ? 'size-4 fill-white text-white'
                        : 'size-3.5 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400',
                    )}
                    aria-hidden
                  />
                  <span className="text-[11px] font-semibold">Favoritos</span>
                </Button>
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className={ADMIN_FILTER_VIEW_TOGGLE_CLASS}>
                <Button
                  type="button"
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 shrink-0 rounded-lg p-0"
                  title="Vista de tabla"
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                >
                  <List className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 shrink-0 rounded-lg p-0"
                  title="Vista de cards"
                  onClick={() => setViewMode('cards')}
                  aria-pressed={viewMode === 'cards'}
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre, empresa, correo o asunto…"
                aria-label="Buscar por nombre, empresa, correo o asunto"
                className={cn(
                  'h-10 w-full rounded-xl border border-border/70 bg-muted/30 pr-3 pl-10 text-sm',
                  'text-foreground outline-none placeholder:text-muted-foreground',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  'dark:bg-muted/20',
                )}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-xl border-border/70 text-[11px] font-semibold"
                title={t('adminCompany.pipedriveExportButton')}
                disabled={filteredContacts.length === 0}
                onClick={() => setExportPipedriveOpen(true)}
              >
                <FileSpreadsheet className="size-3.5 shrink-0" aria-hidden />
                <span className="text-[11px] font-semibold">
                  {t('adminCompany.pipedriveExportButton')}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-xl border-border/70 text-[11px] font-semibold"
                title={t('adminCompany.importWorkflowsButton')}
                onClick={() => setImportWorkflowsOpen(true)}
              >
                <Download className="size-3.5 shrink-0" aria-hidden />
                <span className="text-[11px] font-semibold">{t('adminCompany.importWorkflowsButton')}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS}
                title="Agregar lead manualmente"
                onClick={() => {
                  setManualLeadError(null);
                  setManualLeadForm({
                    nombre: '',
                    correo: '',
                    empresa: '',
                    telefono: '',
                    servicio: '',
                    mensaje: '',
                  });
                }}
              >
                <UserPlus className="size-3.5 shrink-0" aria-hidden />
                <span className="text-[11px] font-semibold">Agregar Lead</span>
              </Button>
            </div>
          </div>
        </div>
        </div>

        
        <div className="isolate flex h-0 min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:border-border/50 dark:bg-muted/20 dark:shadow-none">
          <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="absolute inset-0 overflow-auto overscroll-contain rounded-t-lg">
            {viewMode === 'table' ? (
            <table className="w-full min-w-0 table-fixed border-collapse text-left text-[12px]">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[24%]" />
              </colgroup>
            <thead className="sticky top-0 z-10 border-b border-border/60 bg-muted text-[10px] tracking-[0.05em] text-muted-foreground uppercase dark:bg-muted">
              <tr>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Nombre</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Contacto</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Empresa</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Asunto</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Estado</th>
                <th className="px-2 py-1.5 text-left font-semibold xl:px-4 xl:py-2">Mensaje</th>
                <th className={ADMIN_TABLE_ACTIONS_TH_CLASS}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.map((contact) => {
                const leadEstado = getCompanyLeadStatus(leadStatusOverrides, contact.id);
                const budgetQ = getChatWidgetBudgetQualification(contact.mensaje);
                const isFavorite = leadFavoriteIds.has(contact.id);
                return (
                <tr
                  key={contact.id}
                  className="border-t border-border/55 transition-colors hover:bg-muted/35 dark:hover:bg-muted/20"
                >
                  <td
                    className="align-top min-w-0 py-2 pr-2 pl-2 xl:py-2.5 xl:pr-4 xl:pl-3"
                    title={
                      budgetQ === 'qualified'
                        ? 'Presupuesto: dentro del rango referido ($5k USD/mes o más)'
                        : budgetQ === 'unqualified'
                          ? 'Presupuesto: fuera del rango (No + monto mensual indicado)'
                          : undefined
                    }
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                    {budgetQ === 'qualified' || budgetQ === 'unqualified' ? (
                      <span
                        className={cn(
                          'h-10 w-1.5 shrink-0 self-center rounded-full sm:h-11',
                          'ring-1 ring-inset',
                          budgetQ === 'qualified'
                            ? 'bg-emerald-600 ring-white/25 dark:bg-emerald-400 dark:ring-white/15'
                            : 'bg-red-700 ring-white/25 dark:bg-red-600 dark:ring-white/15',
                        )}
                        aria-hidden
                      />
                    ) : null}
                    {budgetQ !== 'unknown' ? (
                      <span className="sr-only">
                        {budgetQ === 'qualified'
                          ? 'Lead calificado por presupuesto'
                          : 'Lead no calificado por presupuesto'}
                      </span>
                    ) : null}
                    <div className="flex min-w-0 flex-1 items-center gap-1.5 xl:gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-[11px] font-semibold text-[#17304b] xl:size-9 xl:text-xs dark:bg-indigo-950/70 dark:text-indigo-200">
                        {leadInitials(contact.nombre)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{contact.nombre}</p>
                      </div>
                    </div>
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
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
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-100" title={contact.empresa}>
                      {contact.empresa}
                    </p>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <span className="inline-block max-w-full truncate rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/55 dark:text-indigo-200 dark:ring-1 dark:ring-indigo-800/50">
                      {contact.servicio}
                    </span>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={cn(
                          'size-2.5 shrink-0 rounded-full',
                          COMPANY_LEAD_STATUS_DOT_CLASS[leadEstado],
                        )}
                        title={COMPANY_LEAD_STATUS_LABELS[leadEstado]}
                        aria-hidden
                      />
                      <AdminSelect
                        value={leadEstado}
                        onValueChange={(v) =>
                          updateLeadStatus(contact.id, v as CompanyLeadStatus)
                        }
                        options={LEAD_STATUS_TABLE_OPTIONS}
                        aria-label={`Estado de ${contact.nombre}`}
                        triggerClassName="h-8 min-w-0 flex-1 text-[11px]"
                        contentMatchTriggerWidth={false}
                        contentClassName="min-w-[12rem]"
                      />
                    </div>
                  </td>
                  <td className="align-top min-w-0 px-2 py-2 xl:px-4 xl:py-2.5">
                    <p className="text-muted-foreground line-clamp-3 min-w-0 text-[11px] leading-snug">
                      {contact.mensaje.trim() !== '' ? (
                        contact.mensaje
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-500">(sin mensaje)</span>
                      )}
                    </p>
                  </td>
                  <td className="align-middle px-2 py-2 text-center xl:px-4 xl:py-2.5">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        aria-pressed={isFavorite}
                        title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        onClick={() => toggleLeadFavorite(contact.id)}
                      >
                        <Heart
                          className={adminRowActionHeartIconClass(isFavorite)}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                        title="Ver detalle"
                        aria-label={`Ver detalle de ${contact.nombre}`}
                        onClick={() => openDetail(contact, { tab: 'actividad' })}
                      >
                        <Eye className="size-4" strokeWidth={1.5} aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                        title="Asignar a proyecto"
                        aria-label={`Asignar lead ${contact.nombre}`}
                        onClick={() => openAssignLead(contact)}
                      >
                        <UserPlus className="size-4" strokeWidth={1.5} aria-hidden />
                      </Button>
                      <span
                        className="inline-flex size-8 shrink-0 items-center justify-center"
                        title={
                          companyAccessById[contact.id] ? 'Acceso habilitado' : 'Sin acceso'
                        }
                        aria-label={
                          companyAccessById[contact.id] ? 'Acceso habilitado' : 'Sin acceso'
                        }
                      >
                        <Key
                          className={cn(
                            'size-4',
                            companyAccessById[contact.id]
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
                            disabled={companyAccessBusyById[contact.id] === true}
                            title="Más acciones de acceso"
                            aria-label={`Acceso para ${contact.nombre}`}
                          >
                            {companyAccessBusyById[contact.id] === true ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                              <MoreVertical className="size-4" strokeWidth={1.5} aria-hidden />
                            )}
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
                <tr className="border-t border-border/55">
                  <td colSpan={7} className="px-3 py-4 text-center text-muted-foreground xl:px-5">
                    {contacts.length === 0
                      ? 'No hay contactos para mostrar.'
                      : 'No hay contactos con los filtros u orden seleccionados.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
            ) : (
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedContacts.map((contact) => {
                const leadEstado = getCompanyLeadStatus(leadStatusOverrides, contact.id);
                const isFavorite = leadFavoriteIds.has(contact.id);
                return (
                  <CompanyLeadCard
                    key={contact.id}
                    lead={contact}
                    initials={leadInitials(contact.nombre)}
                    isFavorite={isFavorite}
                    onView={(lead) => openDetail(lead, { tab: 'actividad' })}
                    onToggleFavorite={toggleLeadFavorite}
                    onCopyEmail={copyLeadTableEmail}
                    onAssign={openAssignLead}
                    copiedEmail={copiedLeadEmail}
                    leadEstado={leadEstado}
                  />
                );
              })}
              {paginatedContacts.length === 0 && contactsLoad === 'done' ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {contacts.length === 0
                    ? 'No hay contactos para mostrar.'
                    : 'No hay contactos con los filtros u orden seleccionados.'}
                </div>
              ) : null}
            </div>
            )}
            </div>
          </div>
          <AdminTablePagination
            page={companyPage}
            totalItems={filteredContacts.length}
            pageSize={viewMode === 'cards' ? CARD_PAGE_SIZE : ADMIN_PAGE_SIZE}
            onPageChange={setCompanyPage}
            nounPlural="leads"
            className="shrink-0 gap-1 border-border/60 bg-muted/20 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-muted/10"
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
            setDetailTab('cuestionario');
          }
        }}
      >
        <DialogContent
          useAppDark
          showCloseButton
          className={cn(
            flowStep === 'detalle' &&
              'flex h-[min(760px,calc(100vh-2rem))] max-h-[min(760px,calc(100vh-2rem))] w-[min(1200px,calc(100vw-2rem))] min-h-0 flex-col gap-0 overflow-hidden !p-0 sm:!max-w-[min(1200px,calc(100vw-2rem))]',
            flowStep === 'prospectos' && 'max-h-[85vh] overflow-y-auto sm:max-w-lg',
            flowStep === 'confirmacion' && 'max-h-[85vh] overflow-y-auto sm:max-w-md',
            flowStep === 'exito' && 'max-h-[85vh] overflow-y-auto sm:max-w-lg',
          )}
        >
          {selected && flowStep === 'detalle' ? (
              <CompanyLeadDetailPanel
                contact={selected}
                leadEstado={getCompanyLeadStatus(leadStatusOverrides, selected.id)}
                leadDetailWidget={leadDetailWidget}
                detailTab={detailTab}
                onDetailTabChange={setDetailTab}
                updates={selectedLeadUpdates}
                updateDraft={leadUpdateDraft}
                onUpdateDraftChange={setLeadUpdateDraft}
                onAddUpdate={addLeadUpdate}
                onAddReminder={addLeadReminder}
                onStatusChange={(status) => updateLeadStatus(selected.id, status)}
                statusOptions={LEAD_STATUS_TABLE_OPTIONS}
                onCopyEmail={copyEmail}
                emailCopied={copied}
                assignedMemberCount={selectedAssignedMemberCount}
                onDiscard={() => updateLeadStatus(selected.id, 'descartado')}
                onAssignProject={() => {
                  setAssignDeveloperSearch('');
                  setFlowStep('prospectos');
                }}
                initials={leadInitials(selected.nombre)}
              />
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
                  className={ADMIN_PRIMARY_BTN_CLASS}
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
                  className={ADMIN_PRIMARY_BTN_CLASS}
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
                  className={cn(ADMIN_PRIMARY_BTN_CLASS, 'w-full sm:w-auto')}
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
        <DialogContent useAppDark className="max-w-md">
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

      <Dialog
        open={manualLeadForm !== null}
        onOpenChange={(next) => {
          if (!next) {
            setManualLeadForm(null);
            setManualLeadError(null);
            setManualLeadSaving(false);
          }
        }}
      >
        <DialogContent useAppDark className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Lead Manualmente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo lead de contacto.
            </DialogDescription>
          </DialogHeader>

          {manualLeadError ? (
            <p className="text-sm text-red-700 dark:text-red-400">{manualLeadError}</p>
          ) : null}

          {manualLeadForm && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-nombre" className="text-xs font-semibold">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <input
                  id="manual-nombre"
                  value={manualLeadForm.nombre}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>

              <div>
                <Label htmlFor="manual-correo" className="text-xs font-semibold">
                  Correo <span className="text-red-500">*</span>
                </Label>
                <input
                  id="manual-correo"
                  type="email"
                  value={manualLeadForm.correo}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, correo: e.target.value })}
                  placeholder="ej@empresa.com"
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>

              <div>
                <Label htmlFor="manual-empresa" className="text-xs font-semibold">
                  Empresa
                </Label>
                <input
                  id="manual-empresa"
                  value={manualLeadForm.empresa}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, empresa: e.target.value })}
                  placeholder="Ej: Acme Corp"
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>

              <div>
                <Label htmlFor="manual-telefono" className="text-xs font-semibold">
                  Teléfono
                </Label>
                <input
                  id="manual-telefono"
                  value={manualLeadForm.telefono}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, telefono: e.target.value })}
                  placeholder="555 123 4567"
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>

              <div>
                <Label htmlFor="manual-servicio" className="text-xs font-semibold">
                  Servicio / Asunto
                </Label>
                <input
                  id="manual-servicio"
                  value={manualLeadForm.servicio}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, servicio: e.target.value })}
                  placeholder="Ej: Custom Software Development"
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30"
                />
              </div>

              <div>
                <Label htmlFor="manual-mensaje" className="text-xs font-semibold">
                  Mensaje / Notas
                </Label>
                <textarea
                  id="manual-mensaje"
                  value={manualLeadForm.mensaje}
                  onChange={(e) => setManualLeadForm({ ...manualLeadForm, mensaje: e.target.value })}
                  placeholder="Detalles adicionales..."
                  rows={4}
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#17304b]/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-500/30 resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setManualLeadForm(null)}
              disabled={manualLeadSaving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={ADMIN_PRIMARY_BTN_CLASS}
              onClick={addManualLead}
              disabled={
                manualLeadSaving ||
                !manualLeadForm?.nombre.trim() ||
                !manualLeadForm?.correo.trim()
              }
            >
              {manualLeadSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Guardando…
                </>
              ) : (
                'Agregar Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportWorkflowLeadsDialog
        open={importWorkflowsOpen}
        onOpenChange={setImportWorkflowsOpen}
        onImported={() => {
          setContactsRefreshKey((k) => k + 1);
        }}
      />

      <ExportPipedriveDialog
        open={exportPipedriveOpen}
        onOpenChange={setExportPipedriveOpen}
        contacts={filteredContacts}
        updatesByContactId={leadUpdatesById}
      />
      </div>
    </AppShell>
  );
}
