import { useTranslation, Trans } from 'react-i18next';
import { WashappCaseSection, Accent } from './washapp-case-section';

export function WashappOverviewSection() {
  const { t } = useTranslation();
  return (
    <WashappCaseSection title={t('ourWork.caseStudy.washapp.overview.title')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washapp.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </WashappCaseSection>
  );
}
