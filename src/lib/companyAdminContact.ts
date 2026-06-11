/** Fila de la vista admin Compañías (lista + detalle). */
export type CompanyContact = {
  id: string;
  servicio: string;
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  mensaje: string;
  sector: string;
  ciudad: string;
  fechaSolicitud: string;
  /** Para ordenar (ms desde epoch; desde `createdAt` del API o fecha demo). */
  createdAtMs: number;
};

/** Respuesta de GET /contact/company-submissions (ServiceRequest en JSON). */
export type ApiCompanySubmissionRow = {
  id: string;
  firstName: string;
  email: string;
  phone?: string | null;
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
    mensaje: (row.message ?? '').trim(),
    sector: '',
    ciudad: '',
    fechaSolicitud,
    createdAtMs,
  };
}
