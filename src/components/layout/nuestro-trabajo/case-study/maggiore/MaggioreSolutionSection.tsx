import { useTranslation, Trans } from 'react-i18next';
import { MaggioreCaseSection, Accent } from './maggiore-case-section';

export function MaggioreSolutionSection() {
  const { t } = useTranslation();
  return (
    <MaggioreCaseSection
      label={t('ourWork.caseStudy.maggiore.solution.label')}
      title={t('ourWork.caseStudy.maggiore.solution.title')}
      variant="minimal"
    >
      <p>
        <Trans i18nKey="ourWork.caseStudy.maggiore.solution.paragraph1" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p>
        <Trans i18nKey="ourWork.caseStudy.maggiore.solution.paragraph2" components={{ accent: <Accent>{''}</Accent> }} />
      </p>
      <p className="font-medium text-slate-700">{t('ourWork.caseStudy.maggiore.solution.listTitle')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.maggiore.solution.list1')}</li>
        <li>{t('ourWork.caseStudy.maggiore.solution.list2')}</li>
        <li>{t('ourWork.caseStudy.maggiore.solution.list3')}</li>
        <li>{t('ourWork.caseStudy.maggiore.solution.list4')}</li>
        <li>{t('ourWork.caseStudy.maggiore.solution.list5')}</li>
      </ul>
    </MaggioreCaseSection>
  );
}
