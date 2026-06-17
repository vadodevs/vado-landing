import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { AdminGoogleCalendarIntegrationCard } from '@/components/admin/AdminGoogleCalendarIntegrationCard';

export default function AppAdminSettingsIntegraciones() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/settings/integraciones"
      title={t('sidebarDemo.navSettingsIntegrations')}
      description={t('seo.appAdminSettingsIntegraciones')}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-12 pt-0 md:pb-16">
        <AdminGoogleCalendarIntegrationCard />
      </div>
    </AppShell>
  );
}
