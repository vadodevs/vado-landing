import {
  getNavBadgesSnapshot,
  hydrateNavBadgesFromServer,
  setAdminCompaniesSeenMax,
  setAdminDevelopersSeenMax,
  setAdminProjectsSeenMax,
  setCompanyProjectsSignatureSeen,
  setDevProjectsSignatureSeen,
} from '@/lib/appNavBadges';
import { setCachedAppTheme } from '@/lib/appTheme';
import { fetchUserPreferences, patchUserPreferences } from '@/lib/userPreferencesApi';
import { isUserAuthenticated } from '@/lib/userAuthorizedFetch';

let hydratePromise: Promise<void> | null = null;

export async function hydrateUserPreferences(): Promise<void> {
  if (!isUserAuthenticated()) return;
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    const prefs = await fetchUserPreferences();
    if (!prefs) return;
    setCachedAppTheme(prefs.theme);
    hydrateNavBadgesFromServer(prefs.navBadges);
  })();
  return hydratePromise;
}

export async function persistThemePreference(theme: 'light' | 'dark'): Promise<void> {
  setCachedAppTheme(theme);
  if (!isUserAuthenticated()) return;
  await patchUserPreferences({ theme });
}

export async function hydrateThemeFromServer(): Promise<void> {
  if (!isUserAuthenticated()) return;
  const prefs = await fetchUserPreferences();
  if (!prefs) return;
  setCachedAppTheme(prefs.theme);
}

export async function persistNavBadgesPreference(): Promise<void> {
  if (!isUserAuthenticated()) return;
  await patchUserPreferences({ navBadges: getNavBadgesSnapshot() });
}

export async function persistAdminProjectsSeenMax(value: number): Promise<void> {
  setAdminProjectsSeenMax(value);
  await persistNavBadgesPreference();
}

export async function persistAdminDevelopersSeenMax(value: number): Promise<void> {
  setAdminDevelopersSeenMax(value);
  await persistNavBadgesPreference();
}

export async function persistAdminCompaniesSeenMax(value: number): Promise<void> {
  setAdminCompaniesSeenMax(value);
  await persistNavBadgesPreference();
}

export async function persistDevProjectsSignatureSeen(value: string): Promise<void> {
  setDevProjectsSignatureSeen(value);
  await persistNavBadgesPreference();
}

export async function persistCompanyProjectsSignatureSeen(value: string): Promise<void> {
  setCompanyProjectsSignatureSeen(value);
  await persistNavBadgesPreference();
}
