import { useTranslation, Trans } from 'react-i18next';
import { CipresesCaseSection, Accent } from './cipreses-case-section';

export function CipresesChallengeSection() {
  const { t } = useTranslation();
  return (
    <CipresesCaseSection
      label={t('ourWork.caseStudy.cipreses.challenge.label')}
      title={t('ourWork.caseStudy.cipreses.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.cipreses.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.cipreses.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.cipreses.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.cipreses.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.cipreses.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.cipreses.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.cipreses.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </CipresesCaseSection>
  );
}
