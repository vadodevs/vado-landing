import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

/** Coloca en `public/videos/` los archivos con este nombre (textura sutil, loop corto, baja resolución). */
const STAFF_AUG_VIDEO_WEBM = '/videos/staff-augmentation-texture.webm';
const STAFF_AUG_VIDEO_MP4 = '/videos/staff-augmentation-texture.mp4';

export function StaffAugmentationSection() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    el.muted = true;
    el.loop = true;
    void el.play().catch(() => {
      /* autoplay puede bloquearse hasta interacción; loop sigue activo */
    });
  }, [reduceMotion]);

  return (
    <section
      id="staff-augmentation"
      className="relative w-full scroll-mt-20 overflow-hidden bg-white py-12 md:py-16 md:scroll-mt-24 lg:py-24"
    >
      {/* Capas bajo el contenido: el blanco del section debe verse; antes el vídeo + negro cubrían todo. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-white" aria-hidden>
        {!reduceMotion ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 h-full min-h-full w-full min-w-full scale-[1.08] object-cover opacity-[0.12]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={STAFF_AUG_VIDEO_WEBM} type="video/webm" />
              <source src={STAFF_AUG_VIDEO_MP4} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-white/88" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-neutral-50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-neutral-50" />
        )}
      </div>

      <CenterContainer className="relative z-10">
        <div className="relative flex flex-col gap-4 lg:min-h-[400px]">
          <div className="flex w-full justify-center lg:absolute lg:top-1/2 lg:left-10 lg:z-0 lg:max-w-150 lg:-translate-y-1/2">
            <div className="aspect-16/10 w-full max-w-lg overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/team-vado/vado-team-32.webp"
                alt={t('home.staffAugmentation.imageAlt')}
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
          <div className="flex w-full flex-col lg:absolute lg:top-90 lg:right-0 lg:z-10 lg:w-[58%] lg:-translate-y-1/2">
            <div className="relative overflow-hidden rounded-2xl bg-[#203853] px-6 py-10 md:px-10 md:py-12 lg:px-12 lg:py-8">
              <img
                src="/backgrounds/bg-decoration.webp"
                alt=""
                width={741}
                height={480}
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-20"
                aria-hidden
              />
              <p className="relative mb-2 text-xs font-medium tracking-wider text-white/70 uppercase md:text-sm">
                {t('home.nearshoreBento.kicker')}
              </p>
              <h2 className="relative mb-4 text-3xl leading-tight font-bold text-white md:text-4xl lg:text-[2.25rem]">
                {t('home.nearshoreBento.title')}
              </h2>
              <p className="relative mb-6 text-base leading-relaxed text-white/80 md:text-lg">
                {t('home.nearshoreBento.subtitle')}
              </p>
              <div className="relative flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 w-full border-white bg-transparent text-white sm:w-auto"
                  asChild
                >
                  <Link href={path('/services/staff-augmentation')}>
                    {t('home.staffAugmentation.moreInfo')}
                  </Link>
                </Button>
                <Button className="w-full sm:w-auto" asChild>
                  <Link href={path('/contact')}>{t('home.staffAugmentation.startProject')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
