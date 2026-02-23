import { useTranslation, Trans } from 'react-i18next';
import { WashautCaseSection, Accent } from './washaut-case-section';

export function WashautSolutionSection() {
  const { t } = useTranslation();
  return (
    <WashautCaseSection
      label={t('ourWork.caseStudy.washaut.solution.label')}
      title={t('ourWork.caseStudy.washaut.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.washaut.solution.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p className="font-medium text-slate-700">{t('ourWork.caseStudy.washaut.solution.listTitle')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.washaut.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.washaut.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.washaut.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.washaut.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.washaut.solution.list5')}</li>
        <li>{t('ourWork.caseStudy.washaut.solution.list6')}</li>
      </ul>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washaut.solution.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </WashautCaseSection>
  );
}
