import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const V_KEYS = ['v1', 'v2', 'v3', 'v4', 'v5'] as const;

const DEFAULT_IMAGE_1 = '/sections-image/coworking.png';
const DEFAULT_IMAGE_2 = '/sections-image/vado.png';

export function FiveVsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Left: text content */}
          <div className="flex-1 lg:max-w-xl">
            <p className="mb-2 text-xs font-semibold tracking-wider text-[#19314c] uppercase md:text-sm">
              {t('cultureYTalentoPage.fiveVs.subtitle')}
            </p>
            <h2 className="text-primary mb-8 text-2xl leading-tight font-bold md:text-3xl lg:text-4xl">
              {t('cultureYTalentoPage.fiveVs.title')}
            </h2>
            <ul className="flex flex-col gap-6">
              {V_KEYS.map((key) => (
                <li key={key}>
                  <h3 className="mb-1.5 text-lg font-bold text-[#19314C] md:text-xl">
                    {t(`cultureYTalentoPage.fiveVs.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#19314c]/90 md:text-base">
                    {t(`cultureYTalentoPage.fiveVs.${key}.description`)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full shrink-0 lg:min-h-[340px] lg:w-[420px]">
            <div className="flex flex-col gap-4 sm:gap-6 lg:relative lg:min-h-[340px]">
              <div className="border-border bg-muted aspect-video w-full overflow-hidden rounded-xl border lg:absolute lg:top-0 lg:right-0 lg:w-[85%]">
                <img
                  src={DEFAULT_IMAGE_1}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="border-border bg-muted aspect-video w-full overflow-hidden rounded-xl border lg:absolute lg:bottom-0 lg:left-0 lg:z-10 lg:w-[85%]">
                <img
                  src={DEFAULT_IMAGE_2}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
