import { lazy, Suspense } from 'react';

import { ViewportLazySection } from '@/components/layout/home/ViewportLazySection';

const HowWeWorkSection = lazy(() =>
  import('@/components/layout/home/how-we-work/HowWeWorkSection').then((m) => ({
    default: m.HowWeWorkSection,
  })),
);
const NearshoreBenefitsBentoSection = lazy(() =>
  import('@/components/layout/home/nearshore-bento/NearshoreBenefitsBentoSection').then((m) => ({
    default: m.NearshoreBenefitsBentoSection,
  })),
);
const DigitalProductsSection = lazy(() =>
  import('@/components/layout/home/digital-products/DigitalProductsSection').then((m) => ({
    default: m.DigitalProductsSection,
  })),
);
const AISolutionsSection = lazy(() =>
  import('@/components/layout/home/ai-solutions/AISolutionsSection').then((m) => ({
    default: m.AISolutionsSection,
  })),
);
const TechStackSection = lazy(() =>
  import('@/components/layout/home/tech-stack/TechStackSection').then((m) => ({
    default: m.TechStackSection,
  })),
);
const ClientsSection = lazy(() =>
  import('@/components/layout/home/clients/ClientsSection').then((m) => ({
    default: m.ClientsSection,
  })),
);
const StaffAugmentationSection = lazy(() =>
  import('@/components/layout/home/staff-augmentation/StaffAugmentationSection').then((m) => ({
    default: m.StaffAugmentationSection,
  })),
);
const WhyVadoSection = lazy(() =>
  import('@/components/layout/home/why-vado/WhyVadoSection').then((m) => ({
    default: m.WhyVadoSection,
  })),
);
const CultureAndTalentSection = lazy(() =>
  import('@/components/layout/home/culture-and-talent/CultureAndTalentSection').then((m) => ({
    default: m.CultureAndTalentSection,
  })),
);
const VadoInsightsSection = lazy(() =>
  import('@/components/layout/home/insights/VadoInsightsSection').then((m) => ({
    default: m.VadoInsightsSection,
  })),
);
const FAQSection = lazy(() =>
  import('@/components/layout/home/faq/FAQSection').then((m) => ({
    default: m.FAQSection,
  })),
);
const CtaContactSection = lazy(() =>
  import('@/components/layout/home/cta-contact/CtaContactSection').then((m) => ({
    default: m.CtaContactSection,
  })),
);

function SectionSkeleton() {
  return <div className="bg-muted/15 min-h-[min(36vh,380px)] w-full" aria-hidden />;
}

/**
 * Cada sección bajo el hero es su propio chunk y solo se importa al acercarse al viewport,
 * reduciendo JS en red y en el hilo principal en la primera carga.
 */
export function HomeBelowFold() {
  return (
    <>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <HowWeWorkSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <NearshoreBenefitsBentoSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <DigitalProductsSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <AISolutionsSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <TechStackSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <ClientsSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <StaffAugmentationSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <WhyVadoSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <CultureAndTalentSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <VadoInsightsSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
      </ViewportLazySection>
      <ViewportLazySection>
        <Suspense fallback={<SectionSkeleton />}>
          <CtaContactSection />
        </Suspense>
      </ViewportLazySection>
    </>
  );
}
