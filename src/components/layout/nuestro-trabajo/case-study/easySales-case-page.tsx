import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { EasySalesLogo } from '@/assets/brands/easy-sales';
import {
  EASY_SALES_ACCENT,
  EasySalesOverviewSection,
  EasySalesChallengeSection,
  EasySalesSolutionSection,
  EasySalesResultsSection,
  EasySalesCtaSection,
  EasySalesProjectSidebar,
  EasySalesOtherCases,
} from './easySales';

export function EasySalesCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={
          <EasySalesLogo color="white" className="h-full w-full object-contain object-left" />
        }
        logoAlt={t('ourWork.projects.easySales.title')}
        title={t('ourWork.caseStudy.easySales.hero.title')}
        description={t('ourWork.caseStudy.easySales.hero.description')}
        heroImageSrc="/case-studies/easy-sales/easy-sales-hero.webp"
        heroImageAlt={t('ourWork.caseStudy.easySales.hero.heroImageAlt')}
        backgroundColor={EASY_SALES_ACCENT}
        backgroundImageSrc="/case-studies/easy-sales/bg-hero-easy-sales.webp"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <EasySalesOverviewSection />
          <img
            src="/case-studies/easy-sales/easy-sales-slide1.webp"
            alt={t('ourWork.caseStudy.easySales.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EasySalesChallengeSection />
          <img
            src="/case-studies/easy-sales/easy-sales-slide2.webp"
            alt={t('ourWork.caseStudy.easySales.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EasySalesSolutionSection />
          <img
            src="/case-studies/easy-sales/easy-sales-slide3.webp"
            alt={t('ourWork.caseStudy.easySales.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EasySalesResultsSection />
          <EasySalesCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <EasySalesProjectSidebar />
        </aside>
      </CenterContainer>

      <EasySalesOtherCases />
    </article>
  );
}
