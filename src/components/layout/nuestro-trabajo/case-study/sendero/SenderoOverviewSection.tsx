import { useTranslation, Trans } from 'react-i18next';
import { SenderoCaseSection, Accent } from './sendero-case-section';

export function SenderoOverviewSection() {
  const { t } = useTranslation();
  return (
    <SenderoCaseSection
      title={t('ourWork.caseStudy.sendero.overview.label')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </SenderoCaseSection>
  );
}
