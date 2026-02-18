import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { DigitalRanchLogo } from '@/assets/brands/digital-ranch';
import {
  DIGITAL_RANCH_ACCENT,
  DigitalRanchOverviewSection,
  DigitalRanchChallengeSection,
  DigitalRanchSolutionSection,
  DigitalRanchResultsSection,
  DigitalRanchCtaSection,
  DigitalRanchProjectSidebar,
  DigitalRanchOtherCases,
} from './digitalRanch';

export function DigitalRanchCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={
          <DigitalRanchLogo color="white" className="h-full w-full object-contain object-left" />
        }
        logoAlt={t('ourWork.projects.digitalRanch.title')}
        title={t('ourWork.caseStudy.digitalRanch.hero.title')}
        description={t('ourWork.caseStudy.digitalRanch.hero.description')}
        heroImageSrc="/projects/digital-ranch.png"
        heroImageAlt={t('ourWork.caseStudy.digitalRanch.hero.heroImageAlt')}
        backgroundColor={DIGITAL_RANCH_ACCENT}
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <DigitalRanchOverviewSection />
          <DigitalRanchChallengeSection />
          <DigitalRanchSolutionSection />
          <DigitalRanchResultsSection />
          <DigitalRanchCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <DigitalRanchProjectSidebar />
        </aside>
      </CenterContainer>

      <DigitalRanchOtherCases />
    </article>
  );
}
