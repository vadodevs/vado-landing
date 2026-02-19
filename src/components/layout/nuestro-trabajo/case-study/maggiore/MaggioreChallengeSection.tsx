import { useTranslation, Trans } from 'react-i18next';
import { MaggioreCaseSection, Accent } from './maggiore-case-section';

export function MaggioreChallengeSection() {
  const { t } = useTranslation();
  return (
    <MaggioreCaseSection
      label={t('ourWork.caseStudy.maggiore.challenge.label')}
      title={t('ourWork.caseStudy.maggiore.challenge.title')}
      reverse
      variant="minimal"
    >
      <p>{t('ourWork.caseStudy.maggiore.challenge.intro')}</p>
      <ul className="list-inside list-disc space-y-2 pl-2">
        <li>{t('ourWork.caseStudy.maggiore.challenge.list1')}</li>
        <li>{t('ourWork.caseStudy.maggiore.challenge.list2')}</li>
        <li>{t('ourWork.caseStudy.maggiore.challenge.list3')}</li>
        <li>{t('ourWork.caseStudy.maggiore.challenge.list4')}</li>
      </ul>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.maggiore.challenge.afterList"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
      <p>
        <Trans
          i18nKey="ourWork.caseStudy.maggiore.challenge.closing"
          components={{ accent: <Accent>{''}</Accent> }}
        />
      </p>
    </MaggioreCaseSection>
  );
}
