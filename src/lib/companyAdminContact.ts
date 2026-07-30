import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { adminAuthorizedFetch } from '@/lib/adminAuth';
import { createManualCompanyLeadApi } from '@/lib/adminWorkspaceApi';


export type CompanyContact = {
  id: string;
  servicio: string;
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  linkedinUrl: string;
  mensaje: string;
  sector: string;
  ciudad: string;
  fechaSolicitud: string;

  createdAtMs: number;
};


export type ApiCompanySubmissionRow = {
  id: string;
  firstName: string;
  email: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  company: string;
  campaignID?: string;
  subject?: string | null;
  message?: string | null;
  createdAt: string;
};

function formatDateOnlyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function mapApiCompanySubmission(row: ApiCompanySubmissionRow): CompanyContact {
  const created = row.createdAt ? new Date(row.createdAt) : new Date();
  const fechaSolicitud = Number.isFinite(created.getTime())
    ? formatDateOnlyFromDate(created)
    : formatDateOnlyFromDate(new Date());
  const createdAtMs = Number.isFinite(created.getTime()) ? created.getTime() : 0;

  const servicio =
    row.subject != null && String(row.subject).trim() !== ''
      ? String(row.subject).trim()
      : 'Selecciona uno...';

  return {
    id: row.id,
    servicio,
    nombre: (row.firstName ?? '').trim() || '—',
    correo: (row.email ?? '').trim(),
    empresa: (row.company ?? '').trim() || '—',
    telefono: (row.phone ?? '').trim() || '—',
    linkedinUrl: (row.linkedinUrl ?? '').trim(),
    mensaje: (row.message ?? '').trim(),
    sector: '',
    ciudad: '',
    fechaSolicitud,
    createdAtMs,
  };
}

export type CompanyContactDirectoryEntry = { name: string; email: string };

export type CompanySubmissionsFetchResult =
  | { ok: true; contacts: CompanyContact[] }
  | { ok: false; reason: 'no-config' | 'fail' };


export async function fetchCompanySubmissions(opts?: {
  archived?: boolean
}): Promise<CompanySubmissionsFetchResult> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  try {
    const q = opts?.archived ? '?archived=1' : '';
    const res = await adminAuthorizedFetch(`${base}/contact/company-submissions${q}`);
    if (!res?.ok) return { ok: false, reason: 'fail' };
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return { ok: true, contacts: [] };
    const contacts = data.map((row) => mapApiCompanySubmission(row as ApiCompanySubmissionRow));
    return { ok: true, contacts };
  } catch {
    return { ok: false, reason: 'fail' };
  }
}

export async function setCompanySubmissionArchived(
  id: string,
  archived: boolean,
): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base) return false;
  try {
    const res = await adminAuthorizedFetch(`${base}/contact/company-submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived }),
    });
    return res?.ok === true;
  } catch {
    return false;
  }
}

export async function deleteCompanySubmission(id: string): Promise<boolean> {
  const base = getApiBaseUrl();
  if (!base) return false;
  try {
    const res = await adminAuthorizedFetch(`${base}/contact/company-submissions/${id}`, {
      method: 'DELETE',
    });
    return res?.ok === true;
  } catch {
    return false;
  }
}

export type PatchCompanySubmissionFieldsInput = {
  phone?: string | null;
  linkedinUrl?: string | null;
};

export type PatchCompanySubmissionFieldsResult =
  | { ok: true; contact: CompanyContact }
  | { ok: false; reason: 'no-config' | 'fail' };

export async function patchCompanySubmissionFields(
  id: string,
  fields: PatchCompanySubmissionFieldsInput,
): Promise<PatchCompanySubmissionFieldsResult> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  try {
    const res = await adminAuthorizedFetch(`${base}/contact/company-submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res?.ok) return { ok: false, reason: 'fail' };
    const data = (await res.json()) as ApiCompanySubmissionRow;
    return { ok: true, contact: mapApiCompanySubmission(data) };
  } catch {
    return { ok: false, reason: 'fail' };
  }
}


export async function fetchCompanyContactDirectory(): Promise<
  Record<string, CompanyContactDirectoryEntry>
> {
  const res = await fetchCompanySubmissions();
  if (!res.ok) return {};
  const out: Record<string, CompanyContactDirectoryEntry> = {};
  for (const contact of res.contacts) {
    out[contact.id] = { name: contact.nombre, email: contact.correo };
  }
  return out;
}

const COMPANY_SUBJECT_VALUES = [
  'Staff Augmentation',
  'Custom Software Development',
  'AI Solutions',
  'Other',
] as const;

type CompanySubject = (typeof COMPANY_SUBJECT_VALUES)[number];

function resolveCompanySubject(servicio: string): CompanySubject | undefined {
  const trimmed = servicio.trim();
  return (COMPANY_SUBJECT_VALUES as readonly string[]).includes(trimmed)
    ? (trimmed as CompanySubject)
    : undefined;
}

function buildManualLeadMessage(servicio: string, mensaje: string): string {
  const parts: string[] = [];
  const subject = resolveCompanySubject(servicio);
  if (servicio.trim() && !subject) parts.push(`Asunto: ${servicio.trim()}`);
  if (mensaje.trim()) parts.push(mensaje.trim());
  return parts.join('\n\n').slice(0, 1024);
}

export type CreateCompanySubmissionInput = {
  nombre: string;
  correo: string;
  empresa?: string;
  telefono?: string;
  servicio?: string;
  mensaje?: string;
};

export type CreateCompanySubmissionResult =
  | { ok: true; contact: CompanyContact }
  | { ok: false; reason: 'no-config' | 'fail'; detail?: string };

export async function createCompanySubmission(
  input: CreateCompanySubmissionInput,
): Promise<CreateCompanySubmissionResult> {
  if (!getApiBaseUrl()) return { ok: false, reason: 'no-config' };

  const servicio = (input.servicio ?? '').trim();
  const subject = resolveCompanySubject(servicio);
  const result = await createManualCompanyLeadApi({
    firstName: input.nombre.trim(),
    email: input.correo.trim(),
    phone: input.telefono?.trim() || undefined,
    company: input.empresa?.trim() || undefined,
    ...(subject ? { subject } : {}),
    message: buildManualLeadMessage(servicio, input.mensaje ?? ''),
  });

  if (!result.ok) {
    if (result.reason === 'unauthorized') {
      return {
        ok: false,
        reason: 'fail',
        detail: 'Inicia sesión como administrador para guardar leads.',
      };
    }
    return {
      ok: false,
      reason: result.reason === 'no-config' ? 'no-config' : 'fail',
      detail: result.detail,
    };
  }

  return { ok: true, contact: mapApiCompanySubmission(result.data) };
}
