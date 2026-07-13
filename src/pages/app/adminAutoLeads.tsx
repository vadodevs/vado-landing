import { useTranslation } from 'react-i18next';
import { AdminAutoLeadsPanel } from '@/components/admin/AdminAutoLeadsPanel';
import { AppShell } from '@/components/layout/app/AppShell';

export default function AppAdminAutoLeads() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/leads/auto"
      title={t('sidebarDemo.navAutoLeads')}
      description={t('seo.appAdminAutoLeads')}
    >
      <AdminAutoLeadsPanel />
    </AppShell>
  );
}
