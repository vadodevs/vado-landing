import { BookOpen } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';

export type InsightsHeroProps = {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  description: string;
};

export function InsightsHero({ titleLine1, titleLine2, subtitle, description }: InsightsHeroProps) {
  return (
    <section
      className="relative h-[60vh] min-h-[320px] w-full overflow-hidden bg-white"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
    >
      <img
        src="/backgrounds/bg-blue.webp"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex items-center pb-8">
        <CenterContainer className="w-full">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl flex-1">
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-white uppercase drop-shadow sm:text-3xl md:text-4xl lg:text-4xl">
                <span className="block">{titleLine1}</span>
                <span className="text-primary mt-0.5 block">{titleLine2}</span>
              </h1>
              <p className="mt-2 text-sm font-medium text-white/95 drop-shadow md:text-base">
                {subtitle}
              </p>
              <p className="mt-1 max-w-lg text-sm text-white/90 drop-shadow md:text-base">
                {description}
              </p>
            </div>
            <div className="hidden flex-1 items-center justify-center lg:flex" aria-hidden>
              <BookOpen
                className="size-48 stroke-[1.5] text-white/90 md:size-56 lg:size-64"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </CenterContainer>
      </div>
    </section>
  );
}
