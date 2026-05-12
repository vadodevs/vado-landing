import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const articuloLoaders = {
  'digitalization-in-retail': () => import('./digitalizacion-retail'),
  'technology-transforming-restaurant-industry': () => import('./tecnologia-industria-restaurantera'),
  'ai-without-borders': () => import('./ia-sin-fronteras'),
  'evolution-of-remote-work-talent-acquisition': () => import('./evolucion-trabajo-remoto-talento'),
  'beyond-borders-global-talent-pools': () => import('./mas-alla-fronteras-talento-global'),
  'future-proofing-with-talent-marketplaces': () => import('./preparando-negocio-futuro-mercados-talento'),
  'how-talent-platforms-revolutionize-growth': () => import('./plataformas-talento-revolucionando-crecimiento'),
  'new-labor-paradigm-senior-talent': () => import('./nuevo-paradigma-laboral-talento-senior'),
  '10-reasons-nearshore-outsourcing-success': () => import('./10-razones-nearshore-outsourcing'),
  'future-of-work-across-borders': () => import('./futuro-trabajo-fronteras-decada-transformacion'),
  'securing-your-ci-cd-pipeline': () => import('./asegurando-pipeline-cicd-devops'),
  'benefits-of-nearshore-engineering': () => import('./desbloqueando-potencial-ingenieria-nearshore'),
  'land-your-dream-software-job': () => import('./consigue-trabajo-suenos-entrevista-desarrollo'),
} as const satisfies Record<string, () => Promise<{ default: ComponentType }>>;

export type ArticuloSlug = keyof typeof articuloLoaders;

/** Lazy page component per article slug (one network chunk per article when visited). */
export const ARTICULO_LAZY_PAGES = Object.fromEntries(
  Object.entries(articuloLoaders).map(([slug, load]) => [slug, lazy(load)]),
) as unknown as Record<ArticuloSlug, LazyExoticComponent<ComponentType>>;

export const ARTICULO_SLUGS = Object.keys(articuloLoaders) as ArticuloSlug[];

export function isArticuloSlug(slug: string): slug is ArticuloSlug {
  return slug in articuloLoaders;
}
