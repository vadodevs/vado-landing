import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { InsightsHero } from '@/components/layout/compania/InsightsHero';
import { InsightsArticlesSection } from '@/components/layout/compania/InsightsArticlesSection';

export default function VadoInsights() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.vadoInsights')} />
      <MainLayout>
        <InsightsHero
          titleLine1={t('insightsPage.hero.titleLine1')}
          titleLine2={t('insightsPage.hero.titleLine2')}
          subtitle={t('insightsPage.hero.subtitle')}
          description={t('insightsPage.hero.description')}
          cta={t('insightsPage.hero.cta')}
        />
        <InsightsArticlesSection />
      </MainLayout>
    </>
  );
}
