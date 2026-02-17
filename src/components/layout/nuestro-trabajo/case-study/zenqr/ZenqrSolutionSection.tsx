import { useTranslation, Trans } from 'react-i18next';
import { ZenqrCaseSection, Accent } from './zenqr-case-section';

export function ZenqrSolutionSection() {
  const { t } = useTranslation();
  return (
    <ZenqrCaseSection
      label={t('ourWork.caseStudy.zenqr.solution.label')}
      title={t('ourWork.caseStudy.zenqr.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.solution.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.zenqr.solution.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p className="font-medium text-slate-700">
        {t('ourWork.caseStudy.zenqr.solution.listTitle')}
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.zenqr.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.zenqr.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.zenqr.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.zenqr.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.zenqr.solution.list5')}</li>
      </ul>
    </ZenqrCaseSection>
  );
}
