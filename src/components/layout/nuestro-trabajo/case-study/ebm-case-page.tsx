import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { EbmLogo } from '@/assets/brands/ebm';
import { CaseStudyCtaSection } from '@/components/layout/nuestro-trabajo/case-study/CaseStudyCtaSection';
import {
  EBM_ACCENT,
  EbmOverviewSection,
  EbmChallengeSection,
  EbmSolutionSection,
  EbmResultsSection,
  EbmProjectSidebar,
  EbmOtherCases,
} from './ebm';

export function EbmCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={<EbmLogo color="white" className="h-full w-full object-contain object-left" />}
        logoAlt={t('ourWork.projects.ebm.title')}
        title={t('ourWork.caseStudy.ebm.hero.title')}
        description={t('ourWork.caseStudy.ebm.hero.description')}
        heroImageSrc="/case-studies/ebm/ebm-hero.webp"
        heroImageAlt={t('ourWork.caseStudy.ebm.hero.heroImageAlt')}
        backgroundColor={EBM_ACCENT}
        backgroundImageSrc="/case-studies/ebm/bg-hero-ebm.webp"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <EbmOverviewSection />
          <img
            src="/case-studies/ebm/ebm-slide1.webp"
            alt={t('ourWork.caseStudy.ebm.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EbmChallengeSection />
          <img
            src="/case-studies/ebm/ebm-slide2.webp"
            alt={t('ourWork.caseStudy.ebm.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EbmSolutionSection />
          <img
            src="/case-studies/ebm/ebm-slide3.webp"
            alt={t('ourWork.caseStudy.ebm.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <EbmResultsSection />
          <CaseStudyCtaSection caseStudyId="ebm" accentColor={EBM_ACCENT} />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <EbmProjectSidebar />
        </aside>
      </CenterContainer>

      <EbmOtherCases />
    </article>
  );
}
