import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { SoftwareHero } from '@/components/layout/servicios/software-a-la-medida/SoftwareHero';
import { SoftwareProcessSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareProcessSection';
import { SoftwareProductsSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareProductsSection';
import { SoftwareTabsSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareTabsSection';
import { SoftwareTestimonialsSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareTestimonialsSection';
import { SoftwareWhyVadoSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareWhyVadoSection';
import { VadoInsightsSection } from '@/components/layout/home/insights/VadoInsightsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function SoftwareALaMedida() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.customSoftware')} />
      <MainLayout>
        <SoftwareHero />
        <SoftwareProductsSection />
        <SoftwareTabsSection />
        <SoftwareProcessSection />
        <SoftwareWhyVadoSection />
        <SoftwareTestimonialsSection />
        <VadoInsightsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
