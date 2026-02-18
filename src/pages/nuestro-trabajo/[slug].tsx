import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { OUR_WORK_PROJECTS } from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import { ZenqurCasePage } from '@/components/layout/nuestro-trabajo/case-study/zenqr-case-page';
import { SenderoCasePage } from '@/components/layout/nuestro-trabajo/case-study/sendero-case-page';
import { EbmCasePage } from '@/components/layout/nuestro-trabajo/case-study/ebm-case-page';
import { DigitalRanchCasePage } from '@/components/layout/nuestro-trabajo/case-study/digitalRanch-case-page';
import { EasySalesCasePage } from '@/components/layout/nuestro-trabajo/case-study/easySales-case-page';
import { CipresesCasePage } from '@/components/layout/nuestro-trabajo/case-study/cipreses-case-page';
import { MaggioreCasePage } from '@/components/layout/nuestro-trabajo/case-study/maggiore-case-page';
import { WashappCasePage } from '@/components/layout/nuestro-trabajo/case-study/washapp-case-page';

const KNOWN_SLUGS = [
  'zenqr',
  'sendero',
  'ebm',
  'digitalRanch',
  'easySales',
  'cipreses',
  'maggiore',
  'washapp',
] as const;

const CASE_COMPONENTS: Record<(typeof KNOWN_SLUGS)[number], React.ComponentType> = {
  zenqr: ZenqurCasePage,
  sendero: SenderoCasePage,
  ebm: EbmCasePage,
  digitalRanch: DigitalRanchCasePage,
  easySales: EasySalesCasePage,
  cipreses: CipresesCasePage,
  maggiore: MaggioreCasePage,
  washapp: WashappCasePage,
};

export default function NuestroTrabajoProject() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? '';
  const { t } = useTranslation();
  const { path } = useLocale();

  const isValid = KNOWN_SLUGS.includes(slug as (typeof KNOWN_SLUGS)[number]);
  const projectKey = isValid ? (slug as (typeof KNOWN_SLUGS)[number]) : null;
  const CaseComponent = projectKey ? CASE_COMPONENTS[projectKey] : null;

  const pageTitle = projectKey
    ? `${t(`ourWork.projects.${projectKey}.title`)} | ${t('nav.ourWork')}`
    : t('nav.ourWork');
  const project = projectKey ? OUR_WORK_PROJECTS.find((p) => p.id === projectKey) : null;
  const ogImage = project?.image?.startsWith('/') ? project.image : project ? `/projects/${project.image}` : undefined;
  const canonicalPath = projectKey ? path(`/nuestro-trabajo/${projectKey}`) : undefined;
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
        />
      ) : (
        <PageTitle title={pageTitle} />
      )}
      <MainLayout>
        {CaseComponent ? (
          <CaseComponent />
        ) : (
          <div className="bg-muted/40 py-12 md:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              {projectKey ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {t(`ourWork.projects.${projectKey}.title`)}
                    {t(`ourWork.projects.${projectKey}.subtitle`) && (
                      <>
                        {' | '}
                        <span className="font-semibold">
                          {t(`ourWork.projects.${projectKey}.subtitle`)}
                        </span>
                      </>
                    )}
                  </h1>
                  <p className="mt-4 text-muted-foreground">
                    {t(`ourWork.projects.${projectKey}.description`)}
                  </p>
                  <Link
                    href={path('/nuestro-trabajo')}
                    className="mt-8 inline-block text-primary underline underline-offset-2 hover:no-underline"
                  >
                    ← {t('nav.ourWork')}
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
                  <p className="text-muted-foreground">
                    Proyecto no encontrado.
                  </p>
                  <Link
                    href={path('/nuestro-trabajo')}
                    className="mt-8 inline-block text-primary underline underline-offset-2 hover:no-underline"
                  >
                    ← Volver a Nuestro trabajo
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </MainLayout>
    </>
  );
}
