import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AdminUtilitiesRemindersPanel } from '@/components/admin/AdminUtilitiesRemindersPanel';

export default function AppAdminUtileriaRecordatorios() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/utileria/recordatorios"
      title={t('sidebarDemo.navUtilitiesReminders')}
      description={t('seo.appAdminUtilitiesReminders')}
    >
      <section className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-0 md:pb-16">
        <AdminUtilitiesRemindersPanel />
      </section>
    </AppShell>
  );
}
