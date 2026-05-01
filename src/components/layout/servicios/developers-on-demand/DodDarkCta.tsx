import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

const SCOPE = 'services.developersOnDemand.cta';

export function DodDarkCta() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="border-t border-white/[0.06] bg-zinc-950 py-16 md:py-20">
      <CenterContainer>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-xl font-bold text-white md:text-2xl">{t(`${SCOPE}.title`)}</h2>
          <p className="mt-3 text-zinc-500 md:text-lg">{t(`${SCOPE}.description`)}</p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white font-semibold text-black hover:bg-zinc-200"
          >
            <Link href={path('/contact')}>{t(`${SCOPE}.button`)}</Link>
          </Button>
        </motion.div>
      </CenterContainer>
    </section>
  );
}
