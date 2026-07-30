import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AppThemeSettingsCard } from '@/components/app/AppThemeSettingsCard';
import { AdminSidebarVisibilityCard } from '@/components/admin/AdminSidebarVisibilityCard';
import { AdminAutopilotSettingsCard } from '@/components/admin/AdminAutopilotSettingsCard';
import { AdminBotExclusionsCard } from '@/components/admin/AdminBotExclusionsCard';
import { AdminBotSettingsCard } from '@/components/admin/AdminBotSettingsCard';
import { AdminColdEmailSettingsCard } from '@/components/admin/AdminColdEmailSettingsCard';
import { AdminMessagesSettingsCard } from '@/components/admin/AdminMessagesSettingsCard';
import { AdminWhatsappLinkCard } from '@/components/admin/AdminWhatsappLinkCard';
import { AdminSessionsCard } from '@/components/admin/AdminSessionsCard';
import { SettingsSectionLabel } from '@/components/settings/settings-ui';
import { getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';
import { hydrateInboxAiSettingsFromApi } from '@/lib/inboxAiSettingsApi';

export default function AppAdminSettings() {
  const { t } = useTranslation();
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => getStoredAppTheme());

  useEffect(() => {
    void hydrateInboxAiSettingsFromApi();
  }, []);

  return (
    <AppShell
      pathWithoutLang="/app/admin/settings"
      title={t('sidebarDemo.navSettings')}
      description={t('seo.appAdminSettings')}
    >
      <div className="mx-auto w-full max-w-3xl space-y-3 pb-10 pt-0 md:pb-12">
        <SettingsSectionLabel>{t('adminSettings.sectionAppearance')}</SettingsSectionLabel>
        <AppThemeSettingsCard mode={themeMode} onChange={setThemeMode} />
        <AdminSidebarVisibilityCard />

        <SettingsSectionLabel>{t('adminSettings.sectionSecurity')}</SettingsSectionLabel>
        <AdminSessionsCard />

        <SettingsSectionLabel>{t('adminSettings.sectionMessages')}</SettingsSectionLabel>
        <AdminMessagesSettingsCard />

        <SettingsSectionLabel>{t('adminSettings.sectionAutomation')}</SettingsSectionLabel>
        <AdminAutopilotSettingsCard />
        <AdminBotSettingsCard />
        <AdminBotExclusionsCard />
        <AdminColdEmailSettingsCard />
        <AdminWhatsappLinkCard />
      </div>
    </AppShell>
  );
}
