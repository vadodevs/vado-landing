import { CenterContainer } from '@/components/layout/CenterContainer';

const INSIGHTS_ARTICLE_HERO_BG = '/backgrounds/bg-blue-header.webp';

export type InsightsArticleHeroProps = {
  category?: string;
  title: string;
  date: string;
  author: string;
};

export function InsightsArticleHero({ category, title, date, author }: InsightsArticleHeroProps) {
  return (
    <section
      className="relative flex min-h-[45vh] w-full items-center overflow-hidden bg-white md:min-h-[50vh]"
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 82%, 0 100%)',
      }}
    >
      <img
        src={INSIGHTS_ARTICLE_HERO_BG}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex items-center py-16">
        <CenterContainer className="w-full">
          <div className="max-w-3xl">
            {category && (
              <p className="text-primary mb-1 text-xs font-semibold tracking-wider uppercase drop-shadow sm:text-sm">
                {category}
              </p>
            )}
            <p className="text-sm font-medium text-white/90 drop-shadow">{date}</p>
            <p className="text-primary mt-0.5 text-xs font-semibold tracking-wider uppercase drop-shadow sm:text-sm">
              {author}
            </p>
            <h1 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-white drop-shadow sm:text-3xl md:text-4xl">
              {title}
            </h1>
          </div>
        </CenterContainer>
      </div>
    </section>
  );
}
