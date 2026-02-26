import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { CenterContainer } from '@/components/layout/CenterContainer';

export function Hero() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }, []);

  return (
    <section className="relative w-full max-w-[100vw] overflow-x-hidden">
      <div className="relative h-screen w-full">
        <video
          ref={videoRef}
          preload="metadata"
          poster="/hero/hero-cover.webp"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ minWidth: '100%', minHeight: '100%' }}
          muted
          loop
          aria-hidden
        >
          <source src="/hero/hero-slide.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" aria-hidden />
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <CenterContainer className="w-full">
            <div className="flex flex-col items-start text-left text-white">
              <h1 className="max-w-3xl drop-shadow-md">
                <span className="block text-4xl font-bold tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl">
                  {t('home.heroTitleLine1')}
                </span>
                <span className="mt-1 block text-4xl font-bold tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl">
                  {t('home.heroTitleLine2')}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl">
                {t('home.heroTagline')}
              </p>
              <div>
                <Link href={path('/contact')}>
                  <Button
                    size="lg"
                    className="mt-6 rounded-lg px-8 py-6 text-base font-bold shadow-lg"
                  >
                    {t('home.heroCta')}
                  </Button>
                </Link>
              </div>
            </div>
          </CenterContainer>
        </div>
      </div>
    </section>
  );
}
