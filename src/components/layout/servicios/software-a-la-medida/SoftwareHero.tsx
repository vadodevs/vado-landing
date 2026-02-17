import { useTranslation } from 'react-i18next';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';

export function SoftwareHero() {
  const { t } = useTranslation();

  return (
    <ServiceHero
      backgroundImage="/backgrounds/bg-blue.svg"
      titleLine1={t('services.customSoftware.hero.titleLine1')}
      titleLine2={t('services.customSoftware.hero.titleLine2')}
      tagline={t('services.customSoftware.hero.tagline')}
      cta={t('services.customSoftware.hero.cta')}
    />
  );
}
