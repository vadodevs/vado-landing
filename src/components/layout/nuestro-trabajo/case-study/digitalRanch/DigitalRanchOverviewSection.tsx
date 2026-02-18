import { useTranslation, Trans } from 'react-i18next';
import { DigitalRanchCaseSection, Accent } from './digitalRanch-case-section';

export function DigitalRanchOverviewSection() {
  const { t } = useTranslation();
  return (
    <DigitalRanchCaseSection
      title={t('ourWork.caseStudy.digitalRanch.overview.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </DigitalRanchCaseSection>
  );
}
