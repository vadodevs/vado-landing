import { useTranslation, Trans } from 'react-i18next';
import { CipresesCaseSection, Accent } from './cipreses-case-section';

export function CipresesResultsSection() {
  const { t } = useTranslation();
  return (
    <CipresesCaseSection
      label={t('ourWork.caseStudy.cipreses.results.label')}
      title={t('ourWork.caseStudy.cipreses.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.cipreses.results.paragraph" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </CipresesCaseSection>
  );
}
