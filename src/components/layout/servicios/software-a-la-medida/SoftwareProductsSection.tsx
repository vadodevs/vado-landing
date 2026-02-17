import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const PHONE_IMAGE_SRC = '/sections-image/phone-image.png';

export function SoftwareProductsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* Imagen: en mobile va al final (order-2), en desktop a la izquierda (order-1) */}
          <div className="order-2 flex justify-center lg:order-1 lg:max-w-[48%] lg:flex-1">
            <img
              src={PHONE_IMAGE_SRC}
              alt=""
              className="h-auto w-full max-w-[280px] object-contain object-center md:max-w-[340px] lg:max-w-[440px]"
              aria-hidden
            />
          </div>

          {/* Texto: en mobile primero (order-1), en desktop a la derecha (order-2) */}
          <div className="order-1 flex flex-col lg:order-2 lg:max-w-[52%] lg:flex-1 lg:justify-center">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
              {t('services.customSoftware.products.label')}
            </p>
            <h2 className="text-2xl leading-tight font-bold text-[#19314c] sm:text-3xl md:text-4xl lg:text-4xl">
              {t('services.customSoftware.products.titlePart1')}{' '}
              <span className="text-primary">
                {t('services.customSoftware.products.titlePart2')}
              </span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
              {t('services.customSoftware.products.description')}
            </p>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
