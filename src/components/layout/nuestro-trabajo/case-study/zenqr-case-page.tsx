import { Link } from 'wouter';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'motion/react';
import { FaGlobe } from 'react-icons/fa';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import {
  ProjectStack,
  type ProjectStackItem,
} from '@/components/layout/nuestro-trabajo/ProjectStack';
import {
  OUR_WORK_PROJECTS,
  BADGE_COLORS,
  type CategoryKey,
} from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import { useLocale } from '@/hooks/useLocale';

const ZENQR_ACCENT = '#10b981';

function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-semibold" style={{ color: ZENQR_ACCENT }}>
      {children}
    </span>
  );
}

const ZENQR_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
  { name: 'Stripe', icon: 'stripe' },
];

function ZenqrCaseSection({
  label,
  title,
  children,
  reverse,
  variant = 'default',
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  reverse?: boolean;
  variant?: 'default' | 'minimal';
}) {
  const titleClass =
    'text-2xl font-bold tracking-tight text-slate-700 md:text-3xl lg:text-[1.75rem]';
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer className="lg:px-0">
        <div
          className={`flex w-full flex-col gap-10 lg:items-center lg:gap-16 ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          <div className="flex-1 space-y-4">
            {variant === 'default' ? (
              <>
                <span
                  className="text-sm font-semibold tracking-wider uppercase"
                  style={{ color: ZENQR_ACCENT }}
                >
                  {label}
                </span>
                <h2 className={titleClass}>{title}</h2>
              </>
            ) : (
              <h2 className={`border-l-4 pl-4 ${titleClass}`} style={{ borderColor: ZENQR_ACCENT }}>
                {title}
              </h2>
            )}
            <div className="text-muted-foreground space-y-4 text-base leading-relaxed md:text-lg">
              {children}
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}

function ZenqrOtherCases() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const otherProjects = OUR_WORK_PROJECTS.filter((p) => p.id !== 'zenqr');

  return (
    <section className="border-border bg-muted/30 border-t py-16 md:py-24">
      <CenterContainer>
        <div className="space-y-12 md:space-y-16">
          <header className="max-w-2xl">
            <span
              className="mb-2 block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: ZENQR_ACCENT }}
            >
              {t('ourWork.caseStudy.zenqr.otherCases.label')}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-700 md:text-3xl">
              {t('ourWork.caseStudy.zenqr.otherCases.title')}
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              {t('ourWork.caseStudy.zenqr.otherCases.description')}
            </p>
          </header>

          <motion.ul
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
              hidden: {},
            }}
          >
            {otherProjects.map((project) => (
              <motion.li
                key={project.id}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 16 },
                }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link
                  href={path(`/nuestro-trabajo/${project.id}`)}
                  className="focus-visible:ring-primary group focus-visible:ring-offset-background block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <motion.article
                    className="bg-background ring-border/50 overflow-hidden rounded-2xl shadow-sm ring-1"
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: 'tween', duration: 0.2 }}
                  >
                    <div className="bg-muted/40 relative aspect-4/3 overflow-hidden">
                      <motion.img
                        src={`/projects/${project.image}`}
                        alt=""
                        className="size-full object-contain object-center p-6"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.25 }}
                      />
                      <span
                        className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-xs font-medium tracking-wide text-white shadow-sm ${
                          project.badgeColor ? '' : BADGE_COLORS[project.categoryKey as CategoryKey]
                        }`}
                        style={
                          project.badgeColor ? { backgroundColor: project.badgeColor } : undefined
                        }
                      >
                        {t(`ourWork.projects.${project.id}.category`)}
                      </span>
                    </div>
                    <div className="border-border flex flex-col gap-0.5 border-x-0 border-t border-b-0 px-5 py-4">
                      <h3 className="font-bold tracking-tight text-slate-700 group-hover:underline">
                        {t(`ourWork.projects.${project.id}.title`)}
                        {t(`ourWork.projects.${project.id}.subtitle`) && (
                          <>
                            <span className="text-muted-foreground font-normal"> · </span>
                            <span className="text-slate-600">
                              {t(`ourWork.projects.${project.id}.subtitle`)}
                            </span>
                          </>
                        )}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                        {t(`ourWork.projects.${project.id}.description`)}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <div className="flex justify-center pt-4">
            <Link
              href={path('/nuestro-trabajo')}
              className="text-muted-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-slate-700"
            >
              <span aria-hidden>←</span> {t('ourWork.caseStudy.zenqr.otherCases.backLink')}
            </Link>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}

export function ZenqurCasePage() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <article className="bg-background">
      <ProjectHero
        backHref={path('/nuestro-trabajo')}
        backLabel={t('nav.ourWork')}
        logoSrc="/brands/zenqr.svg"
        logoAlt="ZenQR"
        title={t('ourWork.caseStudy.zenqr.hero.title')}
        description={t('ourWork.caseStudy.zenqr.hero.description')}
        cta={{
          href: 'https://zenqr.app',
          label: t('ourWork.caseStudy.zenqr.hero.ctaLabel'),
          ariaLabel: t('ourWork.caseStudy.zenqr.hero.ctaAriaLabel'),
          icon: <FaGlobe className="size-4 shrink-0" />,
        }}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={t('ourWork.caseStudy.zenqr.hero.heroImageAlt')}
        backgroundColor={ZENQR_ACCENT}
      />

      <ProjectStack
        items={ZENQR_STACK}
        variant="logos-row"
        accentColor={ZENQR_ACCENT}
        label={t('ourWork.caseStudy.zenqr.stackLabel')}
      />

      <ZenqrCaseSection
        label={t('ourWork.caseStudy.zenqr.overview.label')}
        title={t('ourWork.caseStudy.zenqr.overview.title')}
      >
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.overview.paragraph"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
      </ZenqrCaseSection>

      <ZenqrCaseSection
        label={t('ourWork.caseStudy.zenqr.challenge.label')}
        title={t('ourWork.caseStudy.zenqr.challenge.title')}
        reverse
        variant="minimal"
      >
        <p>{t('ourWork.caseStudy.zenqr.challenge.intro')}</p>
        <ul className="list-inside list-disc space-y-2 pl-2">
          <li>{t('ourWork.caseStudy.zenqr.challenge.list1')}</li>
          <li>{t('ourWork.caseStudy.zenqr.challenge.list2')}</li>
          <li>{t('ourWork.caseStudy.zenqr.challenge.list3')}</li>
          <li>{t('ourWork.caseStudy.zenqr.challenge.list4')}</li>
        </ul>
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.challenge.afterList"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.challenge.closing"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
      </ZenqrCaseSection>

      <ZenqrCaseSection
        label={t('ourWork.caseStudy.zenqr.solution.label')}
        title={t('ourWork.caseStudy.zenqr.solution.title')}
        variant="minimal"
      >
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.solution.paragraph1"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.solution.paragraph2"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
        <p className="font-medium text-slate-700">
          {t('ourWork.caseStudy.zenqr.solution.listTitle')}
        </p>
        <ul className="list-inside list-disc space-y-2 pl-2">
          <li>{t('ourWork.caseStudy.zenqr.solution.list1')}</li>
          <li>{t('ourWork.caseStudy.zenqr.solution.list2')}</li>
          <li>{t('ourWork.caseStudy.zenqr.solution.list3')}</li>
          <li>{t('ourWork.caseStudy.zenqr.solution.list4')}</li>
          <li>{t('ourWork.caseStudy.zenqr.solution.list5')}</li>
        </ul>
      </ZenqrCaseSection>

      <ZenqrCaseSection
        label={t('ourWork.caseStudy.zenqr.results.label')}
        title={t('ourWork.caseStudy.zenqr.results.title')}
        reverse
        variant="minimal"
      >
        <p>
          <Trans
            i18nKey="ourWork.caseStudy.zenqr.results.paragraph"
            components={{ accent: <Accent>{''}</Accent> }}
          />
        </p>
      </ZenqrCaseSection>

      <ZenqrOtherCases />
    </article>
  );
}
