import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';
import { StaffAugmentationIntroSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationIntroSection';
import { StaffAugmentationProcessSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationProcessSection';
import { StaffAugmentationWhyVadoSection } from '@/components/layout/servicios/ampliacion-de-personal/StaffAugmentationWhyVadoSection';
// import { TrustedBrands } from '@/components/layout/home/brands/TrustedBrands';
import { VadoInsightsSection } from '@/components/layout/home/insights/VadoInsightsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function AmpliacionDePersonal() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('nav.staffAugmentation')}
        description={t('seo.staffAugmentation')}
        canonicalPath={path('/services/staff-augmentation')}
        pathWithoutLang="/services/staff-augmentation"
      />
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
        <VadoInsightsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
