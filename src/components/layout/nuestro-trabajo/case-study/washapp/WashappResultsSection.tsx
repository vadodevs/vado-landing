import { useTranslation, Trans } from 'react-i18next';
import { WashappCaseSection, Accent } from './washapp-case-section';

export function WashappResultsSection() {
  const { t } = useTranslation();
  return (
    <WashappCaseSection
      label={t('ourWork.caseStudy.washapp.results.label')}
      title={t('ourWork.caseStudy.washapp.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.washapp.results.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washapp.results.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washapp.results.paragraph3" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </WashappCaseSection>
  );
}
