import { useTranslation, Trans } from 'react-i18next';
import { EasySalesCaseSection, Accent } from './easySales-case-section';

export function EasySalesSolutionSection() {
  const { t } = useTranslation();
  return (
    <EasySalesCaseSection
      label={t('ourWork.caseStudy.easySales.solution.label')}
      title={t('ourWork.caseStudy.easySales.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.solution.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.easySales.solution.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p className="font-medium text-slate-700">
        {t('ourWork.caseStudy.easySales.solution.listTitle')}
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.easySales.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.easySales.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.easySales.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.easySales.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.easySales.solution.list5')}</li>
      </ul>
    </EasySalesCaseSection>
  );
}
