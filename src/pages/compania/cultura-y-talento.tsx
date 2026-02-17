import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CulturaYTalentoHero } from '@/components/layout/compania/CulturaYTalentoHero';
import { FiveVsSection } from '@/components/layout/compania/FiveVsSection';

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
          cta={t('cultureYTalentoPage.hero.cta')}
        />
        <FiveVsSection />
      </MainLayout>
    </>
  );
}
