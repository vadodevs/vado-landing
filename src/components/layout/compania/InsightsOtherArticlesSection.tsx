import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { InsightsArticleCard } from '@/components/layout/compania/InsightsArticleCard';
import { useLocale } from '@/hooks/useLocale';
import {
  INSIGHTS_ARTICLE_IDS,
  getInsightsArticleSlug,
  getInsightsArticleImageSrc,
  type InsightsArticleId,
} from '@/components/layout/compania/insightsArticles';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const OTHER_ARTICLES_COUNT = 3;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASING,
    },
  },
};

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
    const fallback = `/articles/article-${(index % 3) + 1}.webp`;
    return {
      id,
      slug: getInsightsArticleSlug(id),
      imageSrc: getInsightsArticleImageSrc(id, fallback),
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
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              variants={card}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <InsightsArticleCard
                imageSrc={article.imageSrc}
                imageAlt={article.imageAlt}
                date={article.date}
                tag={article.tag}
                title={article.title}
                description={article.description}
                href={article.href}
              />
            </motion.div>
          ))}
        </motion.div>
      </CenterContainer>
    </motion.section>
  );
}
