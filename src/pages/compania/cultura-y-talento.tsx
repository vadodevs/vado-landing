import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { CulturaYTalentoHero } from '@/components/layout/compania/CulturaYTalentoHero';
import { FiveVsSection } from '@/components/layout/compania/FiveVsSection';
import { CoreValuesSection } from '@/components/layout/compania/CoreValuesSection';
import { GrowTalentCtaSection } from '@/components/layout/compania/GrowTalentCtaSection';

import { TeamVadoSection } from '@/components/layout/compania/TeamVadoSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function CulturaYTalento() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('nav.cultureAndTalent')}
        description={t('seo.cultureAndTalent')}
        canonicalPath={path('/company/culture-and-talent')}
        pathWithoutLang="/company/culture-and-talent"
      />
      <MainLayout>
        <CulturaYTalentoHero
          titleLine1={t('cultureYTalentoPage.hero.titleLine1')}
          titleLine2={t('cultureYTalentoPage.hero.titleLine2')}
          description={t('cultureYTalentoPage.hero.description')}
        />
        <FiveVsSection />
        <CoreValuesSection />
        <TeamVadoSection />
        
        <GrowTalentCtaSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
