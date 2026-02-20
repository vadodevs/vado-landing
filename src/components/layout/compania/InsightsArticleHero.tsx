import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const INSIGHTS_ARTICLE_HERO_BG = '/backgrounds/bg-blue-header.svg';

export type InsightsArticleHeroProps = {
  category?: string;
  title: string;
  date: string;
  author: string;
};

export function InsightsArticleHero({
  category,
  title,
  date,
  author,
}: InsightsArticleHeroProps) {
  return (
    <motion.section
      className="relative flex min-h-[45vh] w-full items-center overflow-hidden bg-white md:min-h-[50vh]"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.img
        src={INSIGHTS_ARTICLE_HERO_BG}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: EASING }}
      />
      <div className="absolute inset-0 z-10 flex items-center py-16">
        <CenterContainer className="w-full">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASING }}
          >
            {category && (
              <p className="text-primary mb-1 text-xs font-semibold uppercase tracking-wider drop-shadow sm:text-sm">
                {category}
              </p>
            )}
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
    </motion.section>
  );
}
