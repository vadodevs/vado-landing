import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AppThemeSettingsCard } from '@/components/app/AppThemeSettingsCard';
import { AdminAutopilotSettingsCard } from '@/components/admin/AdminAutopilotSettingsCard';
import { AdminBotExclusionsCard } from '@/components/admin/AdminBotExclusionsCard';
import { AdminBotSettingsCard } from '@/components/admin/AdminBotSettingsCard';
import { AdminMessagesSettingsCard } from '@/components/admin/AdminMessagesSettingsCard';
import { AdminWhatsappLinkCard } from '@/components/admin/AdminWhatsappLinkCard';
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
      <div className="mx-auto w-full max-w-3xl space-y-8 pb-12 pt-0 md:pb-16">
        <section id="settings" className="scroll-mt-24">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            {t('sidebarDemo.navSettings')}
          </h2>
          <AppThemeSettingsCard mode={themeMode} onChange={setThemeMode} />
        </section>
        <AdminMessagesSettingsCard />
        <AdminAutopilotSettingsCard />
        <AdminBotSettingsCard />
        <AdminBotExclusionsCard />
        <AdminWhatsappLinkCard />
      </div>
    </AppShell>
  );
}
