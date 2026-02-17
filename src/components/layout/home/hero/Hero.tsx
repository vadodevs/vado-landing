import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'wouter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { CenterContainer } from '@/components/layout/CenterContainer';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.08 * i,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

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
            <motion.video
              ref={videoRef}
              src="/hero/hero-slide.mp4"
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ minWidth: '100%', minHeight: '100%' }}
              muted
              loop
              playsInline
              aria-hidden
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div
              className="absolute inset-0 bg-black/40"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <CenterContainer className="w-full">
                <motion.div
                  className="flex flex-col items-start text-left text-white"
                  initial="hidden"
                  animate="visible"
                >
                  <h1 className="max-w-3xl drop-shadow-md">
                    <motion.span
                      className="block text-4xl font-bold uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                      custom={0}
                      variants={fadeUp}
                    >
                      {t('home.heroTitleLine1')}
                    </motion.span>
                    <motion.span
                      className="mt-1 block text-4xl font-bold uppercase tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                      custom={1}
                      variants={fadeUp}
                    >
                      {t('home.heroTitleLine2')}
                    </motion.span>
                  </h1>
                  <motion.p
                    className="mt-5 max-w-xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.28,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {t('home.heroTagline')}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <Link href={path('/contacto')}>
                      <Button
                        size="lg"
                        className="mt-6 rounded-lg px-8 py-6 text-base font-bold shadow-lg"
                      >
                        {t('home.heroCta')}
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </CenterContainer>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
