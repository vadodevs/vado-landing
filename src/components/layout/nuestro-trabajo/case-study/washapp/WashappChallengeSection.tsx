import { useTranslation, Trans } from 'react-i18next';
import { WashappCaseSection, Accent } from './washapp-case-section';

export function WashappChallengeSection() {
  const { t } = useTranslation();
  return (
    <WashappCaseSection
      label={t('ourWork.caseStudy.washapp.challenge.label')}
      title={t('ourWork.caseStudy.washapp.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washapp.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.washapp.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.washapp.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.washapp.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.washapp.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washapp.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.washapp.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </WashappCaseSection>
  );
}
