import { useTranslation, Trans } from 'react-i18next';
import { WashappCaseSection, Accent } from './washapp-case-section';

export function WashappSolutionSection() {
  const { t } = useTranslation();
  return (
    <WashappCaseSection
      label={t('ourWork.caseStudy.washapp.solution.label')}
      title={t('ourWork.caseStudy.washapp.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.washapp.solution.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.washapp.solution.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p className="font-medium text-slate-700">{t('ourWork.caseStudy.washapp.solution.listTitle')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.washapp.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.washapp.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.washapp.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.washapp.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.washapp.solution.list5')}</li>
      </ul>
    </WashappCaseSection>
  );
}
