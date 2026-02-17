import { motion } from 'motion/react';
import { Link } from 'wouter';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';

export type CulturaYTalentoHeroProps = {
  titleLine1: string;
  titleLine2: string;
  description: string;
  cta: string;
  ctaHref?: string;
};

const DEFAULT_CTA_HREF = '/contacto';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1 * i, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function CulturaYTalentoHero({
  titleLine1,
  titleLine2,
  description,
  cta,
  ctaHref = DEFAULT_CTA_HREF,
}: CulturaYTalentoHeroProps) {
  const { path } = useLocale();

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
        src="/backgrounds/bg-blue.svg"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <div className="absolute inset-0 z-10 flex items-center pb-8">
        <CenterContainer className="w-full">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
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
                className="mt-4 max-w-xl text-sm text-white/95 drop-shadow md:text-base leading-relaxed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {description}
              </motion.p>
              <motion.div
                className="mt-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link href={path(ctaHref)} className="inline-block">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-4 text-sm font-bold"
                  >
                    {cta}
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div
              className="hidden flex-1 items-center justify-center lg:flex"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              aria-hidden
            >
              <Users
                className="size-48 text-white/90 stroke-[1.5] md:size-56 lg:size-64"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
        </CenterContainer>
      </div>
    </motion.section>
  );
}
