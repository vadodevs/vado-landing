import { useTranslation, Trans } from 'react-i18next';
import { ZenqrCaseSection, Accent } from './zenqr-case-section';

export function ZenqrResultsSection() {
  const { t } = useTranslation();
  return (
    <ZenqrCaseSection
      label={t('ourWork.caseStudy.zenqr.results.label')}
      title={t('ourWork.caseStudy.zenqr.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.results.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.results.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.results.paragraph3"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </ZenqrCaseSection>
  );
}
