import { useTranslation } from 'react-i18next';
import { ProjectCaseStudyTemplate } from '@/components/layout/nuestro-trabajo/ProjectCaseStudyTemplate';
import { getCaseStudyConfig } from '@/components/layout/nuestro-trabajo/caseStudyConfigs';

/** Caso de uso ZenQR — usa el template compartido con config desde caseStudyConfigs */
export function ProjectCaseStudyZenQR() {
  const { t } = useTranslation();
  const config = getCaseStudyConfig('zenqur', t);
  if (!config) return null;
  return <ProjectCaseStudyTemplate config={config} />;
}
