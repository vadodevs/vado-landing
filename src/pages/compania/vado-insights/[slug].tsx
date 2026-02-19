import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { InsightsArticleHero } from '@/components/layout/compania/InsightsArticleHero';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';
import {
  getInsightsArticleIdBySlug,
  INSIGHTS_ARTICLE_IDS,
} from '@/components/layout/compania/insightsArticles';

const ARTICLE_IMAGE_BY_INDEX: Record<number, string> = {
  1: '/articles/article-1.png',
  2: '/articles/article-2.png',
  3: '/articles/article-3.png',
  4: '/articles/article-4.png',
  5: '/articles/article-5.png',
  6: '/articles/article-6.png',
  7: '/articles/article-7.png',
  8: '/articles/article-8.png',
  9: '/articles/article-9.png',
  10: '/articles/article-10.png',
  11: '/articles/article-11.png',
  12: '/articles/article-12.png',
  13: '/articles/article-13.png',
};

export default function VadoInsightsArticle() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? '';
  const { t } = useTranslation();
  const { path } = useLocale();

  const articleId = getInsightsArticleIdBySlug(slug);
  const index = articleId
    ? INSIGHTS_ARTICLE_IDS.indexOf(articleId) + 1
    : 0;
  const imageSrc = index ? ARTICLE_IMAGE_BY_INDEX[index] : undefined;

  const pageTitle = articleId
    ? `${t(`insightsPage.articles.${articleId}.title`)} | ${t('nav.vadoInsights')}`
    : t('nav.vadoInsights');
  const canonicalPath = articleId
    ? path(`/compania/vado-insights/${slug}`)
    : undefined;
  const metaDescription = articleId
    ? t(`insightsPage.articles.${articleId}.description`)
    : '';

  if (!articleId) {
    return (
      <>
        <PageTitle title={t('nav.vadoInsights')} />
        <MainLayout>
          <div className="bg-muted/40 py-12 md:py-16">
            <CenterContainer>
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
                <p className="text-muted-foreground">
                  {t('insightsPage.articles.noResults')}
                </p>
                <Link
                  href={path('/compania/vado-insights')}
                  className="text-primary mt-8 inline-block font-medium underline underline-offset-2 hover:no-underline"
                >
                  ← {t('insightsPage.articles.backToArticles')}
                </Link>
              </div>
            </CenterContainer>
          </div>
        </MainLayout>
      </>
    );
  }

  const title = t(`insightsPage.articles.${articleId}.title`);
  const date = t(`insightsPage.articles.${articleId}.date`);
  const author = t(`insightsPage.articles.${articleId}.tag`);
  const imageAlt = t(`insightsPage.articles.${articleId}.imageAlt`);
  const body = t(`insightsPage.articles.${articleId}.body`);

  return (
    <>
      <PageMeta
        title={pageTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
      />
      <MainLayout>
        <InsightsArticleHero
          title={title}
          date={date}
          author={author}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          backHref="/compania/vado-insights"
          backLabel={t('insightsPage.articles.backToArticles')}
        />
        <section className="bg-background py-12 md:py-16">
          <CenterContainer>
            <div className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
              <p className="text-foreground text-base leading-relaxed md:text-lg">
                {body}
              </p>
            </div>
            <div className="mt-10 text-center">
              <Link
                href={path('/compania/vado-insights')}
                className="text-primary inline-flex items-center font-medium underline underline-offset-2 hover:no-underline"
              >
                ← {t('insightsPage.articles.backToArticles')}
              </Link>
            </div>
          </CenterContainer>
        </section>
      </MainLayout>
    </>
  );
}
