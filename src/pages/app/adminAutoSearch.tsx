import { useTranslation } from 'react-i18next';
import { AdminAutoSearchPanel } from '@/components/admin/AdminAutoSearchPanel';
import { AppShell } from '@/components/layout/app/AppShell';

export default function AppAdminAutoSearch() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/admin/leads/auto-search"
      title={t('sidebarDemo.navAutoSearch')}
      description={t('seo.appAdminAutoSearch')}
    >
      <AdminAutoSearchPanel />
    </AppShell>
  );
}
