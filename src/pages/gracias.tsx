import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

export default function Gracias() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageTitle title={t('thankYou.pageTitle')} />
      <MainLayout>
        <motion.section
          className="relative min-h-[min(70vh,600px)] py-16 md:py-24 lg:py-28"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CenterContainer className="flex flex-col items-center justify-center text-center">
            <div className="mx-auto flex max-w-xl flex-col gap-6">
              <h1 className="text-primary text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {t('thankYou.title')}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
                {t('thankYou.message')}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                <Link href={path('')}>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 font-medium"
                  >
                    {t('thankYou.ctaHome')}
                  </Button>
                </Link>
                <Link href={path('/contacto')}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 rounded-lg px-6 font-medium"
                  >
                    {t('thankYou.ctaContact')}
                  </Button>
                </Link>
              </div>
            </div>
          </CenterContainer>
        </motion.section>
      </MainLayout>
    </>
  );
}
