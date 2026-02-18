import { useTranslation, Trans } from 'react-i18next';
import { DigitalRanchCaseSection, Accent } from './digitalRanch-case-section';

export function DigitalRanchResultsSection() {
  const { t } = useTranslation();
  return (
    <DigitalRanchCaseSection
      label={t('ourWork.caseStudy.digitalRanch.results.label')}
      title={t('ourWork.caseStudy.digitalRanch.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.results.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </DigitalRanchCaseSection>
  );
}
