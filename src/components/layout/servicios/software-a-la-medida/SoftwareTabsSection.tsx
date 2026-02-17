import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceTabsSection } from '@/components/layout/servicios/ServiceTabsSection';

const TAB_IDS = [
  'appsMvps',
  'sitiosWeb',
  'crm',
  'digitalizacion',
  'erp',
  'metaMensajeria',
] as const;

export function SoftwareTabsSection() {
  const { t } = useTranslation();

  const tabs = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label: t(`services.customSoftware.tabs.${id}.label`),
        title: t(`services.customSoftware.tabs.${id}.title`),
        description: t(`services.customSoftware.tabs.${id}.description`),
      })),
    [t]
  );

  return (
    <ServiceTabsSection
      tabs={tabs}
      ctaText={t('services.customSoftware.hero.cta')}
    />
  );
}
