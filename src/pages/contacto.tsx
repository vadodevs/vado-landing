import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ContactForm } from '@/components/layout/home/cta-contact/ContactForm';

const BENEFIT_KEYS = [
  'home.ctaContact.benefit1',
  'home.ctaContact.benefit2',
  'home.ctaContact.benefit3',
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Contacto() {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title={t('nav.contactUs')} />
      <MainLayout>
        <motion.section
          className="relative min-h-[min(80vh,700px)] overflow-hidden py-12 md:py-16 lg:py-20"
          style={{
            backgroundImage: 'url(/backgrounds/bg-blue-header.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CenterContainer className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
            {/* Columna izquierda: título, descripción, beneficios */}
            <motion.div
              className="flex-1 text-center lg:max-w-[48%] lg:text-left"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                },
              }}
            >
              <motion.h2
                className="mb-4 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl"
                variants={fadeUp}
              >
                <span className="block">{t('home.ctaContact.titlePart1')}</span>
                <span className="text-primary block">{t('home.ctaContact.titlePart2')}</span>
                <span className="block">{t('home.ctaContact.titlePart3')}</span>
              </motion.h2>
              <motion.p
                className="text-white/95 mb-6 text-base leading-relaxed md:text-lg"
                variants={fadeUp}
              >
                {t('home.ctaContact.description')}
              </motion.p>
              <motion.ul
                className="space-y-3"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06, delayChildren: 0.25 },
                  },
                }}
              >
                {BENEFIT_KEYS.map((key) => (
                  <motion.li
                    key={key}
                    className="flex items-center gap-3"
                    variants={fadeUp}
                  >
                    <img
                      src="/icons/check.svg"
                      alt=""
                      className="size-6 shrink-0"
                      aria-hidden
                    />
                    <span className="text-white text-sm leading-relaxed md:text-base">
                      {t(key)}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Columna derecha: formulario */}
            <motion.div
              className="min-w-0 flex-1 lg:max-w-[52%]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ContactForm idPrefix="contact-" />
            </motion.div>
          </CenterContainer>
        </motion.section>
      </MainLayout>
    </>
  );
}
