import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';
import { AIProcessSection } from '@/components/layout/servicios/soluciones-ia/AIProcessSection';
import { AISolutionsTabsSection } from '@/components/layout/servicios/soluciones-ia/AISolutionsTabsSection';
import { AIWhyVadoSection } from '@/components/layout/servicios/soluciones-ia/AIWhyVadoSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { SoftwareTestimonialsSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareTestimonialsSection';

export default function SolucionesIA() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.aiSolutions')} />
      <MainLayout>
        <ServiceHero
          backgroundImage="/backgrounds/bg-blue-header.svg"
          titleLine1={t('services.aiSolutions.hero.titleLine1')}
          titleLine2={t('services.aiSolutions.hero.titleLine2')}
          tagline={t('services.aiSolutions.hero.tagline')}
          cta={t('services.aiSolutions.hero.cta')}
        />
        <AISolutionsTabsSection />
        <AIProcessSection />
        <AIWhyVadoSection />
        <SoftwareTestimonialsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
