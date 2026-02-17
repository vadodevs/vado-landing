import { useTranslation, Trans } from 'react-i18next';
import { ZenqrCaseSection, Accent } from './zenqr-case-section';

export function ZenqrOverviewSection() {
  const { t } = useTranslation();
  return (
    <ZenqrCaseSection
      label={t('ourWork.caseStudy.zenqr.overview.label')}
      title={t('ourWork.caseStudy.zenqr.overview.title')}
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </ZenqrCaseSection>
  );
}
