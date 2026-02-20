import { useTranslation, Trans } from 'react-i18next';
import { CipresesCaseSection, Accent } from './cipreses-case-section';

export function CipresesSolutionSection() {
  const { t } = useTranslation();
  return (
    <CipresesCaseSection
      label={t('ourWork.caseStudy.cipreses.solution.label')}
      title={t('ourWork.caseStudy.cipreses.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.cipreses.solution.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p className="font-medium text-slate-700">{t('ourWork.caseStudy.cipreses.solution.listTitle')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.cipreses.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.cipreses.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.cipreses.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.cipreses.solution.list4')}</li>
        {t('ourWork.caseStudy.cipreses.solution.list5') ? <li>{t('ourWork.caseStudy.cipreses.solution.list5')}</li> : null}
      </ul>
      <p>
        <Trans i18nKey="ourWork.caseStudy.cipreses.solution.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
    </CipresesCaseSection>
  );
}
