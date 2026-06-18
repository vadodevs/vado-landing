import { RECRUITER_PANEL_KEYS, defaultRecruiterPermissions } from '@/lib/adminRecruitersApi';

export type RecruiterPanelKey = (typeof RECRUITER_PANEL_KEYS)[number];


export const RECRUITER_PANEL_ROUTES: Record<RecruiterPanelKey, string> = {
  'panel:developers': '/app/recruiter/desarrolladores',
  'panel:jobs': '/app/recruiter/ofertas',
  'panel:projects': '/app/recruiter/proyectos',
  'panel:companies': '/app/recruiter/company',
};

export function isRecruiterPanelKey(k: string): k is RecruiterPanelKey {
  return (RECRUITER_PANEL_KEYS as readonly string[]).includes(k);
}

export function normalizeRecruiterPermissions(raw?: Record<string, boolean> | null): Record<string, boolean> {
  const base = defaultRecruiterPermissions();
  if (!raw || typeof raw !== 'object') return base;
  const next = { ...base };
  if (raw['candidates:read'] === true) next['panel:developers'] = true;
  if (raw['jobs:write'] === true) next['panel:jobs'] = true;
  if (raw['developers:invite'] === true) next['panel:developers'] = true;
  if (raw['reports:read'] === true) next['panel:projects'] = true;
  for (const key of RECRUITER_PANEL_KEYS) {
    if (typeof raw[key] === 'boolean') {
      next[key] = raw[key];
    }
  }
  return next;
}

export function hasRecruiterPanelPermission(
  perms: Record<string, boolean> | null | undefined,
  key: RecruiterPanelKey,
): boolean {
  return normalizeRecruiterPermissions(perms ?? {})[key] === true;
}
