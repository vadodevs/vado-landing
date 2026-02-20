import { useTranslation, Trans } from 'react-i18next';
import { SenderoCaseSection, Accent } from './sendero-case-section';

export function SenderoChallengeSection() {
  const { t } = useTranslation();
  return (
    <SenderoCaseSection
      label={t('ourWork.caseStudy.sendero.challenge.label')}
      title={t('ourWork.caseStudy.sendero.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.sendero.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.sendero.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.sendero.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.sendero.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </SenderoCaseSection>
  );
}
