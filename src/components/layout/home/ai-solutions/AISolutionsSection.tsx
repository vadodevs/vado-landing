import { useTranslation } from 'react-i18next';
import { CardFeatureSection } from '@/components/layout/CardFeatureSection';
import { MacbookMockup } from '@/components/ui/macbook-mockup';
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
        href: path('/contacto'),
      }}
      secondaryButton={{
        label: t('home.aiSolutions.moreInfo'),
        href: path('/servicios/soluciones-ia'),
      }}
      rightContent={
        <MacbookMockup>
          <div className="relative h-50 w-full overflow-hidden rounded-t-[8px] border-2 border-solid border-[rgb(18,18,18)] bg-white md:h-75 lg:h-70">
            <img
              src="/home-assets/home-bg-mockup.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
        </MacbookMockup>
      }
      backgroundAlt={t('home.aiSolutions.bgAlt')}
      className="py-8"
    />
  );
}
