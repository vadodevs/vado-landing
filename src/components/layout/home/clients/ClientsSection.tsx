import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

const TESTIMONIAL_IDS = ['1', '2', '3'] as const;

function TestimonialAvatar({
  src,
  alt,
  name,
}: {
  src: string | undefined;
  alt: string;
  name: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
      />
    );
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#19314c] text-sm font-semibold text-white/90 md:h-12 md:w-12 md:text-base"
      aria-hidden
    >
      {initial}
    </div>
  );
}

export function ClientsSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="relative -mt-24 overflow-visible bg-white pt-24 pb-12 md:-mt-32 md:pt-32 md:pb-16 lg:-mt-40 lg:pt-40 lg:pb-20">
      {/* Fondo onda: cubre toda la section y se extiende sobre la section de arriba */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/backgrounds/bg-cut.svg"
          alt=""
          className="pointer-events-none absolute -top-1/3 left-0 h-[140%] w-full object-cover object-top"
          aria-hidden
        />
      </div>

      <img
        src="/backgrounds/decoration-blue.svg"
        alt=""
        className="pointer-events-none absolute top-1/4 right-0 h-auto w-[200px] max-w-[40%] opacity-80 md:w-[240px] lg:top-1/5 lg:w-[280px]"
        aria-hidden
      />

      <CenterContainer className="relative">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2 text-left">
            <p className="text-xs font-medium tracking-wider text-[#19314C] uppercase md:text-sm">
              {t('home.clients.label')}
            </p>
            <h2 className="text-3xl leading-tight font-bold text-[#19314C] md:text-4xl lg:text-[2.25rem]">
              {t('home.clients.titlePart1')}{' '}
              <span className="text-primary">{t('home.clients.titlePart2')}</span>
            </h2>
          </div>

          {/* Tarjetas de testimonios */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIAL_IDS.map((id) => {
              const name = t(`home.clients.items.${id}.name`);
              const role = t(`home.clients.items.${id}.role`);
              const imageSrc = t(`home.clients.items.${id}.image`);
              const useImage =
                typeof imageSrc === 'string' &&
                imageSrc.length > 0 &&
                !imageSrc.startsWith('home.');

              return (
                <div
                  key={id}
                  className="bg-background border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm"
                >
                  <p className="flex-1 text-sm leading-relaxed text-[#19314c] md:text-base">
                    {t(`home.clients.items.${id}.quote`)}
                  </p>
                  <div className="flex items-center gap-3">
                    <TestimonialAvatar
                      src={useImage ? imageSrc : undefined}
                      alt=""
                      name={name}
                    />
                    <p className="text-sm font-semibold text-[#19314c]">
                      {role ? `${name} - ${role}` : name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botones */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="border-primary text-primary w-full sm:w-auto"
              asChild
            >
              <Link href={path('/nuestro-trabajo')}>{t('home.clients.moreInfo')}</Link>
            </Button>
            <Button className="w-full sm:w-auto" asChild>
              <Link href={path('/contacto')}>{t('home.clients.startProject')}</Link>
            </Button>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
