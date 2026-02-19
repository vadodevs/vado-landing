import { useTranslation, Trans } from 'react-i18next';
import { MaggioreCaseSection, Accent } from './maggiore-case-section';

export function MaggioreResultsSection() {
  const { t } = useTranslation();
  return (
    <MaggioreCaseSection
      label={t('ourWork.caseStudy.maggiore.results.label')}
      title={t('ourWork.caseStudy.maggiore.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.maggiore.results.paragraph" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </MaggioreCaseSection>
  );
}
