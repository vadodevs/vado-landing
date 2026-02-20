import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const CHECK_ICON_SRC = '/icons/check.svg';
const IMAGE_SRC = '/team-vado/vado-team-12.webp';

const STEP_IDS = ['step1', 'step2', 'step3', 'step4'] as const;

export function StaffAugmentationProcessSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Izquierda: label, título y lista con checks */}
          <div className="order-1 flex flex-col lg:max-w-[55%] lg:flex-1 lg:justify-center">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
              {t('services.staffAugmentation.process.label')}
            </p>
            <h2 className="text-2xl leading-tight font-bold text-[#19314c] sm:text-3xl md:text-4xl lg:text-4xl">
              {t('services.staffAugmentation.process.titlePart1')}{' '}
              <span className="text-primary">
                {t('services.staffAugmentation.process.titlePart2')}
              </span>
            </h2>
            <ul className="mt-6 flex flex-col gap-4 md:mt-8 md:gap-5">
              {STEP_IDS.map((stepId) => (
                <li key={stepId} className="flex gap-3 md:gap-4">
                  <span className="mt-0.5 shrink-0" aria-hidden>
                    <img src={CHECK_ICON_SRC} alt="" className="h-6 w-6 md:h-7 md:w-7" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#19314c] md:text-lg">
                      {t(`services.staffAugmentation.process.steps.${stepId}.title`)}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed md:text-base">
                      {t(`services.staffAugmentation.process.steps.${stepId}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-2 flex w-full justify-center lg:max-w-[45%] lg:flex-1">
            <div className="relative aspect-[4/3] w-full min-w-0 max-w-[300px] overflow-hidden rounded-2xl border border-[#19314c]/10 bg-[#19314c]/5 shadow-lg shadow-[#19314c]/15 md:max-w-[360px] lg:max-w-[420px]">
              <img
                src={IMAGE_SRC}
                alt=""
                className="h-full w-full object-cover object-center"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
