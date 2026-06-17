import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';

export default function AppAdminSettingsCuestionario() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/settings/cuestionario"
      title={t('sidebarDemo.navSettingsQuestionnaire')}
      description={t('seo.appAdminSettingsCuestionario')}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-12 pt-0 md:pb-16" />
    </AppShell>
  );
}
