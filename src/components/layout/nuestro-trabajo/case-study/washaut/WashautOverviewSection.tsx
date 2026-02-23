import { useTranslation, Trans } from 'react-i18next';
import { WashautCaseSection, Accent } from './washaut-case-section';

export function WashautOverviewSection() {
  const { t } = useTranslation();
  return (
    <WashautCaseSection title={t('ourWork.caseStudy.washaut.overview.title')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washaut.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </WashautCaseSection>
  );
}
