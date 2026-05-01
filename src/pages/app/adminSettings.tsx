import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AppThemeSettingsCard } from '@/components/app/AppThemeSettingsCard';
import { getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';

export default function AppAdminSettings() {
  const { t } = useTranslation();
  const [themeMode, setThemeMode] = useState<AppThemeMode>('light');

  useEffect(() => {
    setThemeMode(getStoredAppTheme());
  }, []);

  return (
    <AppShell
      pathWithoutLang="/app/admin/settings"
      title={t('sidebarDemo.navSettings')}
      description={t('seo.appAdminJobs')}
    >
      <section id="settings" className="scroll-mt-24">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t('sidebarDemo.navSettings')}</h2>
        <AppThemeSettingsCard mode={themeMode} onChange={setThemeMode} />
      </section>
    </AppShell>
  );
}
