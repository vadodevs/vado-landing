import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';
import type { NavBadgesPreference } from '@/lib/userPreferencesApi';

export const APP_NAV_BADGES_REFRESH_EVENT = 'vado-app-nav-badges-refresh';

const navBadgeMemory: Required<NavBadgesPreference> = {
  adminProjectsSeenMax: 0,
  adminDevelopersSeenMax: 0,
  adminCompaniesSeenMax: 0,
  devProjectsSignatureSeen: '',
  companyProjectsSignatureSeen: '',
};

let navBadgesHydrated = false;

export function isNavBadgesHydrated(): boolean {
  return navBadgesHydrated;
}

export function hydrateNavBadgesFromServer(prefs: NavBadgesPreference): void {
  navBadgeMemory.adminProjectsSeenMax = Number(prefs.adminProjectsSeenMax) || 0;
  navBadgeMemory.adminDevelopersSeenMax = Number(prefs.adminDevelopersSeenMax) || 0;
  navBadgeMemory.adminCompaniesSeenMax = Number(prefs.adminCompaniesSeenMax) || 0;
  navBadgeMemory.devProjectsSignatureSeen = prefs.devProjectsSignatureSeen ?? '';
  navBadgeMemory.companyProjectsSignatureSeen = prefs.companyProjectsSignatureSeen ?? '';
  navBadgesHydrated = true;
  dispatchAppNavBadgesRefresh();
}

export function getNavBadgesSnapshot(): NavBadgesPreference {
  return { ...navBadgeMemory };
}

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
