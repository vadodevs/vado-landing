import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';
import { OurWorkProjectsSection } from '@/components/layout/nuestro-trabajo/OurWorkProjectsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function NuestroTrabajo() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.ourWork')} />
      <MainLayout>
        <ServiceHero
          backgroundImage="/backgrounds/bg-blue.svg"
          titleLine1={t('ourWork.hero.titleLine1')}
          titleLine2={t('ourWork.hero.titleLine2')}
          tagline={t('ourWork.hero.tagline')}
          cta={t('ourWork.hero.cta')}
        />
        <OurWorkProjectsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
