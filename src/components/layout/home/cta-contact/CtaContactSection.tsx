import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const ContactForm = lazy(() =>
  import('@/components/layout/home/cta-contact/ContactForm').then((m) => ({ default: m.ContactForm })),
);

const BENEFIT_KEYS = [
  'home.ctaContactEmbed.benefit1',
  'home.ctaContactEmbed.benefit2',
  'home.ctaContactEmbed.benefit3',
] as const;

export function CtaContactSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-0 overflow-hidden rounded-r-2xl bg-white">
      <CenterContainer className="flex flex-col gap-10 py-12 md:py-16 lg:min-h-[min(80vh,700px)] lg:flex-row lg:items-center lg:gap-14 lg:py-20">
        {/* Columna izquierda: título, descripción, beneficios */}
        <div className="flex flex-1 flex-col justify-center lg:max-w-[48%]">
          <div className="text-left">
            <h2 className="mb-4 text-2xl leading-tight font-bold md:text-3xl lg:text-5xl">
              <span className="block text-[#19314c]">{t('home.ctaContactEmbed.titlePart1')}</span>
              <span className="text-primary block">{t('home.ctaContactEmbed.titlePart2')}</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
              {t('home.ctaContactEmbed.description')}
            </p>
            <ul className="space-y-3">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <img
                    src="/icons/check.svg"
                    alt=""
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                    className="size-6 shrink-0"
                    aria-hidden
                  />
                  <span className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Columna derecha: formulario en tarjeta blanca */}
        <div className="min-w-0 flex-1 lg:max-w-[52%]">
          <Suspense
            fallback={
              <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="bg-muted/40 flex min-h-[min(70vh,560px)] w-full animate-pulse rounded-2xl border border-neutral-200/80"
              >
                <span className="sr-only">{t('home.ctaContactEmbed.loadingForm')}</span>
              </div>
            }
          >
            <ContactForm />
          </Suspense>
        </div>
      </CenterContainer>
    </section>
  );
}
