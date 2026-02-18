import { useTranslation, Trans } from 'react-i18next';
import { EbmCaseSection, Accent } from './ebm-case-section';

export function EbmResultsSection() {
  const { t } = useTranslation();
  return (
    <EbmCaseSection
      label={t('ourWork.caseStudy.ebm.results.label')}
      title={t('ourWork.caseStudy.ebm.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.results.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EbmCaseSection>
  );
}
