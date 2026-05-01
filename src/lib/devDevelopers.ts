export type DeveloperProfile = {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  disponibilidad: string;
  /** ¿Actualmente trabaja? (formulario postulación). */
  currentlyEmployed: boolean;
  expertis: string[];
  rol: string;
  seniority: string;
  visaVigente: boolean;
  disponibilidadViajar: boolean;
  procedencia: string;
  cvFileName: string;
  /** Fila desde GET /users/developers (CV subido al API). */
  resumeUrl?: string | null;
  /** Clave estable para React (evita colisiones demo + API). */
  rowKey?: string;
  /** `createdAt` del API en ms (UTC); 0 si no viene fecha. */
  createdAtMs: number;
  /** Acceso a login de /app/dev habilitado por admin. */
  accessEnabled?: boolean;
};

/** Respuesta de adminvado GET /users/developers */
export type ApiDeveloperPayload = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  howTheyKnowVado: string;
  startVado: string;
  validVisa: boolean;
  availabilityToTravel: boolean;
  currentlyEmployed?: boolean;
  resumeURL: string | null;
  expertiseJson?: string | null;
  createdAt?: string;
  accessEnabled?: boolean;
};

export function parseExpertiseJsonField(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseCreatedAtMs(raw: string | undefined): number {
  if (raw == null || raw === '') return 0;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}

export function mapApiDeveloperToProfile(d: ApiDeveloperPayload): DeveloperProfile {
  const parts = d.fullName.trim().split(/\s+/).filter(Boolean);
  const nombre = parts[0] ?? '';
  const apellido = parts.length > 1 ? parts.slice(1).join(' ') : '—';
  const fromForm = parseExpertiseJsonField(d.expertiseJson ?? null);
  return {
    id: d.id,
    nombre,
    apellido,
    correo: d.email,
    telefono: d.phoneNumber,
    disponibilidad: d.startVado,
    currentlyEmployed: d.currentlyEmployed ?? false,
    expertis: fromForm,
    rol: d.role,
    seniority: 'Postulación',
    visaVigente: d.validVisa,
    disponibilidadViajar: d.availabilityToTravel,
    procedencia: d.howTheyKnowVado,
    cvFileName: 'cv.pdf',
    resumeUrl: d.resumeURL ?? null,
    rowKey: `api-${d.id}`,
    createdAtMs: parseCreatedAtMs(d.createdAt),
    accessEnabled: d.accessEnabled ?? false,
  };
}

export function developerInitials(d: DeveloperProfile): string {
  const n = d.nombre.trim();
  const a = d.apellido.trim();
  if (a && a !== '—') {
    return `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase();
  }
  return (n.slice(0, 2) || '??').toUpperCase();
}

/** Clave estable para asignar / listar (API o demo). */
export function getDeveloperDirectoryRowKey(d: DeveloperProfile): string {
  if (d.rowKey != null && String(d.rowKey).trim() !== '') return String(d.rowKey).trim();
  const base = d.correo.trim() || `${d.nombre}-${d.apellido}`.trim();
  return `demo-${base.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`;
}

/** Fila para el diálogo de asignación a leads (misma fuente que admin Desarrolladores). */
export function developerProfileToAssignableRow(d: DeveloperProfile): {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
  expertis: string;
  disponibilidad: string;
} {
  const nombre = [d.nombre, d.apellido].filter((x) => x && x !== '—').join(' ').trim() || d.nombre;
  return {
    id: getDeveloperDirectoryRowKey(d),
    nombre,
    rol: d.rol,
    correo: d.correo,
    expertis: d.expertis.length > 0 ? d.expertis.join(', ') : '—',
    disponibilidad: d.disponibilidad.trim() !== '' ? d.disponibilidad : '—',
  };
}

/** Datos de demostración solo para /app/dev (perfil); el admin lista solo la API. */
export const DEVELOPERS: DeveloperProfile[] = [
  {
    nombre: 'Ana',
    apellido: 'Torres',
    correo: 'ana.torres@atelier.com',
    rowKey: 'ana',
    telefono: '+52 55 1234 5678',
    disponibilidad: 'Inmediata',
    currentlyEmployed: true,
    expertis: ['React', 'Next.js', 'Tailwind'],
    rol: 'Frontend',
    seniority: 'Lead',
    visaVigente: true,
    disponibilidadViajar: true,
    procedencia: 'LinkedIn',
    cvFileName: 'cv-ana-torres.txt',
    createdAtMs: Date.parse('2024-06-01T12:00:00.000Z'),
  },
  {
    nombre: 'Carlos',
    apellido: 'Rivera',
    correo: 'c.rivera@atelier.com',
    rowKey: 'carlos',
    telefono: '+52 55 9876 5432',
    disponibilidad: '2 semanas',
    currentlyEmployed: true,
    expertis: ['Node.js', 'PostgreSQL'],
    rol: 'Backend',
    seniority: 'Senior',
    visaVigente: false,
    disponibilidadViajar: true,
    procedencia: 'Recomendacion',
    cvFileName: 'cv-carlos-rivera.txt',
    createdAtMs: Date.parse('2024-05-15T12:00:00.000Z'),
  },
  {
    nombre: 'Laura',
    apellido: 'Mendoza',
    correo: 'l.mendoza@atelier.com',
    rowKey: 'laura',
    telefono: '+52 55 5555 1212',
    disponibilidad: 'Inmediata',
    currentlyEmployed: false,
    expertis: ['Cypress', 'Jest', 'TypeScript'],
    rol: 'QA',
    seniority: 'Automation',
    visaVigente: true,
    disponibilidadViajar: false,
    procedencia: 'Evento',
    cvFileName: 'cv-laura-mendoza.txt',
    createdAtMs: Date.parse('2024-07-10T12:00:00.000Z'),
  },
];

export function cloneDeveloperProfile(p: DeveloperProfile): DeveloperProfile {
  return {
    ...p,
    expertis: [...p.expertis],
  };
}

/** Texto del CV de demo (sin data URI). */
export function buildCvPlainText(developer: DeveloperProfile): string {
  return [
    `Nombre: ${developer.nombre}`,
    `Apellido: ${developer.apellido}`,
    `Correo: ${developer.correo}`,
    `Telefono: ${developer.telefono}`,
    `Disponibilidad: ${developer.disponibilidad}`,
    `Trabaja actualmente: ${developer.currentlyEmployed ? 'Si' : 'No'}`,
    `Expertis: ${developer.expertis.length ? developer.expertis.join(', ') : '(sin indicar)'}`,
    `Rol: ${developer.rol}`,
    `Seniority: ${developer.seniority}`,
    `Visa vigente: ${developer.visaVigente ? 'Si' : 'No'}`,
    `Disponibilidad para viajar: ${developer.disponibilidadViajar ? 'Si' : 'No'}`,
    `Procedencia: ${developer.procedencia}`,
  ].join('\n');
}

export function buildCvDownloadHref(developer: DeveloperProfile) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(buildCvPlainText(developer))}`;
}
