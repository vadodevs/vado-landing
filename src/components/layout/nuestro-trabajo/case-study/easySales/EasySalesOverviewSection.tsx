import { useTranslation, Trans } from 'react-i18next';
import { EasySalesCaseSection, Accent } from './easySales-case-section';

export function EasySalesOverviewSection() {
  const { t } = useTranslation();
  return (
    <EasySalesCaseSection title={t('ourWork.caseStudy.easySales.overview.title')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EasySalesCaseSection>
  );
}
