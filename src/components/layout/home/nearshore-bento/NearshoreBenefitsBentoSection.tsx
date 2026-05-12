import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useReducedMotion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const NEARSHORE_BG_VIDEO = '/hero/hero-slide.mp4';

type BentoCard = { titleKey: string; descriptionKey: string };

const BENTO_ROW1: BentoCard[] = [
  {
    titleKey: 'home.nearshoreBento.item1Title',
    descriptionKey: 'home.nearshoreBento.item1Description',
  },
  {
    titleKey: 'home.nearshoreBento.item2Title',
    descriptionKey: 'home.nearshoreBento.item2Description',
  },
];

const BENTO_ROW2: BentoCard[] = [
  {
    titleKey: 'home.nearshoreBento.item3Title',
    descriptionKey: 'home.nearshoreBento.item3Description',
  },
  {
    titleKey: 'home.nearshoreBento.item4Title',
    descriptionKey: 'home.nearshoreBento.item4Description',
  },
  {
    titleKey: 'home.nearshoreBento.item5Title',
    descriptionKey: 'home.nearshoreBento.item5Description',
  },
];

function BentoCardArticle({ item }: { item: BentoCard }) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const staffAugmentationHref = path('/services/staff-augmentation');

  return (
    <Link
      href={staffAugmentationHref}
      className={cn(
        'group flex h-full flex-col rounded-3xl border border-transparent bg-black/60 p-6 text-left no-underline transition-colors duration-300 ease-in-out md:p-7',
        'text-white hover:bg-black/80 hover:border-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      )}
    >
      <h3 className="text-lg font-semibold tracking-tight md:text-xl">{t(item.titleKey)}</h3>
      <span
        className="mt-2 block h-1 w-24 rounded-full bg-primary"
        aria-hidden
      />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-pretty text-white/60 md:text-[15px]">
        {t(item.descriptionKey)}
      </p>
      <span
        className={cn(
          'mt-4 inline-flex size-10 shrink-0 items-center justify-center self-end rounded-full',
          'bg-transparent text-white/50 transition-colors duration-300 ease-out',
          'group-hover:bg-white group-hover:text-slate-900',
        )}
        aria-hidden
      >
        <ArrowUpRight className="size-5" strokeWidth={2} />
      </span>
    </Link>
  );
}

export function NearshoreBenefitsBentoSection() {
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
      /* autoplay puede quedar bloqueado hasta gesto del usuario */
    });
  }, [reduceMotion]);

  return (
    <section
      className="relative overflow-hidden bg-gray-100 py-14 md:py-20 lg:py-24"
      aria-labelledby="nearshore-bento-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
        aria-hidden
      >
        {!reduceMotion ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 h-full min-h-full w-full min-w-full scale-105 object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={NEARSHORE_BG_VIDEO} type="video/mp4" />
            </video>
            {/* Velo claro para que título, subtítulo y tarjetas sigan leyéndose bien */}
            <div className="absolute inset-0 bg-linear-to-b from-black/90 via-black/80 to-black/90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-100" />
        )}
      </div>

      <CenterContainer className="relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-primary text-xs font-semibold tracking-wider uppercase md:text-sm">
              {t('home.nearshoreBento.kicker')}
            </p>
            <h2
              id="nearshore-bento-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              {t('home.nearshoreBento.title')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-3xl text-base leading-relaxed text-pretty text-white/90 md:text-lg">
              {t('home.nearshoreBento.subtitle')}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-4 md:mt-12 md:gap-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {BENTO_ROW1.map((item) => (
                <BentoCardArticle key={item.titleKey} item={item} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {BENTO_ROW2.map((item) => (
                <BentoCardArticle key={item.titleKey} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={path('/contact')}
              className="group relative inline-flex h-12 overflow-hidden rounded-full p-[2px] shadow-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_28px_rgba(51,144,255,0.55),0_0_52px_rgba(51,144,255,0.22),0_0_80px_rgba(51,144,255,0.1)] focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950 focus:outline-none"
            >
              <span
                className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8ec9ff_0%,#5baeff_22%,#3390ff_42%,#1a5fd4_52%,#164a9e_62%,#3390ff_78%,#6eb6ff_100%)]"
                aria-hidden
              />
              <span className="flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-1 text-sm font-normal text-white backdrop-blur-3xl">
                {t('home.heroCta')}
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
