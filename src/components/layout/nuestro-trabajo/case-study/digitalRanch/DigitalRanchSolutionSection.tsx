import { useTranslation, Trans } from 'react-i18next';
import { DigitalRanchCaseSection, Accent } from './digitalRanch-case-section';

export function DigitalRanchSolutionSection() {
  const { t } = useTranslation();
  return (
    <DigitalRanchCaseSection
      label={t('ourWork.caseStudy.digitalRanch.solution.label')}
      title={t('ourWork.caseStudy.digitalRanch.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.solution.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.digitalRanch.solution.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p className="font-medium text-slate-700">
        {t('ourWork.caseStudy.digitalRanch.solution.listTitle')}
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.digitalRanch.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.digitalRanch.solution.list5')}</li>
      </ul>
    </DigitalRanchCaseSection>
  );
}
