import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { FeatureCard } from '../FeatureCard';
import { PhoneMockup } from '@/components/ui/phone-mockup';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

type DigitalProductsSectionProps = {
  mockupImageSrc?: string;
  mockupImageAlt?: string;
};

export function DigitalProductsSection({
  mockupImageSrc = '/home-assets/home-bg-mockup.png',
  mockupImageAlt = 'App mockup',
}: DigitalProductsSectionProps) {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="relative overflow-hidden">
      <img
        src="/backgrounds/bg-white-blue.png"
        alt={t('home.digitalProducts.bgAlt')}
        className="pointer-events-none absolute top-0 -right-20 w-auto object-cover object-right"
        aria-hidden
      />
      <CenterContainer>
        <div className="relative flex flex-col items-center gap-8 py-12 lg:gap-12 lg:py-16">
          <div className="flex flex-col-reverse gap-8 lg:w-full lg:flex-row">
            <div className="flex items-center justify-center md:w-auto md:shrink-0">
              <PhoneMockup
                className="w-[min(240px,65vw)] md:w-[250px] lg:w-[220px]"
                src={mockupImageSrc}
                alt={mockupImageAlt}
              />
            </div>
            <div className="relative flex w-full items-center px-4 md:flex-1 md:px-0 lg:max-w-xl lg:pr-8">
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
                  {t('home.digitalProducts.label')}
                </p>
                <h2 className="text-foreground mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-[2.5rem]">
                  <span className="text-[#1e3a5f]">{t('home.digitalProducts.titlePart1')} </span>
                  <span className="text-primary">{t('home.digitalProducts.titlePart2')}</span>
                </h2>
                <p className="text-muted-foreground text-base md:text-lg">
                  {t('home.digitalProducts.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              iconSrc="/home-assets/card-digital/idea.svg"
              iconAlt={t('home.digitalProducts.card1Title')}
              title={t('home.digitalProducts.card1Title')}
              description={t('home.digitalProducts.card1Description')}
            />
            <FeatureCard
              iconSrc="/home-assets/card-digital/display.svg"
              iconAlt={t('home.digitalProducts.card2Title')}
              title={t('home.digitalProducts.card2Title')}
              description={t('home.digitalProducts.card2Description')}
            />
            <FeatureCard
              iconSrc="/home-assets/card-digital/cube.svg"
              iconAlt={t('home.digitalProducts.card3Title')}
              title={t('home.digitalProducts.card3Title')}
              description={t('home.digitalProducts.card3Description')}
            />
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-3 md:w-auto md:flex-row">
            <Button
              variant="outline"
              className="border-primary text-primary w-full md:w-auto"
              asChild
            >
              <Link href={path('/servicios/desarrollo')}>{t('home.digitalProducts.moreInfo')}</Link>
            </Button>
            <Button className="w-full md:w-auto" asChild>
              <Link href={path('/contacto')}>{t('nav.contactUs')}</Link>
            </Button>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
