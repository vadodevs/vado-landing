import { useTranslation, Trans } from 'react-i18next';
import { WashautCaseSection, Accent } from './washaut-case-section';

export function WashautChallengeSection() {
  const { t } = useTranslation();
  return (
    <WashautCaseSection
      label={t('ourWork.caseStudy.washaut.challenge.label')}
      title={t('ourWork.caseStudy.washaut.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washaut.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.washaut.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.washaut.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.washaut.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.washaut.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washaut.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washaut.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </WashautCaseSection>
  );
}
