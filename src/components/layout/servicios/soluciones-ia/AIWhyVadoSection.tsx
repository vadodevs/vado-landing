import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { FeatureCardsSectionLayout } from '@/components/layout/home/FeatureCardsSectionLayout';
import { useLocale } from '@/hooks/useLocale';

export function AIWhyVadoSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <FeatureCardsSectionLayout
          mainCard={{
            variant: 'main',
            appearance: 'darkMain',
            iconSrc: '/icons/hands.svg',
            iconAlt: t('services.aiSolutions.whyVado.mainIconAlt'),
            preHeading: t('services.aiSolutions.whyVado.preHeading'),
            titlePart1: t('services.aiSolutions.whyVado.titlePart1'),
            titlePart2: t('services.aiSolutions.whyVado.titlePart2'),
            description: t('services.aiSolutions.whyVado.description'),
            descriptionPart2: t('services.aiSolutions.whyVado.descriptionPart2'),
            primaryButton: {
              label: t('services.aiSolutions.whyVado.startProject'),
              href: path('/contacto'),
            },
          }}
          subCards={[
            {
              variant: 'sub',
              iconSrc: '/icons/shine.svg',
              iconAlt: t('services.aiSolutions.whyVado.sub1IconAlt'),
              description: t('services.aiSolutions.whyVado.sub1Description'),
            },
            {
              variant: 'sub',
              appearance: 'darkSub',
              iconSrc: '/icons/doc.svg',
              iconAlt: t('services.aiSolutions.whyVado.sub2IconAlt'),
              description: t('services.aiSolutions.whyVado.sub2Description'),
            },
          ]}
        />
      </CenterContainer>
    </section>
  );
}
