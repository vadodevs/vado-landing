import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';
import { StaffAugmentationIntroSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationIntroSection';
import { StaffAugmentationProcessSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationProcessSection';
import { StaffAugmentationWhyVadoSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationWhyVadoSection';
// import { TrustedBrands } from '@/components/layout/home/brands/TrustedBrands';
import { VadoInsightsSection } from '@/components/layout/home/insights/VadoInsightsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';
import { SoftwareTestimonialsSection } from '@/components/layout/servicios/software-a-la-medida/SoftwareTestimonialsSection';

export default function AmpliacionDePersonal() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.staffAugmentation')} />
      <MainLayout>
        <ServiceHero
          backgroundImage="/backgrounds/bg-blue.svg"
          titleLine1={t('services.staffAugmentation.hero.titleLine1')}
          titleLine2={t('services.staffAugmentation.hero.titleLine2')}
          tagline={t('services.staffAugmentation.hero.tagline')}
        />
        {/* <TrustedBrands /> */}
        <StaffAugmentationIntroSection />
        <StaffAugmentationProcessSection />
        <StaffAugmentationWhyVadoSection />
        <SoftwareTestimonialsSection />
        <VadoInsightsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
