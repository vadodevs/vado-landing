import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CulturaYTalentoHero } from '@/components/layout/compania/CulturaYTalentoHero';
import { FiveVsSection } from '@/components/layout/compania/FiveVsSection';
import { CoreValuesSection } from '@/components/layout/compania/CoreValuesSection';
import { GrowTalentCtaSection } from '@/components/layout/compania/GrowTalentCtaSection';
import { LeadershipSection } from '@/components/layout/compania/LeadershipSection';
import { TeamVadoSection } from '@/components/layout/compania/TeamVadoSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function CulturaYTalento() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.cultureAndTalent')} />
      <MainLayout>
        <CulturaYTalentoHero
          titleLine1={t('cultureYTalentoPage.hero.titleLine1')}
          titleLine2={t('cultureYTalentoPage.hero.titleLine2')}
          description={t('cultureYTalentoPage.hero.description')}
        />
        <FiveVsSection />
        <CoreValuesSection />
        <TeamVadoSection />
        <LeadershipSection />
        <GrowTalentCtaSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
