import { useTranslation, Trans } from 'react-i18next';
import { EbmCaseSection, Accent } from './ebm-case-section';

export function EbmSolutionSection() {
  const { t } = useTranslation();
  return (
    <EbmCaseSection
      label={t('ourWork.caseStudy.ebm.solution.label')}
      title={t('ourWork.caseStudy.ebm.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.solution.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p className="font-medium text-slate-700">{t('ourWork.caseStudy.ebm.solution.listTitle')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.ebm.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.ebm.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.ebm.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.ebm.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.ebm.solution.list5')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.ebm.solution.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </EbmCaseSection>
  );
}
