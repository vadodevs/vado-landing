import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AppThemeSettingsCard } from '@/components/app/AppThemeSettingsCard';
import { AdminWhatsappLinkCard } from '@/components/admin/AdminWhatsappLinkCard';
import { getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';

export default function AppAdminSettings() {
  const { t } = useTranslation();
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => getStoredAppTheme());

  return (
    <AppShell
      pathWithoutLang="/app/admin/settings"
      title={t('sidebarDemo.navSettings')}
      description={t('seo.appAdminSettings')}
    >
      <div className="space-y-10">
        <section id="settings" className="scroll-mt-24">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            {t('sidebarDemo.navSettings')}
          </h2>
          <AppThemeSettingsCard mode={themeMode} onChange={setThemeMode} />
        </section>
        <AdminWhatsappLinkCard />
      </div>
    </AppShell>
  );
}
