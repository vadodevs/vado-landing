import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { InsightsArticleCard } from '@/components/layout/compania/InsightsArticleCard';
import { useLocale } from '@/hooks/useLocale';
import {
  INSIGHTS_ARTICLE_IDS,
  getInsightsArticleSlug,
  type InsightsArticleId,
} from '@/components/layout/compania/insightsArticles';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const OTHER_ARTICLES_COUNT = 3;

export function InsightsOtherArticlesSection({
  currentArticleId,
}: {
  currentArticleId: InsightsArticleId;
}) {
  const { t } = useTranslation();
  const { path } = useLocale();

  const otherIds = INSIGHTS_ARTICLE_IDS.filter((id) => id !== currentArticleId)
    .slice(0, OTHER_ARTICLES_COUNT);

  const articles = otherIds.map((id) => {
    const index = INSIGHTS_ARTICLE_IDS.indexOf(id);
    const imageIndex = (index % 3) + 1;
    const imageSrc =
      id === 'article2'
        ? '/articles/restaurant-industry.webp'
        : id === 'article3'
          ? '/articles/ai-without-borders.webp'
          : id === 'article4'
          ? '/articles/the-evolution-of-workforce.webp'
          : id === 'article5'
            ? '/articles/beyond-borders.webp'
            : id === 'article6'
              ? '/articles/future-proofing.webp'
              : id === 'article7'
                ? '/articles/how-talent-platforms-revlotuionize.webp'
                : id === 'article8'
                  ? '/articles/the-new-workfoce-paradigm.webp'
                  : id === 'article9'
                    ? '/articles/nearshore-outsourcing.webp'
                    : id === 'article10'
                      ? '/articles/the-future-of-work.webp'
                      : id === 'article11'
                        ? '/articles/securing-your-ci-cd.webp'
                        : id === 'article12'
                          ? '/articles/exceptional-alternatives.webp'
                          : id === 'article13'
                            ? '/articles/land-your-dream-job.webp'
                            : `/articles/article-${imageIndex}.webp`;
    return {
      id,
      slug: getInsightsArticleSlug(id),
      imageSrc,
      imageAlt: t(`insightsPage.articles.${id}.imageAlt`),
      date: t(`insightsPage.articles.${id}.date`),
      tag: t(`insightsPage.articles.${id}.tag`),
      title: t(`insightsPage.articles.${id}.title`),
      description: t(`insightsPage.articles.${id}.description`),
      href: path(`/company/articles/${getInsightsArticleSlug(id)}`),
    };
  });

  return (
    <motion.section
      className="bg-muted/30 py-12 md:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: EASING }}
    >
      <CenterContainer>
        <h2 className="text-foreground mb-8 text-2xl font-bold tracking-tight md:text-3xl">
          {t('insightsPage.articles.otherArticlesTitle')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {articles.map((article) => (
            <InsightsArticleCard
              key={article.id}
              imageSrc={article.imageSrc}
              imageAlt={article.imageAlt}
              date={article.date}
              tag={article.tag}
              title={article.title}
              description={article.description}
              href={article.href}
            />
          ))}
        </div>
      </CenterContainer>
    </motion.section>
  );
}
