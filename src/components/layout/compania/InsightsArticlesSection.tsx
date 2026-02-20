import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { InsightsArticleCard } from './InsightsArticleCard';
import { useLocale } from '@/hooks/useLocale';
import {
  INSIGHTS_ARTICLE_IDS,
  getInsightsArticleSlug,
  INSIGHTS_ARTICLES_PER_PAGE,
} from './insightsArticles';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

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

export function InsightsArticlesSection() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollFromPaginationRef = useRef(false);

  useEffect(() => {
    if (!scrollFromPaginationRef.current) return;
    scrollFromPaginationRef.current = false;
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  const goToPage = (page: number) => {
    scrollFromPaginationRef.current = true;
    setCurrentPage(page);
  };

  const articles = useMemo(() => {
    return INSIGHTS_ARTICLE_IDS.map((id, index) => {
      const imageIndex = (index % 3) + 1;
      return {
        id,
        slug: getInsightsArticleSlug(id),
        imageSrc: `/articles/article-${imageIndex}.png`,
        imageAlt: t(`insightsPage.articles.${id}.imageAlt`),
        date: t(`insightsPage.articles.${id}.date`),
        tag: t(`insightsPage.articles.${id}.tag`),
        title: t(`insightsPage.articles.${id}.title`),
        description: t(`insightsPage.articles.${id}.description`),
      };
    });
  }, [t]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.trim().toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q),
    );
  }, [articles, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / INSIGHTS_ARTICLES_PER_PAGE),
  );
  const from = (currentPage - 1) * INSIGHTS_ARTICLES_PER_PAGE;
  const paginatedArticles = useMemo(
    () => filteredArticles.slice(from, from + INSIGHTS_ARTICLES_PER_PAGE),
    [filteredArticles, from],
  );

  return (
    <motion.section
      ref={sectionRef}
      className="bg-background py-12 md:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CenterContainer>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
            {t('insightsPage.articles.sectionTitle')}
          </h2>
          <div className="relative w-full sm:w-72">
            <Search
              className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t('insightsPage.articles.searchPlaceholder')}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={t('insightsPage.articles.searchPlaceholder')}
            />
          </div>
        </div>

        <motion.div
          key={currentPage}
          className="grid gap-6 sm:grid-cols-2 lg:gap-8"
          variants={container}
          initial="visible"
          animate="visible"
        >
          {paginatedArticles.map((article) => (
            <motion.div key={article.id} variants={card}>
              <InsightsArticleCard
                imageSrc={article.imageSrc}
                imageAlt={article.imageAlt}
                date={article.date}
                tag={article.tag}
                title={article.title}
                description={article.description}
                href={path(`/compania/articulos/${article.slug}`)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredArticles.length === 0 && (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t('insightsPage.articles.noResults')}
          </p>
        )}

        {filteredArticles.length > 0 && totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label={t('insightsPage.articles.pagination.ariaLabel')}
          >
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-input text-foreground hover:bg-muted inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {t('insightsPage.articles.pagination.previous')}
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={
                      currentPage === page
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors'
                        : 'border-input text-foreground hover:bg-muted inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors'
                    }
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                goToPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="border-input text-foreground hover:bg-muted inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {t('insightsPage.articles.pagination.next')}
            </button>
          </nav>
        )}
      </CenterContainer>
    </motion.section>
  );
}
