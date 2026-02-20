import { useTranslation, Trans } from 'react-i18next';
import { SenderoCaseSection, Accent } from './sendero-case-section';

export function SenderoSolutionSection() {
  const { t } = useTranslation();
  return (
    <SenderoCaseSection
      label={t('ourWork.caseStudy.sendero.solution.label')}
      title={t('ourWork.caseStudy.sendero.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.solution.paragraph1"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p className="font-medium text-slate-700">
        {t('ourWork.caseStudy.sendero.solution.listTitle')}
      </p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.sendero.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.sendero.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.sendero.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.sendero.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.sendero.solution.list5')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.sendero.solution.paragraph2"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </SenderoCaseSection>
  );
}
