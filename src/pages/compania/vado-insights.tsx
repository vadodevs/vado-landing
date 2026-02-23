import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { InsightsHero } from '@/components/layout/compania/InsightsHero';
import { InsightsArticlesSection } from '@/components/layout/compania/InsightsArticlesSection';
import { InsightsStayUpdatedSection } from '@/components/layout/compania/InsightsStayUpdatedSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';

export default function VadoInsights() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('nav.vadoInsights')}
        description={t('seo.vadoInsights')}
        canonicalPath={path('/company/vado-insights')}
        pathWithoutLang="/company/vado-insights"
      />
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
