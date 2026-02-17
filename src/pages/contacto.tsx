import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ContactForm } from '@/components/layout/home/cta-contact/ContactForm';

const BENEFIT_KEYS = [
  'home.ctaContact.benefit1',
  'home.ctaContact.benefit2',
  'home.ctaContact.benefit3',
] as const;

export default function Contacto() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.contactUs')} />
      <MainLayout>
        <section
          className="relative min-h-[min(80vh,700px)] overflow-hidden py-12 md:py-16 lg:py-20"
          style={{
            backgroundImage: 'url(/backgrounds/bg-blue-header.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <CenterContainer className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
            {/* Columna izquierda: título, descripción, beneficios */}
            <div className="flex-1 text-center lg:max-w-[48%] lg:text-left">
              <h2 className="mb-4 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
                <span className="block">{t('home.ctaContact.titlePart1')}</span>
                <span className="text-primary block">{t('home.ctaContact.titlePart2')}</span>
                <span className="block">{t('home.ctaContact.titlePart3')}</span>
              </h2>
              <p className="text-white/95 mb-6 text-base leading-relaxed md:text-lg">
                {t('home.ctaContact.description')}
              </p>
              <ul className="space-y-3">
                {BENEFIT_KEYS.map((key) => (
                  <li key={key} className="flex items-center gap-3">
                    <img
                      src="/icons/check.svg"
                      alt=""
                      className="size-6 shrink-0"
                      aria-hidden
                    />
                    <span className="text-white text-sm leading-relaxed md:text-base">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna derecha: formulario */}
            <div className="min-w-0 flex-1 lg:max-w-[52%]">
              <ContactForm idPrefix="contact-" />
            </div>
          </CenterContainer>
        </section>
      </MainLayout>
    </>
  );
}
