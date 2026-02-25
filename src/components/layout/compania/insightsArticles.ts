/**
 * Ids and slugs for Vado Insights articles.
 * Slug is used in URL: /company/articles/:slug (one folder per article).
 */
export const INSIGHTS_ARTICLE_IDS = [
  'article1',
  'article2',
  'article3',
  'article4',
  'article5',
  'article6',
  'article7',
  'article8',
  'article9',
  'article10',
  'article11',
  'article12',
  'article13',
] as const;

export type InsightsArticleId = (typeof INSIGHTS_ARTICLE_IDS)[number];

const SLUG_BY_ID: Record<InsightsArticleId, string> = {
  article1: 'digitalizacion-retail',
  article2: 'tecnologia-industria-restaurantera',
  article3: 'ia-sin-fronteras',
  article4: 'evolucion-trabajo-remoto-talento',
  article5: 'mas-alla-fronteras-talento-global',
  article6: 'preparando-negocio-futuro-mercados-talento',
  article7: 'plataformas-talento-revolucionando-crecimiento',
  article8: 'nuevo-paradigma-laboral-talento-senior',
  article9: '10-razones-nearshore-outsourcing',
  article10: 'futuro-trabajo-fronteras-decada-transformacion',
  article11: 'asegurando-pipeline-cicd-devops',
  article12: 'desbloqueando-potencial-ingenieria-nearshore',
  article13: 'consigue-trabajo-suenos-entrevista-desarrollo',
};

export function getInsightsArticleSlug(id: InsightsArticleId): string {
  return SLUG_BY_ID[id];
}

export function getInsightsArticleIdBySlug(slug: string): InsightsArticleId | null {
  const entry = Object.entries(SLUG_BY_ID).find(([, s]) => s === slug);
  return entry ? (entry[0] as InsightsArticleId) : null;
}

export const INSIGHTS_ARTICLE_IMAGE_BY_ID: Record<InsightsArticleId, string> = {
  article1: '/test/image-test.jpg',
  article2: '/articles/restaurant-industry.webp',
  article3: '/articles/ai-without-borders.webp',
  article4: '/articles/the-evolution-of-workforce.webp',
  article5: '/articles/beyond-borders.webp',
  article6: '/articles/future-proofing.webp',
  article7: '/articles/how-talent-platforms-revlotuionize.webp',
  article8: '/articles/the-new-workfoce-paradigm.webp',
  article9: '/articles/nearshore-outsourcing.webp',
  article10: '/articles/the-future-of-work.webp',
  article11: '/articles/securing-your-ci-cd.webp',
  article12: '/articles/exceptional-alternatives.webp',
  article13: '/articles/land-your-dream-job.webp',
};

export function getInsightsArticleImageSrc(
  id: InsightsArticleId,
  fallback: string = '/articles/article-1.webp',
): string {
  return INSIGHTS_ARTICLE_IMAGE_BY_ID[id] ?? fallback;
}

export const INSIGHTS_ARTICLES_PER_PAGE = 4;
