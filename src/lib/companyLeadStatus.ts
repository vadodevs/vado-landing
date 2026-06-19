
export const COMPANY_LEAD_STATUSES = [
  'sin_contactar',
  'pendiente_revision',
  'en_curso',
  'completado',
  'descartado',
] as const;
export type CompanyLeadStatus = (typeof COMPANY_LEAD_STATUSES)[number];

export const COMPANY_LEAD_STATUS_LABELS: Record<CompanyLeadStatus, string> = {
  sin_contactar: 'Sin contactar',
  pendiente_revision: 'Pendiente / revisión',
  en_curso: 'En curso',
  completado: 'Completado',
  descartado: 'Descartado',
};

export const COMPANY_LEAD_STATUS_DOT_CLASS: Record<CompanyLeadStatus, string> = {
  sin_contactar: 'bg-sky-500',
  pendiente_revision: 'bg-amber-500',
  en_curso: 'bg-violet-500',
  completado: 'bg-emerald-500',
  descartado: 'bg-rose-500',
};

export const COMPANY_LEAD_STATUS_BADGE_CLASS: Record<CompanyLeadStatus, string> = {
  sin_contactar:
    'border border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/45 dark:text-sky-200',
  pendiente_revision:
    'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-200',
  en_curso:
    'border border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/45 dark:text-violet-200',
  completado:
    'border border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
  descartado:
    'border border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/45 dark:text-rose-200',
};

export const LEAD_STATUS_CHANGED_EVENT = 'vado-lead-status-changed';

export function isCompanyLeadStatus(v: unknown): v is CompanyLeadStatus {
  return typeof v === 'string' && (COMPANY_LEAD_STATUSES as readonly string[]).includes(v);
}

export function getCompanyLeadStatus(
  overrides: Record<string, CompanyLeadStatus>,
  id: string,
): CompanyLeadStatus {
  const s = overrides[id];
  return s ?? 'sin_contactar';
}

export function applyCompanyLeadStatusOverride(
  prev: Record<string, CompanyLeadStatus>,
  id: string,
  next: CompanyLeadStatus,
): Record<string, CompanyLeadStatus> {
  if (next === 'sin_contactar') {
    const rest = { ...prev };
    delete rest[id];
    return rest;
  }
  return { ...prev, [id]: next };
}

export function dispatchLeadStatusChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LEAD_STATUS_CHANGED_EVENT));
  }
}
