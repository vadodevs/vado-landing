import { useTranslation, Trans } from 'react-i18next';
import { EasySalesCaseSection, Accent } from './easySales-case-section';

export function EasySalesResultsSection() {
  const { t } = useTranslation();
  return (
    <EasySalesCaseSection
      label={t('ourWork.caseStudy.easySales.results.label')}
      title={t('ourWork.caseStudy.easySales.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.results.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EasySalesCaseSection>
  );
}
