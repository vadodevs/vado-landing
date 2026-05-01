import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';

/** In-memory seen markers (sin localStorage). */
export const ADMIN_NAV_PROJECTS_SEEN_KEY = 'vado-admin-nav-proyectos-seen-max';
export const ADMIN_NAV_DEVELOPERS_SEEN_KEY = 'vado-admin-nav-developers-seen-max';
export const ADMIN_NAV_COMPANIES_SEEN_KEY = 'vado-admin-nav-companies-seen-max';
export const DEV_NAV_PROJECTS_SIGNATURE_SEEN_KEY = 'vado-dev-nav-projects-signature';
export const COMPANY_NAV_PROJECTS_SIGNATURE_KEY = 'vado-company-nav-projects-signature';

export const APP_NAV_BADGES_REFRESH_EVENT = 'vado-app-nav-badges-refresh';

const navBadgeMemory = {
  adminProjectsSeenMax: 0,
  adminDevelopersSeenMax: 0,
  adminCompaniesSeenMax: 0,
  devProjectsSignatureSeen: '',
  companyProjectsSignatureSeen: '',
};

export function dispatchAppNavBadgesRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(APP_NAV_BADGES_REFRESH_EVENT));
}

export function getAdminProjectsSeenMax(): number {
  return navBadgeMemory.adminProjectsSeenMax;
}

export function setAdminProjectsSeenMax(value: number): void {
  navBadgeMemory.adminProjectsSeenMax = Number.isFinite(value) ? value : 0;
  dispatchAppNavBadgesRefresh();
}

export function getAdminDevelopersSeenMax(): number {
  return navBadgeMemory.adminDevelopersSeenMax;
}

export function setAdminDevelopersSeenMax(value: number): void {
  navBadgeMemory.adminDevelopersSeenMax = Number.isFinite(value) ? value : 0;
  dispatchAppNavBadgesRefresh();
}

export function getAdminCompaniesSeenMax(): number {
  return navBadgeMemory.adminCompaniesSeenMax;
}

export function setAdminCompaniesSeenMax(value: number): void {
  navBadgeMemory.adminCompaniesSeenMax = Number.isFinite(value) ? value : 0;
  dispatchAppNavBadgesRefresh();
}

export function getDevProjectsSignatureSeen(): string {
  return navBadgeMemory.devProjectsSignatureSeen;
}

export function setDevProjectsSignatureSeen(value: string): void {
  navBadgeMemory.devProjectsSignatureSeen = value;
  dispatchAppNavBadgesRefresh();
}

export function getCompanyProjectsSignatureSeen(): string {
  return navBadgeMemory.companyProjectsSignatureSeen;
}

export function setCompanyProjectsSignatureSeen(value: string): void {
  navBadgeMemory.companyProjectsSignatureSeen = value;
  dispatchAppNavBadgesRefresh();
}

/** Firma estable para detectar cambios en proyectos asignados (equipo, fechas). */
export function companyProjectsSignature(projects: AssignedProjectRecord[]): string {
  if (!projects.length) return '';
  const sorted = [...projects].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map((p) => `${p.id}:${p.createdAt}:${p.prospectos.length}`).join('|');
}

export function devProjectsSignature(
  projects: Array<{ id?: string | null; createdAt?: string | null }>,
): string {
  if (!projects.length) return '';
  const rows = projects
    .map((p) => ({
      id: typeof p.id === 'string' ? p.id.trim() : '',
      createdAt: typeof p.createdAt === 'string' ? p.createdAt.trim() : '',
    }))
    .filter((p) => p.id !== '')
    .sort((a, b) => a.id.localeCompare(b.id));
  return rows.map((p) => `${p.id}:${p.createdAt}`).join('|');
}
