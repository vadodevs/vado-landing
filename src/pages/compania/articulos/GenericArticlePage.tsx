import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { InsightsArticleHero } from '@/components/layout/compania/InsightsArticleHero';
import { InsightsArticleBody } from '@/components/layout/compania/InsightsArticleBody';
import { InsightsOtherArticlesSection } from '@/components/layout/compania/InsightsOtherArticlesSection';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';
import { getInsightsArticleSlug, type InsightsArticleId } from '@/components/layout/compania/insightsArticles';

export type GenericArticlePageProps = {
  articleId: InsightsArticleId;
};

export default function GenericArticlePage({ articleId }: GenericArticlePageProps) {
  const { t } = useTranslation();
  const { path } = useLocale();

  const slug = getInsightsArticleSlug(articleId);
  const pageTitle = `${t(`insightsPage.articles.${articleId}.title`)} | ${t('nav.vadoInsights')}`;
  const canonicalPath = path(`/compania/articulos/${slug}`);
  const metaDescription = t(`insightsPage.articles.${articleId}.description`);

  const title = t(`insightsPage.articles.${articleId}.title`);
  const date = t(`insightsPage.articles.${articleId}.date`);
  const author = t(`insightsPage.articles.${articleId}.tag`);
  const body = t(`insightsPage.articles.${articleId}.body`);
  const category = t(`insightsPage.articles.${articleId}.category`, {
    defaultValue: '',
  });

  return (
    <>
      <PageMeta
        title={pageTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
      />
      <MainLayout>
        <InsightsArticleHero
          category={category || undefined}
          title={title}
          date={date}
          author={author}
        />
        <section className="bg-background py-12 md:py-16 lg:py-20">
          <CenterContainer>
            <InsightsArticleBody body={body} />
          </CenterContainer>
        </section>
        <InsightsOtherArticlesSection currentArticleId={articleId} />
      </MainLayout>
    </>
  );
}
