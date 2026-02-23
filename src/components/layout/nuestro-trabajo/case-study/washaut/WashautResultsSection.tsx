import { useTranslation, Trans } from 'react-i18next';
import { WashautCaseSection, Accent } from './washaut-case-section';

export function WashautResultsSection() {
  const { t } = useTranslation();
  return (
    <WashautCaseSection
      label={t('ourWork.caseStudy.washaut.results.label')}
      title={t('ourWork.caseStudy.washaut.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.washaut.results.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washaut.results.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washaut.results.paragraph3" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </WashautCaseSection>
  );
}
