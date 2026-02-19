import { motion } from 'motion/react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

export type InsightsArticleHeroProps = {
  title: string;
  date: string;
  author: string;
  imageSrc?: string;
  imageAlt?: string;
  backHref: string;
  backLabel: string;
};

export function InsightsArticleHero({
  title,
  date,
  author,
  imageSrc,
  imageAlt,
  backHref,
  backLabel,
}: InsightsArticleHeroProps) {
  const { path } = useLocale();

  return (
    <motion.section
      className="relative w-full overflow-hidden bg-white"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative min-h-[42vh] w-full md:min-h-[48vh]">
        {imageSrc ? (
          <>
            <motion.img
              src={imageSrc}
              alt={imageAlt ?? ''}
              className="absolute inset-0 z-0 h-full w-full object-cover object-center"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: EASING }}
            />
            <div
              className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/40 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <motion.img
            src="/backgrounds/bg-blue.svg"
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
            aria-hidden
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: EASING }}
          />
        )}
        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-10 pt-24">
          <CenterContainer className="w-full">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASING }}
            >
              <Link
                href={path(backHref)}
                className="text-primary hover:text-primary/90 mb-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="size-4" />
                {backLabel}
              </Link>
              <p className="text-white/90 text-sm font-medium drop-shadow">
                {date}
              </p>
              <p className="text-primary mt-0.5 text-xs font-semibold uppercase tracking-wider drop-shadow sm:text-sm">
                {author}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-3xl md:text-4xl">
                {title}
              </h1>
            </motion.div>
          </CenterContainer>
        </div>
      </div>
    </motion.section>
  );
}
