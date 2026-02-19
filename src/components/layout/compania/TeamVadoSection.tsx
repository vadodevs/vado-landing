import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Marquee } from '@/components/ui/marquee';

const TEAM_IMAGES = Array.from({ length: 18 }, (_, i) => `/team-vado/vado-team-${i + 1}.webp`);

/** Rectangular y más grandes */
const IMAGE_CLASS =
  'h-36 w-[14rem] shrink-0 overflow-hidden rounded-lg border border-border bg-muted object-cover sm:h-40 sm:w-56 md:h-44 md:w-64 lg:h-48 lg:w-72';

function TeamMarqueeRow({ images, direction }: { images: string[]; direction: 'left' | 'right' }) {
  return (
    <Marquee gap="gap-4 sm:gap-6" duration={150} pauseOnHover direction={direction} noFade>
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          className={IMAGE_CLASS}
          width={450}
          height={350}
          loading="lazy"
        />
      ))}
    </Marquee>
  );
}

export function TeamVadoSection() {
  const { t } = useTranslation();
  const title = t('cultureYTalentoPage.teamVado.title');
  const titleWords = title.split(' ');

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="mb-10 max-w-3xl text-left">
          <h2 className="mb-4 text-2xl leading-tight font-bold text-[#19314c] md:text-3xl lg:text-4xl">
            {titleWords.length <= 1 ? (
              title
            ) : (
              <>
                {titleWords[0]}{' '}
                <span className="text-primary">{titleWords.slice(1).join(' ')}</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
            {t('cultureYTalentoPage.teamVado.description')}
          </p>
        </div>
      </CenterContainer>

      <div className="bg-white py-6 md:py-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <TeamMarqueeRow images={TEAM_IMAGES} direction="left" />
          <TeamMarqueeRow images={TEAM_IMAGES} direction="right" />
        </div>
      </div>
    </section>
  );
}
