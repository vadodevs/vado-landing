import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { CipresesLogo } from '@/assets/brands/cipreses';
import {
  CIPRESES_ACCENT,
  CipresesOverviewSection,
  CipresesChallengeSection,
  CipresesSolutionSection,
  CipresesResultsSection,
  CipresesCtaSection,
  CipresesProjectSidebar,
  CipresesOtherCases,
} from './cipreses';

export function CipresesCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={
          <CipresesLogo color="white" className="h-full w-full object-contain object-left" />
        }
        logoAlt={t('ourWork.projects.cipreses.title')}
        title={t('ourWork.caseStudy.cipreses.hero.title')}
        description={t('ourWork.caseStudy.cipreses.hero.description')}
        heroImageSrc="/case-studies/criadero-cipreses/criadero-hero.webp"
        heroImageAlt={t('ourWork.caseStudy.cipreses.hero.heroImageAlt')}
        backgroundColor={CIPRESES_ACCENT}
        backgroundImageSrc="/case-studies/criadero-cipreses/bg-hero-criadero.webp"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <CipresesOverviewSection />
          <img
            src="/case-studies/criadero-cipreses/criadero-slide1.webp"
            alt={t('ourWork.caseStudy.cipreses.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <CipresesChallengeSection />
          <img
            src="/case-studies/criadero-cipreses/criadero-slide2.webp"
            alt={t('ourWork.caseStudy.cipreses.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <CipresesSolutionSection />
          <img
            src="/case-studies/criadero-cipreses/criadero-slide3.webp"
            alt={t('ourWork.caseStudy.cipreses.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <CipresesResultsSection />
          <CipresesCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <CipresesProjectSidebar />
        </aside>
      </CenterContainer>

      <CipresesOtherCases />
    </article>
  );
}
