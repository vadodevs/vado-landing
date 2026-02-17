import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ContactForm } from '@/components/layout/home/cta-contact/ContactForm';

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
          <div className="text-center lg:text-left">
            <h2 className="mb-4 text-2xl leading-tight font-bold md:text-3xl lg:text-4xl">
              <span className="block text-[#19314c]">{t('home.ctaContactEmbed.titlePart1')}</span>
              <span className="text-primary block">{t('home.ctaContactEmbed.titlePart2')}</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
              {t('home.ctaContactEmbed.description')}
            </p>
            <ul className="space-y-3">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <img src="/icons/check.svg" alt="" className="size-6 shrink-0" aria-hidden />
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
          <ContactForm />
        </div>
      </CenterContainer>
    </section>
  );
}
