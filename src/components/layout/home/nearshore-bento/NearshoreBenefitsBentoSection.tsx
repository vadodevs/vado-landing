import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { Globe2, Gauge, Puzzle, SlidersHorizontal, BookOpenCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type BentoCard = { titleKey: string; descriptionKey: string; icon: LucideIcon; className: string };

const BENTO_ROW1: BentoCard[] = [
  {
    titleKey: 'home.nearshoreBento.item1Title',
    descriptionKey: 'home.nearshoreBento.item1Description',
    icon: Globe2,
    className:
      'border-sky-200/80 bg-gradient-to-br from-sky-100/95 via-sky-50/90 to-cyan-50/80 text-sky-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)]',
  },
  {
    titleKey: 'home.nearshoreBento.item2Title',
    descriptionKey: 'home.nearshoreBento.item2Description',
    icon: Gauge,
    className: 'border-violet-200/80 bg-gradient-to-br from-violet-100/90 to-fuchsia-50/75 text-violet-950',
  },
];

const BENTO_ROW2: BentoCard[] = [
  {
    titleKey: 'home.nearshoreBento.item3Title',
    descriptionKey: 'home.nearshoreBento.item3Description',
    icon: Puzzle,
    className: 'border-amber-200/80 bg-gradient-to-br from-amber-100/90 to-orange-50/70 text-amber-950',
  },
  {
    titleKey: 'home.nearshoreBento.item4Title',
    descriptionKey: 'home.nearshoreBento.item4Description',
    icon: SlidersHorizontal,
    className: 'border-emerald-200/80 bg-gradient-to-br from-emerald-100/90 to-teal-50/75 text-emerald-950',
  },
  {
    titleKey: 'home.nearshoreBento.item5Title',
    descriptionKey: 'home.nearshoreBento.item5Description',
    icon: BookOpenCheck,
    className: 'border-rose-200/80 bg-gradient-to-br from-rose-100/88 to-pink-50/72 text-rose-950',
  },
];

function BentoCardArticle({ item }: { item: BentoCard }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <article
      className={cn('flex flex-col rounded-3xl border p-6 shadow-sm md:p-7', item.className)}
    >
      <span
        className="flex size-11 items-center justify-center rounded-2xl bg-white/55 shadow-sm ring-1 ring-black/5 backdrop-blur-sm"
        aria-hidden
      >
        <Icon className="size-5 opacity-90" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-tight md:text-xl">{t(item.titleKey)}</h3>
      <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed opacity-90 md:text-[15px]">
        {t(item.descriptionKey)}
      </p>
    </article>
  );
}

export function NearshoreBenefitsBentoSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-14 md:py-20 lg:py-24">
      <CenterContainer>
        <div className="mx-auto max-w-6xl">
          <p className="text-primary text-center text-xs font-semibold tracking-widest uppercase">
            {t('home.nearshoreBento.kicker')}
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            {t('home.nearshoreBento.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-pretty text-base leading-relaxed text-neutral-600 md:text-lg">
            {t('home.nearshoreBento.subtitle')}
          </p>

          <div className="mt-10 flex flex-col gap-4 md:gap-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {BENTO_ROW1.map((item) => (
                <BentoCardArticle key={item.titleKey} item={item} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
              {BENTO_ROW2.map((item) => (
                <BentoCardArticle key={item.titleKey} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href={path('/services/staff-augmentation')}>{t('home.nearshoreBento.moreLink')}</Link>
            </Button>
            <Button asChild>
              <Link href={path('/contact')}>{t('home.nearshoreBento.contactLink')}</Link>
            </Button>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
