import { useTranslation, Trans } from 'react-i18next';
import { ZenqrCaseSection, Accent } from './zenqr-case-section';

export function ZenqrChallengeSection() {
  const { t } = useTranslation();
  return (
    <ZenqrCaseSection
      label={t('ourWork.caseStudy.zenqr.challenge.label')}
      title={t('ourWork.caseStudy.zenqr.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.challenge.intro"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.zenqr.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.zenqr.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.zenqr.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.zenqr.challenge.list4')}</li>
        <li>{t('ourWork.caseStudy.zenqr.challenge.list5')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </ZenqrCaseSection>
  );
}
