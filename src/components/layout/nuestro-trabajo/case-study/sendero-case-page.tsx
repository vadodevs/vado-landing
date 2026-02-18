import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { SenderoLogo } from '@/assets/brands/sendero';
import {
  SENDERO_ACCENT,
  SenderoOverviewSection,
  SenderoChallengeSection,
  SenderoSolutionSection,
  SenderoResultsSection,
  SenderoCtaSection,
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
        heroImageSrc="/case-studies/sendero-crm/bg-hero.png"
        heroImageAlt={t('ourWork.caseStudy.sendero.hero.heroImageAlt')}
        backgroundColor={SENDERO_ACCENT}
        backgroundImageSrc="/case-studies/sendero-crm/bg-hero-sendero.png"
      />

      <CenterContainer className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <main className="min-w-0 flex-1">
          <SenderoOverviewSection />
          <img src="/case-studies/sendero-crm/sendero-slide1.png" alt="" />
          <SenderoChallengeSection />
          <img src="/case-studies/sendero-crm/sendero-slide2.png" alt="" />
          <SenderoSolutionSection />
          <img src="/case-studies/sendero-crm/sendero-slide3.png" alt="" />
          <SenderoResultsSection />
          <SenderoCtaSection />
        </main>
        <aside className="w-full shrink-0 pb-4 lg:w-80 lg:self-stretch">
          <SenderoProjectSidebar />
        </aside>
      </CenterContainer>

      <SenderoOtherCases />
    </article>
  );
}
