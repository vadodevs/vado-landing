import { useTranslation } from 'react-i18next';
import { CardFeatureSection } from '@/components/layout/CardFeatureSection';
import { useLocale } from '@/hooks/useLocale';

export function AISolutionsSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <CardFeatureSection
      label={t('home.aiSolutions.label')}
      title={t('home.aiSolutions.title')}
      description={t('home.aiSolutions.description')}
      primaryButton={{
        label: t('home.aiSolutions.startProject'),
        href: path('/contact'),
      }}
      secondaryButton={{
        label: t('home.aiSolutions.moreInfo'),
        href: path('/services/ai-solutions'),
      }}
      rightContent={
        <img
          src="/home-assets/mockup-landing.png"
          alt=""
          className="h-auto w-full max-w-full object-contain"
        />
      }
      backgroundAlt={t('home.aiSolutions.bgAlt')}
      className="py-8"
    />
  );
}
