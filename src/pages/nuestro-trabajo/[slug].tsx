import { Suspense } from 'react';
import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { RoutePageFallback } from '@/components/layout/RoutePageFallback';
import { useLocale } from '@/hooks/useLocale';
import { OUR_WORK_PROJECTS } from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import { CASE_STUDY_LAZY_PAGES, isCaseStudySlug } from '@/pages/nuestro-trabajo/caseStudyLazyPages';

export default function NuestroTrabajoProject() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? '';
  const { t } = useTranslation();
  const { path } = useLocale();

  const projectKey = isCaseStudySlug(slug) ? slug : null;
  const CaseComponent = projectKey ? CASE_STUDY_LAZY_PAGES[projectKey] : null;

  const pageTitle = projectKey
    ? `${t(`ourWork.projects.${projectKey}.title`)} | ${t('nav.ourWork')}`
    : t('nav.ourWork');
  const project = projectKey ? OUR_WORK_PROJECTS.find((p) => p.id === projectKey) : null;
  const ogImage = project?.image?.startsWith('/') ? project.image : project ? `/projects/${project.image}` : undefined;
  const canonicalPath = projectKey ? path(`/our-work/${projectKey}`) : undefined;
  const caseStudyDesc = projectKey ? t(`ourWork.caseStudy.${projectKey}.hero.description`) : '';
  const metaDescription =
    projectKey &&
    caseStudyDesc &&
    !caseStudyDesc.startsWith('ourWork.caseStudy')
      ? caseStudyDesc
      : projectKey
        ? t(`ourWork.projects.${projectKey}.description`)
        : undefined;

  return (
    <>
      {projectKey ? (
        <PageMeta
          title={pageTitle}
          description={metaDescription ?? ''}
          image={ogImage}
          canonicalPath={canonicalPath}
          ogType="website"
          pathWithoutLang={projectKey ? `/our-work/${projectKey}` : undefined}
        />
      ) : (
        <PageTitle title={pageTitle} />
      )}
      <MainLayout>
        {CaseComponent ? (
          <Suspense fallback={<RoutePageFallback />}>
            <CaseComponent />
          </Suspense>
        ) : (
          <div className="bg-muted/40 py-12 md:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
                <p className="text-muted-foreground">
                  Proyecto no encontrado.
                </p>
                <Link
                  href={path('/our-work')}
                  className="mt-8 inline-block text-primary underline underline-offset-2 hover:no-underline"
                >
                  ← Volver a Nuestro trabajo
                </Link>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </>
  );
}
