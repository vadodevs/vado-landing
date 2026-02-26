import { CenterContainer } from '@/components/layout/CenterContainer';

export type ServiceHeroProps = {
  /** Ruta del fondo (ej: /backgrounds/bg-blue.svg) */
  backgroundImage: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
};

export function ServiceHero({
  backgroundImage,
  titleLine1,
  titleLine2,
  tagline,
}: ServiceHeroProps) {

  return (
    <section
      className="relative h-[60vh] min-h-[320px] w-full overflow-hidden bg-white"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
    >
      <img
        src={backgroundImage}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex items-center pb-8">
        <CenterContainer className="w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl flex-1">
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-white uppercase drop-shadow sm:text-3xl md:text-4xl lg:text-4xl">
                <span
                  className="block"
                >
                  {titleLine1}
                </span>
                <span
                  className="text-primary mt-0.5 block"
                >
                  {titleLine2}
                </span>
              </h1>
              <p
                className="mt-2 max-w-lg text-sm text-white/95 drop-shadow md:text-base"
              >
                {tagline}
              </p>
            </div>
          </div>
        </CenterContainer>
      </div>
    </section>
  );
}
