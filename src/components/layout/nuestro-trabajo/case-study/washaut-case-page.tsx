import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { WashAutLogo } from '@/assets/brands/washaut';
import { CaseStudyCtaSection } from '@/components/layout/nuestro-trabajo/case-study/CaseStudyCtaSection';
import {
  WASHAUT_ACCENT,
  WashautOverviewSection,
  WashautChallengeSection,
  WashautSolutionSection,
  WashautResultsSection,
  WashautProjectSidebar,
  WashautOtherCases,
} from './washaut';

/** Imágenes del caso de uso WashAut (public/case-studies/washaut/) */
const WASHAUT_IMAGES = {
  hero: '/case-studies/washaut/bg-hero.webp',
  heroBg: '/case-studies/washaut/bg-hero-washaut.webp',
  slide1: '/case-studies/washaut/washaut-slide1.webp',
  slide2: '/case-studies/washaut/washaut-slide2.webp',
  slide3: '/case-studies/washaut/washaut-slide3.webp',
} as const;

export function WashautCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={<WashAutLogo blanca />}
        logoAlt={t('ourWork.projects.washaut.title')}
        title={t('ourWork.caseStudy.washaut.hero.title')}
        description={t('ourWork.caseStudy.washaut.hero.description')}
        heroImageSrc={WASHAUT_IMAGES.hero}
        heroImageAlt={t('ourWork.caseStudy.washaut.hero.heroImageAlt')}
        backgroundColor={WASHAUT_ACCENT}
        backgroundImageSrc={WASHAUT_IMAGES.heroBg}
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 flex-1">
          <WashautOverviewSection />
          <img
            src={WASHAUT_IMAGES.slide1}
            alt={t('ourWork.caseStudy.washaut.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashautChallengeSection />
          <img
            src={WASHAUT_IMAGES.slide2}
            alt={t('ourWork.caseStudy.washaut.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashautSolutionSection />
          <img
            src={WASHAUT_IMAGES.slide3}
            alt={t('ourWork.caseStudy.washaut.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashautResultsSection />
          <CaseStudyCtaSection caseStudyId="washaut" accentColor={WASHAUT_ACCENT} />
        </div>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <WashautProjectSidebar />
        </aside>
      </CenterContainer>

      <WashautOtherCases />
    </article>
  );
}
