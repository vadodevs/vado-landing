import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { InsightsHero } from '@/components/layout/compania/InsightsHero';
import { InsightsArticlesSection } from '@/components/layout/compania/InsightsArticlesSection';
import { InsightsStayUpdatedSection } from '@/components/layout/compania/InsightsStayUpdatedSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';

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
        />
        <InsightsArticlesSection />
        <InsightsStayUpdatedSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
