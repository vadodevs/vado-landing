import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { ZENQR_ACCENT } from './zenqr-case-section';

const CTA_TITLE_DARK = '#1A2F45';

export function ZenqrCtaSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24">
      <div className="w-full min-w-0">
        <motion.div
          className="w-full text-left"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="mb-4 text-2xl leading-tight font-bold tracking-tight uppercase md:text-3xl lg:text-4xl">
            <span className="block" style={{ color: CTA_TITLE_DARK }}>
              {t('ourWork.caseStudy.zenqr.cta.titleLine1')}
            </span>
            <span className="block" style={{ color: ZENQR_ACCENT }}>
              {t('ourWork.caseStudy.zenqr.cta.titleLine2')}
            </span>
          </h2>
          <p className="text-muted-foreground mb-8 text-base leading-relaxed md:text-lg">
            {t('ourWork.caseStudy.zenqr.cta.description')}
          </p>
          <Button
            size="lg"
            className="rounded-xl px-8 py-6 text-base font-semibold shadow-md transition-all hover:shadow-lg"
            style={{
              backgroundColor: ZENQR_ACCENT,
              color: 'white',
            }}
            asChild
          >
            <Link href={path('/contacto')}>{t('ourWork.caseStudy.zenqr.cta.ctaLabel')}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
