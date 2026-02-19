import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import {
  ZENQR_ACCENT,
  ZenqrOverviewSection,
  ZenqrChallengeSection,
  ZenqrSolutionSection,
  ZenqrResultsSection,
  ZenqrCtaSection,
  ZenqrProjectSidebar,
  ZenqrOtherCases,
} from './zenqr';

export function ZenqurCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoSrc="/brands/zenqr.svg"
        logoAlt="ZenQR"
        title={t('ourWork.caseStudy.zenqr.hero.title')}
        description={t('ourWork.caseStudy.zenqr.hero.description')}
        heroImageSrc="/case-studies/zenqr/zenqr-hero.png"
        heroImageAlt={t('ourWork.caseStudy.zenqr.hero.heroImageAlt')}
        backgroundColor={ZENQR_ACCENT}
        backgroundImageSrc="/case-studies/zenqr/bg-hero-zenqr.png"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <ZenqrOverviewSection />
          <img
            src="/case-studies/zenqr/zenqr-slide1.png"
            alt={t('ourWork.caseStudy.zenqr.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <ZenqrChallengeSection />
          <img
            src="/case-studies/zenqr/zenqr-slide2.png"
            alt={t('ourWork.caseStudy.zenqr.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <ZenqrSolutionSection />
          <img
            src="/case-studies/zenqr/zenqr-slide3.png"
            alt={t('ourWork.caseStudy.zenqr.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <ZenqrResultsSection />
          <ZenqrCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <ZenqrProjectSidebar />
        </aside>
      </CenterContainer>

      <ZenqrOtherCases />
    </article>
  );
}
