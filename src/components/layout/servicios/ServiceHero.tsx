import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export type ServiceHeroProps = {
  /** Ruta del fondo (ej: /backgrounds/bg-blue.svg) */
  backgroundImage: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1 * i, ease: EASING },
  }),
};

export function ServiceHero({
  backgroundImage,
  titleLine1,
  titleLine2,
  tagline,
}: ServiceHeroProps) {

  return (
    <motion.section
      className="relative h-[60vh] min-h-[320px] w-full overflow-hidden bg-white"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.img
        src={backgroundImage}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: EASING }}
      />
      <div className="absolute inset-0 z-10 flex items-center pb-8">
        <CenterContainer className="w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl flex-1">
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-white uppercase drop-shadow sm:text-3xl md:text-4xl lg:text-4xl">
                <motion.span
                  className="block"
                  custom={0}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  {titleLine1}
                </motion.span>
                <motion.span
                  className="text-primary mt-0.5 block"
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  {titleLine2}
                </motion.span>
              </h1>
              <motion.p
                className="mt-2 max-w-lg text-sm text-white/95 drop-shadow md:text-base"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {tagline}
              </motion.p>
            </div>
          </div>
        </CenterContainer>
      </div>
    </motion.section>
  );
}
