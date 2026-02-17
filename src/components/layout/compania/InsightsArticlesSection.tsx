import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { InsightsArticleCard } from './InsightsArticleCard';

const ARTICLE_IDS = ['article1', 'article2', 'article3', 'article4'] as const;

export function InsightsArticlesSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const articles = useMemo(() => {
    return ARTICLE_IDS.map((id, index) => ({
      id,
      imageSrc: `/articles/article-${index + 1}.png`,
      imageAlt: t(`insightsPage.articles.${id}.imageAlt`),
      date: t(`insightsPage.articles.${id}.date`),
      tag: t(`insightsPage.articles.${id}.tag`),
      title: t(`insightsPage.articles.${id}.title`),
      description: t(`insightsPage.articles.${id}.description`),
    }));
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

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('insightsPage.articles.searchPlaceholder')}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={t('insightsPage.articles.searchPlaceholder')}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {filteredArticles.map((article) => (
            <InsightsArticleCard
              key={article.id}
              imageSrc={article.imageSrc}
              imageAlt={article.imageAlt}
              date={article.date}
              tag={article.tag}
              title={article.title}
              description={article.description}
            />
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <p className="text-muted-foreground py-12 text-center text-sm">
            {t('insightsPage.articles.noResults')}
          </p>
        )}
      </CenterContainer>
    </section>
  );
}
