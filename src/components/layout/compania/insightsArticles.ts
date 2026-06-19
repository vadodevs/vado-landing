
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
  article1: 'digitalization-in-retail',
  article2: 'technology-transforming-restaurant-industry',
  article3: 'ai-without-borders',
  article4: 'evolution-of-remote-work-talent-acquisition',
  article5: 'beyond-borders-global-talent-pools',
  article6: 'future-proofing-with-talent-marketplaces',
  article7: 'how-talent-platforms-revolutionize-growth',
  article8: 'new-labor-paradigm-senior-talent',
  article9: '10-reasons-nearshore-outsourcing-success',
  article10: 'future-of-work-across-borders',
  article11: 'securing-your-ci-cd-pipeline',
  article12: 'benefits-of-nearshore-engineering',
  article13: 'land-your-dream-software-job',
};

export function getInsightsArticleSlug(id: InsightsArticleId): string {
  return SLUG_BY_ID[id];
}

export function getInsightsArticleIdBySlug(slug: string): InsightsArticleId | null {
  const entry = Object.entries(SLUG_BY_ID).find(([, s]) => s === slug);
  return entry ? (entry[0] as InsightsArticleId) : null;
}

export const INSIGHTS_ARTICLE_IMAGE_BY_ID: Record<InsightsArticleId, string> = {
  article1: '/articles/digitalization-retail.webp',
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
