import { lazy, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import {
  ArrowRight,
  ChevronsDown,
  Layers2,
  Rocket,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { CenterContainer } from '@/components/layout/CenterContainer';
import type { MapProps } from '@/components/ui/world-map';

const WorldMap = lazy(() =>
  import('@/components/ui/world-map').then((m) => ({ default: m.default })),
);

const TrustedBrandsLazy = lazy(async () => {
  const m = await import('@/components/layout/home/brands/TrustedBrands');
  return { default: m.TrustedBrands };
});

/** Hermosillo — hub; destinos con etiquetas traducibles */
const HERMOSILLO = { lat: 11.07, lng: -113.95 } as const;

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

function FocusCardHeader({
  icon: Icon,
  titleKey,
  taglineKey,
  titleClassName,
}: {
  icon: LucideIcon;
  titleKey: string;
  taglineKey: string;
  titleClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3">
      <span
        className="bg-gray-50 text-primary-strong flex size-11 shrink-0 items-center justify-center rounded-xl md:size-12"
        aria-hidden
      >
        <Icon className="size-5 md:size-[1.375rem]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <h3
          className={cn(
            'text-base font-medium tracking-tight text-black md:text-lg',
            titleClassName,
          )}
        >
          {t(titleKey)}
        </h3>
        <p className="mt-1.5 text-sm font-medium leading-snug text-pretty text-neutral-600 md:text-[15px]">
          {t(taglineKey)}
        </p>
      </div>
    </div>
  );
}

function FocusBulletList({ translationKeys }: { translationKeys: readonly string[] }) {
  const { t } = useTranslation();
  return (
    <ul className="mt-4 list-none space-y-2.5">
      {translationKeys.map((key) => (
        <li
          key={key}
          className="text-primary-strong flex gap-3 text-sm font-medium leading-snug text-pretty md:text-[15px]"
        >
          <span className="bg-primary-strong mt-2 size-1.5 shrink-0 rounded-full" aria-hidden />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const reduceMotion = usePrefersReducedMotion();
  const brandsSentinelRef = useRef<HTMLDivElement>(null);
  const [showTrustedBrands, setShowTrustedBrands] = useState(false);

  useEffect(() => {
    const el = brandsSentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShowTrustedBrands(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShowTrustedBrands(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '360px 0px 480px 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const worldMapDots = useMemo(
    (): NonNullable<MapProps['dots']> => [
      {
        start: {
          ...HERMOSILLO,
          label: t('home.worldMapCityHermosillo'),
          labelAlign: 'left',
        },
        end: {
          lat: 29.7128,
          lng: -78.006,
          label: t('home.worldMapCityNewYork'),
          labelAlign: 'right',
        },
      },
      {
        start: {
          ...HERMOSILLO,
          label: t('home.worldMapCityHermosillo'),
          labelAlign: 'left',
        },
        end: {
          lat: -55.4489,
          lng: -73.6693,
          label: t('home.worldMapCitySantiago'),
        },
      },
      {
        start: {
          ...HERMOSILLO,
          label: t('home.worldMapCityHermosillo'),
          labelAlign: 'left',
        },
        end: {
          lat: 11.7617,
          lng: -86.1918,
          label: t('home.worldMapCityMiami'),
          labelAlign: 'right',
        },
      },
      {
        start: {
          ...HERMOSILLO,
          label: t('home.worldMapCityHermosillo'),
          labelAlign: 'left',
        },
        end: {
          lat: 3.6597,
          lng: -107.3496,
          label: t('home.worldMapCityGuadalajara'),
        },
      },
    ],
    [t],
  );

  return (
    <section className="relative w-full max-w-[100vw] overflow-x-hidden">
      <div className="relative -mt-20 min-h-[100svh] w-full">
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black" aria-hidden>
          <div className="absolute top-1/2 left-1/2 aspect-[2/1] w-[max(100vw,200vh)] -translate-x-1/2 -translate-y-1/2 lg:max-w-[min(96rem,96vw)] xl:max-w-[min(80rem,92vw)] 2xl:max-w-[min(84rem,90vw)]">
            <Suspense
              fallback={<div className="size-full bg-black" aria-hidden />}
            >
              <WorldMap
                variant="fill"
                dots={worldMapDots}
                lineColor="var(--primary)"
                className="size-full"
              />
            </Suspense>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/50 via-black/20 to-black/5"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-[9] flex justify-center sm:bottom-10">
          <div
            className={cn(
              'flex flex-col items-center gap-1 text-white/75',
              !reduceMotion && 'hero-chevron-bob',
            )}
          >
            <span className="sr-only">{t('home.scrollDownHint')}</span>
            <ChevronsDown
              className="size-9 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:size-10"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>

        <div className="relative z-10 flex min-h-[100svh] items-center">
          <CenterContainer className="flex w-full justify-end">
            <div className="pointer-events-auto flex max-w-xl flex-col items-end text-right text-white">
              <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-white/95 drop-shadow sm:text-lg md:text-xl">
                Growing globally, project by project
              </p>
              <h1 className="text-3xl leading-snug font-bold tracking-tight text-balance drop-shadow-md sm:text-4xl md:text-5xl lg:text-[2.75rem] lg:leading-[1.15]">
                {t('home.heroMapHeadline')}
              </h1>
              <p className="text-primary mt-5 max-w-xl text-base leading-relaxed text-pretty drop-shadow sm:text-lg md:text-xl">
                {t('home.heroMapSubline')}
              </p>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-pretty text-white/85 drop-shadow sm:text-lg">
                {t('home.heroMapSubline2')}
              </p>
              <div className="mt-8 self-end">
                <Link
                  href={path('/contact')}
                  className="group relative inline-flex h-12 overflow-hidden rounded-full p-[2px] shadow-none transition-[box-shadow] duration-300 ease-out hover:shadow-[0_0_28px_rgba(51,144,255,0.55),0_0_52px_rgba(51,144,255,0.22),0_0_80px_rgba(51,144,255,0.1)] focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 focus:outline-none"
                >
                  <span
                    className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8ec9ff_0%,#5baeff_22%,#3390ff_42%,#1a5fd4_52%,#164a9e_62%,#3390ff_78%,#6eb6ff_100%)]"
                    aria-hidden
                  />
                  <div className="flex h-full w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-sm font-normal text-white backdrop-blur-3xl">
                    {t('home.heroCta')}
                    <ArrowRight />
                  </div>
                </Link>
              </div>
            </div>
          </CenterContainer>
        </div>
      </div>

      <div className="relative bg-white py-12 md:py-16 lg:py-20">
        <CenterContainer>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-primary-strong text-2xl font-semibold tracking-tight md:text-3xl">
              {t('home.worldMapTitle')}
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 sm:divide-x sm:divide-neutral-200">
              {[
                {
                  value: t('home.worldMapStat1Value'),
                  title: t('home.worldMapStat1Title'),
                  description: t('home.worldMapStat1Description'),
                },
                {
                  value: t('home.worldMapStat2Value'),
                  title: t('home.worldMapStat2Title'),
                  description: t('home.worldMapStat2Description'),
                },
                {
                  value: t('home.worldMapStat3Value'),
                  title: t('home.worldMapStat3Title'),
                  description: t('home.worldMapStat3Description'),
                },
              ].map((stat, index) => (
                <li
                  key={index}
                  className="flex flex-col items-center justify-center gap-3 px-4 text-center sm:px-6"
                >
                  <span className="text-primary-strong text-4xl font-semibold tracking-tight md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="max-w-[18rem] text-base leading-snug font-semibold text-pretty text-neutral-900 md:text-lg">
                    {stat.title}
                  </span>
                  <span className="max-w-[20rem] text-sm leading-relaxed text-pretty text-neutral-600 md:text-[15px]">
                    {stat.description}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-pretty text-neutral-600 md:text-lg">{t('home.worldMapSubtitle')}</p>
          </div>
        </CenterContainer>
      </div>

      <div ref={brandsSentinelRef} className="h-px w-full" aria-hidden />
      {showTrustedBrands ? (
        <Suspense
          fallback={<div className="min-h-[12rem] w-full bg-background" aria-hidden />}
        >
          <TrustedBrandsLazy />
        </Suspense>
      ) : (
        <div className="min-h-[12rem] w-full bg-background" aria-hidden />
      )}

      <div className="relative bg-neutral-100 py-12 md:py-16 lg:py-20">
        <CenterContainer>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-primary-strong text-center text-2xl font-semibold tracking-tight md:text-3xl">
              {t('home.focusSectionTitle')}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="bg-white flex flex-col gap-6 rounded-2xl p-6 md:col-span-3 md:flex-row md:items-stretch md:gap-8 md:p-8">
                <div className="min-w-0 flex-1">
                  <FocusCardHeader
                    icon={Rocket}
                    titleKey="home.focusCardMvpTitle"
                    taglineKey="home.focusCardMvpTagline"
                    titleClassName="text-lg md:text-xl"
                  />
                  <p className="mt-4 text-pretty text-sm leading-relaxed text-neutral-600 md:text-[15px]">
                    {t('home.focusCardMvpDescription')}
                  </p>
                  <FocusBulletList
                    translationKeys={[
                      'home.focusCardMvpBullet1',
                      'home.focusCardMvpBullet2',
                      'home.focusCardMvpBullet3',
                      'home.focusCardMvpBullet4',
                    ]}
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-stretch md:flex-col md:justify-center md:border-l md:border-primary/15 md:pl-8">
                  <div className="bg-white flex flex-1 flex-col justify-center rounded-xl border border-neutral-200/80 px-4 py-3">
                    <p className="text-primary-strong text-base font-semibold">{t('home.focusCardMvpPriceMvp')}</p>
                    <p className="text-gray-500 mt-1 text-xs font-medium">{t('home.focusCardMvpPriceMvpHint')}</p>
                  </div>
                  <div className="bg-white flex flex-1 flex-col justify-center rounded-xl border border-neutral-200/80 px-4 py-3">
                    <p className="text-primary-strong text-base font-semibold">{t('home.focusCardMvpPriceProd')}</p>
                    <p className="text-gray-500 mt-1 text-xs font-medium">{t('home.focusCardMvpPriceProdHint')}</p>
                  </div>
                </div>
              </article>

              <article className="flex flex-col rounded-2xl bg-white p-6 md:p-7">
                <FocusCardHeader
                  icon={UsersRound}
                  titleKey="home.focusCardStaffTitle"
                  taglineKey="home.focusCardStaffTagline"
                />
                <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-neutral-600 md:text-[15px]">
                  {t('home.focusCardStaffDescription')}
                </p>
                <FocusBulletList
                  translationKeys={[
                    'home.focusCardStaffBullet1',
                    'home.focusCardStaffBullet2',
                    'home.focusCardStaffBullet3',
                    'home.focusCardStaffBullet4',
                  ]}
                />
              </article>

              <article className="flex flex-col rounded-2xl bg-white p-6 md:p-7">
                <FocusCardHeader
                  icon={Layers2}
                  titleKey="home.focusCardConsultingTitle"
                  taglineKey="home.focusCardConsultingTagline"
                />
                <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-neutral-600 md:text-[15px]">
                  {t('home.focusCardConsultingDescription')}
                </p>
                <FocusBulletList
                  translationKeys={[
                    'home.focusCardConsultingBullet1',
                    'home.focusCardConsultingBullet2',
                    'home.focusCardConsultingBullet3',
                    'home.focusCardConsultingBullet4',
                  ]}
                />
              </article>

              <article className="flex flex-col rounded-2xl bg-white p-6 md:p-7">
                <FocusCardHeader
                  icon={Sparkles}
                  titleKey="home.focusCardAiTitle"
                  taglineKey="home.focusCardAiTagline"
                />
                <p className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-neutral-600 md:text-[15px]">
                  {t('home.focusCardAiDescription')}
                </p>
                <FocusBulletList
                  translationKeys={[
                    'home.focusCardAiBullet1',
                    'home.focusCardAiBullet2',
                    'home.focusCardAiBullet3',
                    'home.focusCardAiBullet4',
                  ]}
                />
              </article>
            </div>
          </div>
        </CenterContainer>
      </div>
    </section>
  );
}
