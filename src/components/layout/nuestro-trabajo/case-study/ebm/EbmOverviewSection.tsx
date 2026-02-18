import { useTranslation, Trans } from 'react-i18next';
import { EbmCaseSection, Accent } from './ebm-case-section';

export function EbmOverviewSection() {
  const { t } = useTranslation();
  return (
    <EbmCaseSection title={t('ourWork.caseStudy.ebm.overview.label')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EbmCaseSection>
  );
}
