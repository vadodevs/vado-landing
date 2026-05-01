import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';

const SCOPE = 'services.developersOnDemand.hero';

export function DodDarkHero() {
  const { t } = useTranslation();

  return (
    <section className="relative flex min-h-[min(88vh,920px)] flex-col justify-center bg-black pb-20 pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />
      <CenterContainer className="relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-medium tracking-[0.35em] text-zinc-500 uppercase">
            {t(`${SCOPE}.eyebrow`)}
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-[1.12]">
            {t(`${SCOPE}.titleLine1`)}
            <span className="mt-2 block text-zinc-400 md:text-4xl">{t(`${SCOPE}.titleLine2`)}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
            {t(`${SCOPE}.tagline`)}
          </p>
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-2 md:mt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <span className="text-[11px] tracking-wider text-zinc-600 uppercase">{t(`${SCOPE}.scrollHint`)}</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            aria-hidden
          >
            <ChevronDown className="size-6 text-zinc-600" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      </CenterContainer>
    </section>
  );
}
