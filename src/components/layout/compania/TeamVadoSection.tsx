import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Marquee } from '@/components/ui/marquee';

const ROW1_IMAGE_NUMBERS: number[] = [
  1, 4, 10, 7, 15, 3, 12, 18, 5, 22, 9, 27, 14, 28, 2, 33, 8, 36,
];
const ROW2_IMAGE_NUMBERS: number[] = [
  29, 19, 11, 24, 16, 42, 13, 40, 17, 23, 39, 26, 30, 6, 31, 32, 34, 35,
];

const toPaths = (nums: number[]) => nums.map((n) => `/team-vado/vado-team-${n}.webp`);

const TEAM_IMAGES_ROW1 = toPaths(ROW1_IMAGE_NUMBERS);
const TEAM_IMAGES_ROW2 = toPaths(ROW2_IMAGE_NUMBERS);


const IMAGE_CLASS =
  'h-48 w-[20rem] shrink-0 overflow-hidden rounded-xl border border-border bg-muted object-cover sm:h-52 sm:w-[22rem] md:h-56 md:w-[24rem] lg:h-60 lg:w-[28rem]';

function TeamMarqueeRow({
  images,
  direction,
  imageAlt,
}: {
  images: string[];
  direction: 'left' | 'right';
  imageAlt: string;
}) {
  return (
    <Marquee gap="gap-4 sm:gap-6" duration={150} pauseOnHover direction={direction} noFade>
      {images.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt={imageAlt}
          className={IMAGE_CLASS}
          width={560}
          height={380}
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
  const imageAlt = t('cultureYTalentoPage.teamVado.imageAlt');

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
          <TeamMarqueeRow images={TEAM_IMAGES_ROW1} direction="left" imageAlt={imageAlt} />
          <TeamMarqueeRow images={TEAM_IMAGES_ROW2} direction="right" imageAlt={imageAlt} />
        </div>
      </div>
    </section>
  );
}
