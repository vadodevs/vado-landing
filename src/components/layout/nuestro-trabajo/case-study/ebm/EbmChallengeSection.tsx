import { useTranslation, Trans } from 'react-i18next';
import { EbmCaseSection, Accent } from './ebm-case-section';

export function EbmChallengeSection() {
  const { t } = useTranslation();
  return (
    <EbmCaseSection
      label={t('ourWork.caseStudy.ebm.challenge.label')}
      title={t('ourWork.caseStudy.ebm.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.ebm.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.ebm.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.ebm.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.ebm.challenge.list4')}</li>
        <li>{t('ourWork.caseStudy.ebm.challenge.list5')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EbmCaseSection>
  );
}
