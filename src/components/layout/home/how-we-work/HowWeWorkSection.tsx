import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { ArrowRight } from 'lucide-react';

const STEP_KEYS = [
  {
    title: 'home.howWeWork.step1Title',
    description: 'home.howWeWork.step1Description',
  },
  {
    title: 'home.howWeWork.step2Title',
    description: 'home.howWeWork.step2Description',
  },
  {
    title: 'home.howWeWork.step3Title',
    description: 'home.howWeWork.step3Description',
  },
  {
    title: 'home.howWeWork.step4Title',
    description: 'home.howWeWork.step4Description',
  },
] as const;

export function HowWeWorkSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="border-t border-neutral-200 bg-white py-14 md:py-20 lg:py-24">
      <CenterContainer>
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-primary text-2xl font-semibold tracking-tight md:text-3xl">
              {t('home.howWeWork.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-pretty text-base leading-relaxed text-neutral-600 md:text-lg">
              {t('home.howWeWork.subtitle')}
            </p>
          </div>

          {/* Desktop stepper */}
          <div className="relative mt-14 hidden md:block">
            <div
              className="bg-primary/15 pointer-events-none absolute top-5 right-[10%] left-[10%] h-0.5"
              aria-hidden
            />
            <ol className="relative grid grid-cols-4 gap-4">
              {STEP_KEYS.map((step, index) => (
                <li key={step.title} className="flex flex-col items-center text-center">
                  <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ring-4 ring-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-base font-semibold tracking-tight text-neutral-900">
                    {t(step.title)}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600">
                    {t(step.description)}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Mobile stepper */}
          <ol className="relative mt-12 space-y-10 md:hidden">
            <div
              className="bg-primary/20 pointer-events-none absolute top-3 bottom-3 left-[1.125rem] w-0.5"
              aria-hidden
            />
            {STEP_KEYS.map((step, index) => (
              <li key={step.title} className="relative flex gap-5 pl-1">
                <span className="bg-primary text-primary-foreground relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-4 ring-white">
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                    {t(step.title)}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-neutral-600">
                    {t(step.description)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="border-primary/15 bg-primary/5 mt-14 rounded-2xl border px-6 py-8 text-center md:mt-16 md:px-10 md:py-10">
            <p className="text-lg font-semibold tracking-tight text-neutral-900 md:text-xl">
              {t('home.howWeWork.ctaQuestion')}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm text-neutral-600 md:text-base">
              {t('home.howWeWork.ctaHint')}
            </p>
            <Button className="mt-6" asChild>
              <Link href={path('/contact')} className="inline-flex items-center gap-2">
                {t('home.howWeWork.ctaButton')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
