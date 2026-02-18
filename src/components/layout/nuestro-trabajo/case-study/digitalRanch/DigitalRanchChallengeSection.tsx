import { useTranslation, Trans } from 'react-i18next';
import { DigitalRanchCaseSection, Accent } from './digitalRanch-case-section';

export function DigitalRanchChallengeSection() {
  const { t } = useTranslation();
  return (
    <DigitalRanchCaseSection
      label={t('ourWork.caseStudy.digitalRanch.challenge.label')}
      title={t('ourWork.caseStudy.digitalRanch.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>{t('ourWork.caseStudy.digitalRanch.challenge.intro')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.digitalRanch.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </DigitalRanchCaseSection>
  );
}
