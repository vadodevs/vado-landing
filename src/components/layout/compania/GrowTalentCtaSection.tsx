import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

export function GrowTalentCtaSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="max-w-2xl text-left">
          <h2 className="mb-4 text-2xl font-bold leading-tight text-[#19314c] md:text-3xl lg:text-4xl">
            {t('cultureYTalentoPage.growTalentCta.titleDark')}
            <span className="text-primary">{t('cultureYTalentoPage.growTalentCta.titleBlue')}</span>
          </h2>
          <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
            {t('cultureYTalentoPage.growTalentCta.subtitle')}
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-4 text-base font-medium"
            asChild
          >
            <Link href={path('/contacto')}>{t('cultureYTalentoPage.growTalentCta.cta')}</Link>
          </Button>
        </div>
      </CenterContainer>
    </section>
  );
}
