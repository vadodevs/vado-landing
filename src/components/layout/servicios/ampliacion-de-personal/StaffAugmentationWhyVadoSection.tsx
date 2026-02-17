import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { FeatureCardsSectionLayout } from '@/components/layout/home/FeatureCardsSectionLayout';
import { useLocale } from '@/hooks/useLocale';

export function StaffAugmentationWhyVadoSection() {
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
            iconAlt: t('services.staffAugmentation.whyVado.mainIconAlt'),
            preHeading: t('services.staffAugmentation.whyVado.preHeading'),
            titlePart1: t('services.staffAugmentation.whyVado.titlePart1'),
            titlePart2: t('services.staffAugmentation.whyVado.titlePart2'),
            description: t('services.staffAugmentation.whyVado.description'),
            descriptionPart2: t('services.staffAugmentation.whyVado.descriptionPart2'),
            primaryButton: {
              label: t('services.staffAugmentation.whyVado.startProject'),
              href: path('/contacto'),
            },
          }}
          subCards={[
            {
              variant: 'sub',
              appearance: 'default',
              iconSrc: '/icons/shine.svg',
              iconAlt: t('services.staffAugmentation.whyVado.sub1IconAlt'),
              description: t('services.staffAugmentation.whyVado.sub1Description'),
            },
            {
              variant: 'sub',
              appearance: 'darkSub',
              iconSrc: '/icons/doc.svg',
              iconAlt: t('services.staffAugmentation.whyVado.sub2IconAlt'),
              description: t('services.staffAugmentation.whyVado.sub2Description'),
            },
          ]}
        />
      </CenterContainer>
    </section>
  );
}
