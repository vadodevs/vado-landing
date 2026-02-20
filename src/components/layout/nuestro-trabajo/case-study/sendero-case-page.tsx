import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { SenderoLogo } from '@/assets/brands/sendero';
import { CaseStudyCtaSection } from '@/components/layout/nuestro-trabajo/case-study/CaseStudyCtaSection';
import {
  SENDERO_ACCENT,
  SenderoOverviewSection,
  SenderoChallengeSection,
  SenderoSolutionSection,
  SenderoResultsSection,
  SenderoProjectSidebar,
  SenderoOtherCases,
} from './sendero';

export function SenderoCasePage() {
  const { t } = useTranslation();

  return (
    <article className="bg-background relative">
      <ProjectHero
        logoNode={
          <SenderoLogo color="white" className="h-full w-full object-contain object-left" />
        }
        logoAlt={t('ourWork.projects.sendero.title')}
        title={t('ourWork.caseStudy.sendero.hero.title')}
        description={t('ourWork.caseStudy.sendero.hero.description')}
        heroImageSrc="/case-studies/sendero-crm/bg-hero.webp"
        heroImageAlt={t('ourWork.caseStudy.sendero.hero.heroImageAlt')}
        backgroundColor={SENDERO_ACCENT}
        backgroundImageSrc="/case-studies/sendero-crm/bg-hero-sendero.webp"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <SenderoOverviewSection />
          <img
            src="/case-studies/sendero-crm/sendero-slide1.webp"
            alt={t('ourWork.caseStudy.sendero.slides.slide1Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <SenderoChallengeSection />
          <img
            src="/case-studies/sendero-crm/sendero-slide2.webp"
            alt={t('ourWork.caseStudy.sendero.slides.slide2Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <SenderoSolutionSection />
          <img
            src="/case-studies/sendero-crm/sendero-slide3.webp"
            alt={t('ourWork.caseStudy.sendero.slides.slide3Alt')}
            className="h-auto w-full rounded-2xl object-cover"
          />
          <SenderoResultsSection />
          <CaseStudyCtaSection caseStudyId="sendero" accentColor={SENDERO_ACCENT} />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <SenderoProjectSidebar />
        </aside>
      </CenterContainer>

      <SenderoOtherCases />
    </article>
  );
}
