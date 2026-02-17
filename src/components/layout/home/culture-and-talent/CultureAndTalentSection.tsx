import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

type CultureAndTalentSectionProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export function CultureAndTalentSection({
  imageSrc = '/sections-image/coworking.png',
  imageAlt,
}: CultureAndTalentSectionProps) {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Left: image */}
          <div className="relative w-full flex-1 lg:max-w-[50%]">
            <img
              src={imageSrc}
              alt={imageAlt ?? t('home.cultureAndTalent.imageAlt')}
              className="w-full rounded-2xl object-cover shadow-md"
            />
          </div>

          {/* Right: text + CTA */}
          <div className="flex max-w-xl flex-1 flex-col lg:max-w-[50%] lg:text-left">
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider md:text-sm">
              {t('home.cultureAndTalent.label')}
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-[#19314c] md:text-4xl">
              {t('home.cultureAndTalent.titlePart1')}{' '}
              <span className="text-primary">{t('home.cultureAndTalent.titlePart2')}</span>
            </h2>
            <p className="text-muted-foreground mb-3 text-base leading-relaxed md:text-lg">
              {t('home.cultureAndTalent.description1')}
            </p>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
              {t('home.cultureAndTalent.description2')}
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button asChild size="default" className="w-full sm:w-auto">
                <Link href={path('/compania/cultura-y-talento')}>
                  {t('home.cultureAndTalent.cta')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
