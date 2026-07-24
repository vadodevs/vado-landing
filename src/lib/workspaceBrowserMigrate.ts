import { migrateBrowserWorkspaceData } from '@/lib/adminWorkspaceApi';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const MIGRATION_FLAG_KEY = 'vado-workspace-migrated-v1';
const THEME_STORAGE_KEY = 'vado-app-theme-mode';

const LOCAL_STORAGE_KEYS = [
  'vado-opportunities-pipeline',
  'vado-company-lead-updates',
  'vado-company-lead-favorites',
  'vado-admin-developer-favorites',
  'vado.admin.inboxRead.v2',
  'vado.admin.inboxBot.v1',
  'vado.admin.inboxAutopilot.v1',
  'vado.admin.inboxLlm.v1',
  THEME_STORAGE_KEY,
  'vado-admin-nav-proyectos-seen-max',
  'vado-admin-nav-developers-seen-max',
  'vado-admin-nav-companies-seen-max',
  'vado-dev-nav-projects-signature',
  'vado-company-nav-projects-signature',
] as const;

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function collectInboxReadState(): Record<string, Record<string, { lastMessageAtMs?: number }>> | undefined {
  const all = readJson<{ byOwner?: Record<string, Record<string, { lastMessageAtMs?: number }>> }>(
    'vado.admin.inboxRead.v2',
  );
  if (!all?.byOwner) return undefined;
  return all.byOwner;
}

function collectNavBadges(): Record<string, unknown> | undefined {
  const navBadges: Record<string, unknown> = {};
  const adminProjects = localStorage.getItem('vado-admin-nav-proyectos-seen-max');
  const adminDevs = localStorage.getItem('vado-admin-nav-developers-seen-max');
  const adminCompanies = localStorage.getItem('vado-admin-nav-companies-seen-max');
  const devSig = localStorage.getItem('vado-dev-nav-projects-signature');
  const companySig = localStorage.getItem('vado-company-nav-projects-signature');
  if (adminProjects != null) navBadges.adminProjectsSeenMax = Number(adminProjects) || 0;
  if (adminDevs != null) navBadges.adminDevelopersSeenMax = Number(adminDevs) || 0;
  if (adminCompanies != null) navBadges.adminCompaniesSeenMax = Number(adminCompanies) || 0;
  if (devSig != null) navBadges.devProjectsSignatureSeen = devSig;
  if (companySig != null) navBadges.companyProjectsSignatureSeen = companySig;
  return Object.keys(navBadges).length > 0 ? navBadges : undefined;
}

function hasLegacyData(): boolean {
  if (typeof window === 'undefined') return false;
  return LOCAL_STORAGE_KEYS.some((key) => localStorage.getItem(key) != null);
}

export async function migrateLegacyWorkspaceStorageOnce(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!isAdminAuthenticated()) return;
  if (sessionStorage.getItem(MIGRATION_FLAG_KEY) === '1') return;
  if (!hasLegacyData()) {
    sessionStorage.setItem(MIGRATION_FLAG_KEY, '1');
    return;
  }

  const themeRaw = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = themeRaw === 'dark' || themeRaw === 'light' ? themeRaw : undefined;
  const sidebarVisibility =
    readJson<Record<string, boolean>>('vado.admin.sidebar.sectionVisibility.v1') ?? undefined;

  const ok = await migrateBrowserWorkspaceData({
    pipeline: readJson<unknown[]>('vado-opportunities-pipeline') ?? undefined,
    companyLeadUpdates:
      readJson<Record<string, unknown[]>>('vado-company-lead-updates') ?? undefined,
    companyLeadStatuses: undefined,
    companyLeadFavorites: readJson<string[]>('vado-company-lead-favorites') ?? undefined,
    developerFavorites: readJson<string[]>('vado-admin-developer-favorites') ?? undefined,
    inboxReadState: collectInboxReadState(),
    theme,
    navBadges: collectNavBadges(),
    sidebarVisibility,
  });

  if (ok) {
    for (const key of LOCAL_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  }
  sessionStorage.setItem(MIGRATION_FLAG_KEY, '1');
}
