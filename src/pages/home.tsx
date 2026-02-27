import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import { useLocale } from '@/hooks/useLocale';
import { Hero } from '@/components/layout/home/hero/Hero';
import { TrustedBrands } from '@/components/layout/home/brands/TrustedBrands';
import { DigitalProductsSection } from '@/components/layout/home/digital-products/DigitalProductsSection';
import MainLayout from '@/components/layout/MainLayout';

const AISolutionsSection = lazy(() =>
  import('@/components/layout/home/ai-solutions/AISolutionsSection').then((m) => ({ default: m.AISolutionsSection })),
);
const TechStackSection = lazy(() =>
  import('@/components/layout/home/tech-stack/TechStackSection').then((m) => ({ default: m.TechStackSection })),
);
const ClientsSection = lazy(() =>
  import('@/components/layout/home/clients/ClientsSection').then((m) => ({ default: m.ClientsSection })),
);
const StaffAugmentationSection = lazy(() =>
  import('@/components/layout/home/staff-augmentation/StaffAugmentationSection').then((m) => ({ default: m.StaffAugmentationSection })),
);
const WhyVadoSection = lazy(() =>
  import('@/components/layout/home/why-vado/WhyVadoSection').then((m) => ({ default: m.WhyVadoSection })),
);
const CultureAndTalentSection = lazy(() =>
  import('@/components/layout/home/culture-and-talent/CultureAndTalentSection').then((m) => ({ default: m.CultureAndTalentSection })),
);
const VadoInsightsSection = lazy(() =>
  import('@/components/layout/home/insights/VadoInsightsSection').then((m) => ({ default: m.VadoInsightsSection })),
);
const FAQSection = lazy(() =>
  import('@/components/layout/home/faq/FAQSection').then((m) => ({ default: m.FAQSection })),
);
const CtaContactSection = lazy(() =>
  import('@/components/layout/home/cta-contact/CtaContactSection').then((m) => ({ default: m.CtaContactSection })),
);

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
        <TrustedBrands />
        <DigitalProductsSection />
        <Suspense>
          <AISolutionsSection />
          <TechStackSection />
          <ClientsSection />
          <StaffAugmentationSection />
          <WhyVadoSection />
          <CultureAndTalentSection />
          <VadoInsightsSection />
          <FAQSection />
          <CtaContactSection />
        </Suspense>
      </MainLayout>
    </>
  );
}
