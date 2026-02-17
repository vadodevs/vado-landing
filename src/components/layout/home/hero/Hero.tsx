import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
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

  const onSwiper = (swiper: SwiperType) => {
    swiper.on('slideChange', () => {
      const video = videoRef.current;
      if (video && swiper.activeIndex === 0) {
        video.play().catch(() => {});
      }
    });
  };

  return (
    <section className="relative w-full max-w-[100vw] overflow-x-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        className="h-screen w-full"
        slidesPerView={1}
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSwiper={onSwiper}
      >
        <SwiperSlide className="h-full! w-full!">
          <div className="relative h-screen w-full">
            <video
              ref={videoRef}
              src="/hero/hero-slide.mp4"
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ minWidth: '100%', minHeight: '100%' }}
              muted
              loop
              playsInline
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/40" aria-hidden />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <CenterContainer className="w-full">
                <div className="flex flex-col items-start text-left text-white">
                  <h1 className="max-w-3xl drop-shadow-md">
                    <span className="block text-4xl font-bold uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                      {t('home.heroTitleLine1')}
                    </span>
                    <span className="mt-1 block text-4xl font-bold uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                      {t('home.heroTitleLine2')}
                    </span>
                  </h1>
                  <p className="mt-5 max-w-xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl">
                    {t('home.heroTagline')}
                  </p>
                  <Link href={path('/contacto')}>
                    <Button
                      size="lg"
                      className="mt-6 rounded-lg px-8 py-6 text-base font-bold shadow-lg"
                    >
                      {t('home.heroCta')}
                    </Button>
                  </Link>
                </div>
              </CenterContainer>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
