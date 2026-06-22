import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AdminUtilitiesTasksPanel } from '@/components/admin/AdminUtilitiesTasksPanel';

export default function AppAdminUtileriaTareas() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/utileria/tareas"
      title={t('sidebarDemo.navUtilitiesTasks')}
      description={t('seo.appAdminUtilitiesTasks')}
    >
      <section className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-0 md:pb-16">
        <AdminUtilitiesTasksPanel />
      </section>
    </AppShell>
  );
}
