import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import { FaLightbulb, FaPencilRuler, FaCogs, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { CenterContainer } from '@/components/layout/CenterContainer';

const STEP_IDS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

const STEP_ICONS: Record<(typeof STEP_IDS)[number], IconType> = {
  step1: FaLightbulb,
  step2: FaPencilRuler,
  step3: FaCogs,
  step4: FaShieldAlt,
  step5: FaRocket,
};

export function AIProcessSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col lg:max-w-3xl">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
            {t('services.aiSolutions.process.label')}
          </p>
          <h2 className="text-primary text-2xl leading-tight font-bold sm:text-3xl md:text-4xl lg:text-4xl">
            {t('services.aiSolutions.process.title')}
          </h2>
          <p className="text-primary mt-2 text-lg font-semibold sm:text-xl">
            {t('services.aiSolutions.process.subtitle')}
          </p>

          <ul className="mt-8 flex flex-col gap-6 md:mt-10 md:gap-8">
            {STEP_IDS.map((stepId, index) => {
              const Icon = STEP_ICONS[stepId];

              return (
                <li key={stepId} className="flex gap-4 md:gap-6">
                  
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full shadow-md md:h-11 md:w-11">
                      <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
                    </div>
                    {index < STEP_IDS.length - 1 && (
                      <span
                        className="bg-primary/20 mt-2 h-full w-[2px] flex-1 md:w-[3px]"
                        aria-hidden
                      />
                    )}
                  </div>

                  
                  <div className="pb-4">
                    <h3 className="font-semibold text-[#19314c] md:text-lg">
                      {t(`services.aiSolutions.process.steps.${stepId}.title`)}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed md:text-base">
                      {t(`services.aiSolutions.process.steps.${stepId}.description`)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CenterContainer>
    </section>
  );
}
