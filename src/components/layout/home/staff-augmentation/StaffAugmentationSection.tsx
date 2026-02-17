import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

export function StaffAugmentationSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="relative w-full overflow-hidden py-12 md:py-16 lg:py-20">
      <img
        src="/backgrounds/rectangles.png"
        alt=""
        className="absolute inset-0 left-1/2 h-auto w-140 -translate-x-1/2 object-cover object-center"
        aria-hidden
      />

      <CenterContainer className="relative">
        <div className="relative flex flex-col gap-4 lg:min-h-[400px]">
          <div className="flex w-full justify-center lg:absolute lg:top-1/2 lg:left-10 lg:z-0 lg:max-w-150 lg:-translate-y-1/2">
            <img
              src="/sections-image/coworking.png"
              alt={t('home.staffAugmentation.imageAlt')}
              className="w-full max-w-lg rounded-2xl object-cover shadow-xl"
            />
          </div>
          <div className="flex w-full flex-col lg:absolute lg:top-80 lg:right-20 lg:z-10 lg:w-[58%] lg:-translate-y-1/2">
            <div className="relative overflow-hidden rounded-2xl bg-[#203853] px-6 py-10 md:px-10 md:py-12 lg:px-12 lg:py-8">
              <img
                src="/backgrounds/bg-decoration.svg"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-20"
                aria-hidden
              />
              <p className="relative mb-2 text-xs font-medium tracking-wider text-white/70 uppercase md:text-sm">
                {t('home.staffAugmentation.label')}
              </p>
              <h2 className="relative mb-4 text-3xl leading-tight font-bold text-white md:text-4xl lg:text-[2.25rem]">
                {t('home.staffAugmentation.title')}
              </h2>
              <p className="relative mb-6 text-base leading-relaxed text-white/80 md:text-lg">
                {t('home.staffAugmentation.description')}
              </p>
              <div className="relative flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 w-full border-white bg-transparent text-white sm:w-auto"
                  asChild
                >
                  <Link href={path('/servicios/ampliacion-de-personal')}>
                    {t('home.staffAugmentation.moreInfo')}
                  </Link>
                </Button>
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={path('/contacto')}>{t('home.staffAugmentation.startProject')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
