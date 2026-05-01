/**
 * Datos de la solicitud de una empresa (alineados con campos base del admin Compañías).
 */
export type CompanySolicitudProfile = {
  empresa: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicio: string;
  mensaje: string;
  sector: string;
  ciudad: string;
  /** Fecha en formato yyyy-mm-dd */
  fechaSolicitud: string;
};

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Campos fijos de la demo (misma fila id "1" que en admin/compañías). */
/** Valores alineados con placeholders del formulario de contacto (demo). */
const COMPANY_SESSION_BASE: Omit<CompanySolicitudProfile, 'fechaSolicitud'> = {
  empresa: 'Mi Empresa',
  nombre: 'Perla Guerrero',
  correo: 'correo@ejemplo.com',
  telefono: '123 456 7890',
  servicio: 'Selecciona uno...',
  mensaje: 'Cuéntanos sobre ti o sobre tu proyecto...',
  sector: '',
  ciudad: '',
};

/**
 * Perfil de sesión en /app/company/profile (demo).
 * La fecha de solicitud es el día actual para alinearla con la primera fila del admin.
 */
export function getCompanySessionProfile(): CompanySolicitudProfile {
  return {
    ...COMPANY_SESSION_BASE,
    fechaSolicitud: formatDateOnly(new Date()),
  };
}

export function empresaInitials(empresa: string): string {
  const parts = empresa.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  const w = parts[0] ?? empresa;
  return w.slice(0, 2).toUpperCase();
}
