import { useTranslation, Trans } from 'react-i18next';
import { EasySalesCaseSection, Accent } from './easySales-case-section';

export function EasySalesChallengeSection() {
  const { t } = useTranslation();
  return (
    <EasySalesCaseSection
      label={t('ourWork.caseStudy.easySales.challenge.label')}
      title={t('ourWork.caseStudy.easySales.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>{t('ourWork.caseStudy.easySales.challenge.intro')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.easySales.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.easySales.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.easySales.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.easySales.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EasySalesCaseSection>
  );
}
