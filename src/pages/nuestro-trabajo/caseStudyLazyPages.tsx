import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const caseStudyLoaders = {
  zenqr: () =>
    import('@/components/layout/nuestro-trabajo/case-study/zenqr-case-page').then((m) => ({
      default: m.ZenqurCasePage,
    })),
  sendero: () =>
    import('@/components/layout/nuestro-trabajo/case-study/sendero-case-page').then((m) => ({
      default: m.SenderoCasePage,
    })),
  ebm: () =>
    import('@/components/layout/nuestro-trabajo/case-study/ebm-case-page').then((m) => ({
      default: m.EbmCasePage,
    })),
  digitalRanch: () =>
    import('@/components/layout/nuestro-trabajo/case-study/digitalRanch-case-page').then((m) => ({
      default: m.DigitalRanchCasePage,
    })),
  easySales: () =>
    import('@/components/layout/nuestro-trabajo/case-study/easySales-case-page').then((m) => ({
      default: m.EasySalesCasePage,
    })),
  cipreses: () =>
    import('@/components/layout/nuestro-trabajo/case-study/cipreses-case-page').then((m) => ({
      default: m.CipresesCasePage,
    })),
  maggiore: () =>
    import('@/components/layout/nuestro-trabajo/case-study/maggiore-case-page').then((m) => ({
      default: m.MaggioreCasePage,
    })),
  washaut: () =>
    import('@/components/layout/nuestro-trabajo/case-study/washaut-case-page').then((m) => ({
      default: m.WashautCasePage,
    })),
} as const satisfies Record<string, () => Promise<{ default: ComponentType }>>;

export type CaseStudySlug = keyof typeof caseStudyLoaders;

export const CASE_STUDY_LAZY_PAGES = Object.fromEntries(
  Object.entries(caseStudyLoaders).map(([slug, load]) => [slug, lazy(load)]),
) as unknown as Record<CaseStudySlug, LazyExoticComponent<ComponentType>>;

export const CASE_STUDY_SLUGS = Object.keys(caseStudyLoaders) as CaseStudySlug[];

export function isCaseStudySlug(slug: string): slug is CaseStudySlug {
  return slug in caseStudyLoaders;
}
