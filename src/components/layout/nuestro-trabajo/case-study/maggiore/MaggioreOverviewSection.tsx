import { useTranslation, Trans } from 'react-i18next';
import { MaggioreCaseSection, Accent } from './maggiore-case-section';

export function MaggioreOverviewSection() {
  const { t } = useTranslation();
  return (
    <MaggioreCaseSection title={t('ourWork.caseStudy.maggiore.overview.title')} variant="minimal">
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.maggiore.overview.paragraph"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </MaggioreCaseSection>
  );
}
