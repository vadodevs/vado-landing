import { useParams } from 'wouter';
import { ARTICULO_PAGES } from './articleRegistry';
import { NotFound } from '@/pages/not-found';

export default function ArticleRouter() {
  const params = useParams<{ articleName?: string }>();
  const articleName = params?.articleName ?? '';

  const ArticlePage = articleName ? ARTICULO_PAGES[articleName] : undefined;

  if (!ArticlePage) {
    return <NotFound />;
  }

  return <ArticlePage />;
}
