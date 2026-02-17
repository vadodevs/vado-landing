import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

const PHONE_IMAGE_SRC = '/sections-image/phone-image.png';

export function StaffAugmentationIntroSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Imagen: izquierda en desktop, abajo en mobile */}
          <div className="order-2 flex justify-center lg:order-1 lg:max-w-[48%] lg:flex-1">
            <img
              src={PHONE_IMAGE_SRC}
              alt=""
              className="h-auto w-full object-contain object-center md:max-w-[340px] lg:max-w-[440px]"
              aria-hidden
            />
          </div>

          {/* Texto: derecha en desktop, arriba en mobile */}
          <div className="order-1 flex flex-col lg:order-2 lg:max-w-[52%] lg:flex-1 lg:justify-center">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
              {t('services.staffAugmentation.intro.label')}
            </p>
            <h2 className="text-2xl leading-tight font-bold text-[#19314c] sm:text-3xl md:text-4xl lg:text-4xl">
              {t('services.staffAugmentation.intro.titlePart1')}{' '}
              <span className="text-primary">
                {t('services.staffAugmentation.intro.titlePart2')}
              </span>
            </h2>
            <p className="mt-2 text-base font-bold text-[#19314c] md:text-lg">
              {t('services.staffAugmentation.intro.subheadline')}
            </p>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
              {t('services.staffAugmentation.intro.description')}
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={path('/contacto')}>{t('services.staffAugmentation.intro.cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
