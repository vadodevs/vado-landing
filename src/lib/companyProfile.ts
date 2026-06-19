
export type CompanySolicitudProfile = {
  empresa: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicio: string;
  mensaje: string;
  sector: string;
  ciudad: string;
  
  fechaSolicitud: string;
};

function formatDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}



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
