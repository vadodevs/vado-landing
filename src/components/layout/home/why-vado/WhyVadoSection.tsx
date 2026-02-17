import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { FeatureCardsSectionLayout } from '../FeatureCardsSectionLayout';
import { useLocale } from '@/hooks/useLocale';

export function WhyVadoSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <FeatureCardsSectionLayout
          mainCard={{
            variant: 'main',
            iconSrc: '/icons/hands.svg',
            iconAlt: t('home.whyVado.mainIconAlt'),
            preHeading: t('home.whyVado.preHeading'),
            titlePart1: t('home.whyVado.titlePart1'),
            titlePart2: t('home.whyVado.titlePart2'),
            description: t('home.whyVado.description'),
            primaryButton: {
              label: t('home.whyVado.startProject'),
              href: path('/contacto'),
            },
            secondaryButton: {
              label: t('home.whyVado.moreInfo'),
              href: path('/servicios/desarrollo'),
            },
          }}
          subCards={[
            {
              variant: 'sub',
              iconSrc: '/icons/shine.svg',
              iconAlt: t('home.whyVado.sub1IconAlt'),
              description: t('home.whyVado.sub1Description'),
            },
            {
              variant: 'sub',
              iconSrc: '/icons/doc.svg',
              iconAlt: t('home.whyVado.sub2IconAlt'),
              description: t('home.whyVado.sub2Description'),
            },
          ]}
        />
      </CenterContainer>
    </section>
  );
}
