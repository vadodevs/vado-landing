import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import { useLocale } from '@/hooks/useLocale';
import { AISolutionsSection } from '@/components/layout/home/ai-solutions/AISolutionsSection';
import { DigitalProductsSection } from '@/components/layout/home/digital-products/DigitalProductsSection';
import { ClientsSection } from '@/components/layout/home/clients/ClientsSection';
import { Hero } from '@/components/layout/home/hero/Hero';
import { HowWeWorkSection } from '@/components/layout/home/how-we-work/HowWeWorkSection';
import { NearshoreBenefitsBentoSection } from '@/components/layout/home/nearshore-bento/NearshoreBenefitsBentoSection';
import { StaffAugmentationSection } from '@/components/layout/home/staff-augmentation/StaffAugmentationSection';
import { TechStackSection } from '@/components/layout/home/tech-stack/TechStackSection';
import { WhyVadoSection } from '@/components/layout/home/why-vado/WhyVadoSection';
import { CultureAndTalentSection } from '@/components/layout/home/culture-and-talent/CultureAndTalentSection';
import { VadoInsightsSection } from '@/components/layout/home/insights/VadoInsightsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('home.title')}
        description={t('seo.home')}
        canonicalPath={path('')}
        pathWithoutLang=""
      />
      <MainLayout>
        <Hero />
        <HowWeWorkSection />
        <NearshoreBenefitsBentoSection />
        <DigitalProductsSection />
        <AISolutionsSection />
        <TechStackSection />
        <ClientsSection />
        <StaffAugmentationSection />
        <WhyVadoSection />
        <CultureAndTalentSection />
        <VadoInsightsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
