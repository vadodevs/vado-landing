import { Suspense } from 'react';
import { useParams } from 'wouter';
import { RoutePageFallback } from '@/components/layout/RoutePageFallback';
import { ARTICULO_LAZY_PAGES, isArticuloSlug } from './articleRegistry';
import { NotFound } from '@/pages/not-found';

export default function ArticleRouter() {
  const params = useParams<{ articleName?: string }>();
  const articleName = params?.articleName ?? '';

  if (!isArticuloSlug(articleName)) {
    return <NotFound />;
  }

  const ArticlePage = ARTICULO_LAZY_PAGES[articleName];

  return (
    <Suspense fallback={<RoutePageFallback />}>
      <ArticlePage />
    </Suspense>
  );
}
