import type { AppThemeMode } from '@/lib/appTheme';
import { userApiRequest } from '@/lib/userAuthorizedFetch';

export type NavBadgesPreference = {
  adminProjectsSeenMax?: number;
  adminDevelopersSeenMax?: number;
  adminCompaniesSeenMax?: number;
  devProjectsSignatureSeen?: string;
  companyProjectsSignatureSeen?: string;
};

export type UserPreferencesPayload = {
  theme: AppThemeMode;
  navBadges: NavBadgesPreference;
};

export async function fetchUserPreferences(): Promise<UserPreferencesPayload | null> {
  const res = await userApiRequest<UserPreferencesPayload>('/user/preferences');
  if (!res.ok) return null;
  const theme = res.data.theme === 'dark' ? 'dark' : 'light';
  return { theme, navBadges: res.data.navBadges ?? {} };
}

export async function patchUserPreferences(
  patch: Partial<UserPreferencesPayload>,
): Promise<UserPreferencesPayload | null> {
  const res = await userApiRequest<UserPreferencesPayload>('/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const theme = res.data.theme === 'dark' ? 'dark' : 'light';
  return { theme, navBadges: res.data.navBadges ?? {} };
}
