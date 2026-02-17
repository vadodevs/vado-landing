import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ServiceTabsSection } from '@/components/layout/servicios/ServiceTabsSection';

const TAB_IDS = [
  'aprendizajeInteligente',
  'visionComputadora',
  'nlp',
  'analisisPredicciones',
  'automatizacionProcesos',
] as const;

export function AISolutionsTabsSection() {
  const { t } = useTranslation();

  const tabs = useMemo(
    () =>
      TAB_IDS.map((id) => ({
        id,
        label: t(`services.aiSolutions.solutions.tabs.${id}.label`),
        title: t(`services.aiSolutions.solutions.tabs.${id}.title`),
        description: t(`services.aiSolutions.solutions.tabs.${id}.description`),
      })),
    [t],
  );

  return (
    <ServiceTabsSection
      tabs={tabs}
      ctaText={t('services.aiSolutions.solutions.cta')}
      label={t('services.aiSolutions.solutions.label')}
      titlePart1={t('services.aiSolutions.solutions.titlePart1')}
      titlePart2={t('services.aiSolutions.solutions.titlePart2')}
      description={t('services.aiSolutions.solutions.description')}
      tabLabelWrap
    />
  );
}
