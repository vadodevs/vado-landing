import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { MaggioreLogo } from '@/assets/brands/maggiore';
import { CaseStudyCtaSection } from '@/components/layout/nuestro-trabajo/case-study/CaseStudyCtaSection';
import {
  MAGGIORE_ACCENT,
  MaggioreOverviewSection,
  MaggioreChallengeSection,
  MaggioreSolutionSection,
  MaggioreResultsSection,
  MaggioreProjectSidebar,
  MaggioreOtherCases,
} from './maggiore';

export function MaggioreCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={<MaggioreLogo color="white" />}
        logoAlt={t('ourWork.projects.maggiore.title')}
        title={t('ourWork.caseStudy.maggiore.hero.title')}
        description={t('ourWork.caseStudy.maggiore.hero.description')}
        heroImageSrc="/case-studies/maggiore/bg-hero.webp"
        heroImageAlt={t('ourWork.caseStudy.maggiore.hero.heroImageAlt')}
        backgroundColor={MAGGIORE_ACCENT}
        backgroundImageSrc="/case-studies/maggiore/bg-hero-maggiore.webp"
        backgroundOverlayOpacity={0.12}
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <MaggioreOverviewSection />
          <img
            src="/case-studies/maggiore/maggiore-slide1.webp"
            alt={t('ourWork.caseStudy.maggiore.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <MaggioreChallengeSection />
          <img
            src="/case-studies/maggiore/maggiore-slide2.webp"
            alt={t('ourWork.caseStudy.maggiore.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <MaggioreSolutionSection />
          <img
            src="/case-studies/maggiore/maggiore-slide3.webp"
            alt={t('ourWork.caseStudy.maggiore.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <MaggioreResultsSection />
          <CaseStudyCtaSection caseStudyId="maggiore" accentColor={MAGGIORE_ACCENT} />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <MaggioreProjectSidebar />
        </aside>
      </CenterContainer>

      <MaggioreOtherCases />
    </article>
  );
}
