import { useTranslation, Trans } from 'react-i18next';
import { SenderoCaseSection, Accent } from './sendero-case-section';

export function SenderoResultsSection() {
  const { t } = useTranslation();
  return (
    <SenderoCaseSection
      label={t('ourWork.caseStudy.sendero.results.label')}
      title={t('ourWork.caseStudy.sendero.results.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.results.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.results.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.results.paragraph3"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </SenderoCaseSection>
  );
}
