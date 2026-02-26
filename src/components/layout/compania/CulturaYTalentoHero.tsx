import { motion } from 'motion/react';
import { Users } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';

export type CulturaYTalentoHeroProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
};

export function CulturaYTalentoHero({
  titleLine1,
  titleLine2,
  description,
}: CulturaYTalentoHeroProps) {
  return (
    <motion.section
      className="relative h-[60vh] min-h-[320px] w-full overflow-hidden bg-white"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
    >
      <motion.img
        src="/backgrounds/bg-blue.svg"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex items-center pb-8">
        <CenterContainer className="w-full">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl flex-1">
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-white uppercase drop-shadow sm:text-3xl md:text-4xl lg:text-4xl">
                <motion.span className="block">
                  {titleLine1}
                </motion.span>
                <motion.span className="text-primary mt-0.5 block">
                  {titleLine2}
                </motion.span>
              </h1>
              <motion.p className="mt-4 max-w-xl text-sm leading-relaxed text-white/95 drop-shadow md:text-base">
                {description}
              </motion.p>
            </div>
            <motion.div className="hidden flex-1 items-center justify-center lg:flex" aria-hidden>
              <Users
                className="size-48 stroke-[1.5] text-white/90 md:size-56 lg:size-64"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
        </CenterContainer>
      </div>
    </motion.section>
  );
}
