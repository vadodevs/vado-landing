import { useTranslation } from 'react-i18next';
import { Marquee } from '@/components/ui/marquee';
import { CenterContainer } from '@/components/layout/CenterContainer';

const BRAND_LOGOS = [
  { src: '/brands/easysales.svg', alt: 'EasySales' },
  { src: '/brands/ebm.svg', alt: 'EasyBoatManagement' },
  { src: '/brands/washapp.svg', alt: 'WashApp' },
  { src: '/brands/rumbo-altenio.svg', alt: 'Rumbo Alteño' },
  { src: '/brands/sendero-logo.svg', alt: 'Sendero CRM' },
  { src: '/brands/maggiore.svg', alt: 'Maggiore Marketing' },
  { src: '/brands/cipreses.svg', alt: 'Criadero de los Cipreses' },
  { src: '/brands/digital-ranch.svg', alt: 'Digital Ranch' },
  { src: '/brands/xoo.svg', alt: 'XOO' },
  { src: '/brands/delta.svg', alt: 'Delta' },
  { src: '/brands/solidly.svg', alt: 'Solidly' },
  { src: '/brands/tesana.svg', alt: 'Tesana' },
  { src: '/brands/zenqr.svg', alt: 'ZenQR' },
  { src: '/brands/sageful-ai.svg', alt: 'Sageful.ai' },
] as const;

const LOGO_GAP_CLASS = 'gap-14';

export function TrustedBrands() {
  const { t } = useTranslation();

  return (
    <section className="bg-background py-14">
      <CenterContainer className="flex flex-col items-center">
        <h2 className="text-foreground/60 mb-10 text-center text-xl font-medium">
          {t('home.trustedBrandsTitle')}
        </h2>
      </CenterContainer>

      <div className="w-full">
        <Marquee className="w-full" gap={LOGO_GAP_CLASS} duration={50} pauseOnHover>
          {BRAND_LOGOS.map((brand, index) => (
            <div
              key={`${brand.src}-${index}`}
              className="flex shrink-0 items-center justify-center grayscale transition-opacity hover:opacity-80"
              style={{ width: 'auto' }}
            >
              <img
                src={brand.src}
                alt={brand.alt}
                className="h-12 w-auto object-contain"
                width={180}
                height={48}
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
