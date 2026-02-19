import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { WashAppLogo } from '@/assets/brands/washapp';
import {
  WASHAPP_ACCENT,
  WashappOverviewSection,
  WashappChallengeSection,
  WashappSolutionSection,
  WashappResultsSection,
  WashappCtaSection,
  WashappProjectSidebar,
  WashappOtherCases,
} from './washapp';

export function WashappCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={<WashAppLogo />}
        logoAlt={t('ourWork.projects.washapp.title')}
        title={t('ourWork.caseStudy.washapp.hero.title')}
        description={t('ourWork.caseStudy.washapp.hero.description')}
        heroImageSrc="/case-studies/washapp/bg-hero.png"
        heroImageAlt={t('ourWork.caseStudy.washapp.hero.heroImageAlt')}
        backgroundColor={WASHAPP_ACCENT}
        backgroundImageSrc="/case-studies/washapp/bg-hero-washapp.png"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <WashappOverviewSection />
          <img
            src="/case-studies/washapp/washapp-slide1.png"
            alt={t('ourWork.caseStudy.washapp.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashappChallengeSection />
          <img
            src="/case-studies/washapp/washapp-slide2.png"
            alt={t('ourWork.caseStudy.washapp.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashappSolutionSection />
          <img
            src="/case-studies/washapp/washapp-slide3.png"
            alt={t('ourWork.caseStudy.washapp.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <WashappResultsSection />
          <WashappCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <WashappProjectSidebar />
        </aside>
      </CenterContainer>

      <WashappOtherCases />
    </article>
  );
}
