import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const VADO_IMAGE_SRC = '/sections-image/vado.png';
const CHECK_ICON_SRC = '/icons/check.svg';

const STEP_IDS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

export function AIProcessSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Texto primero (izquierda): label, título, subtítulo y lista con check */}
          <div className="order-1 flex flex-col lg:max-w-[55%] lg:flex-1 lg:justify-center">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
              {t('services.aiSolutions.process.label')}
            </p>
            <h2 className="text-primary text-2xl leading-tight font-bold sm:text-3xl md:text-4xl lg:text-4xl">
              {t('services.aiSolutions.process.title')}
            </h2>
            <p className="text-primary mt-2 text-lg font-semibold sm:text-xl">
              {t('services.aiSolutions.process.subtitle')}
            </p>
            <ul className="mt-6 flex flex-col gap-4 md:mt-8 md:gap-5">
              {STEP_IDS.map((stepId) => (
                <li key={stepId} className="flex gap-3 md:gap-4">
                  <span className="mt-0.5 shrink-0" aria-hidden>
                    <img src={CHECK_ICON_SRC} alt="" className="h-6 w-6 md:h-7 md:w-7" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#19314c] md:text-lg">
                      {t(`services.aiSolutions.process.steps.${stepId}.title`)}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed md:text-base">
                      {t(`services.aiSolutions.process.steps.${stepId}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Imagen vado.png después (derecha) */}
          <div className="order-2 flex justify-center lg:max-w-[45%] lg:flex-1">
            <div className="relative flex items-center justify-center">
              <img
                src={VADO_IMAGE_SRC}
                alt=""
                className="relative z-1 h-auto w-full max-w-[240px] object-contain object-center md:max-w-[300px] lg:max-w-[380px]"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
