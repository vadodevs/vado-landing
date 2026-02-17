import { useParams, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { ProjectCaseStudyTemplate } from '@/components/layout/nuestro-trabajo/ProjectCaseStudyTemplate';
import { getCaseStudyConfig } from '@/components/layout/nuestro-trabajo/caseStudyConfigs';

const KNOWN_SLUGS = [
  'zenqur',
  'ebm',
  'digitalRanch',
  'cipreses',
  'sendero',
  'easySales',
] as const;

export default function NuestroTrabajoProject() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug ?? '';
  const { t } = useTranslation();
  const { path } = useLocale();

  const isValid = KNOWN_SLUGS.includes(slug as (typeof KNOWN_SLUGS)[number]);
  const projectKey = isValid ? (slug as (typeof KNOWN_SLUGS)[number]) : null;
  const caseStudyConfig = getCaseStudyConfig(slug, t);

  return (
    <>
      <PageTitle
        title={
          projectKey
            ? `${t(`ourWork.projects.${projectKey}.title`)} | ${t('nav.ourWork')}`
            : t('nav.ourWork')
        }
      />
      <MainLayout>
        {caseStudyConfig ? (
          <ProjectCaseStudyTemplate config={caseStudyConfig} />
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
