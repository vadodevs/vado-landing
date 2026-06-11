import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';

export default function AppProjectsPage() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/projects"
      title={t('sidebarDemo.navProjects')}
      description={t('seo.appProjects')}
    >
      <section className="scroll-mt-24">
        <h2 className="mb-2 text-xl font-semibold text-foreground">{t('sidebarDemo.appProjectsHeading')}</h2>
        <p className="max-w-prose text-muted-foreground">{t('sidebarDemo.appProjectsBody')}</p>
      </section>
    </AppShell>
  );
}
