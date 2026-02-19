import { useTranslation, Trans } from 'react-i18next';
import { CipresesCaseSection, Accent } from './cipreses-case-section';

export function CipresesOverviewSection() {
  const { t } = useTranslation();
  return (
    <CipresesCaseSection title={t('ourWork.caseStudy.cipreses.overview.title')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.cipreses.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </CipresesCaseSection>
  );
}
