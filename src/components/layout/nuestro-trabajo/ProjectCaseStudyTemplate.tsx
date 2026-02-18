import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
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
import type { ProjectHeroProps } from '@/components/layout/nuestro-trabajo/ProjectHero';

export type CaseStudySection = {
  label: string;
  title: string;
  /** Recibe el componente Accent para resaltar texto con el color del proyecto */
  content: (Accent: React.ComponentType<{ children: React.ReactNode }>) => React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
};

export type ProjectCaseStudyConfig = {
  /** Id del proyecto (ej: 'zenqur') para filtrar en "Otros casos de uso" */
  projectId: string;
  hero: Omit<ProjectHeroProps, 'backHref' | 'backLabel'>;
  stack: ProjectStackItem[];
  accentColor: string;
  sections: CaseStudySection[];
};

function CaseSection({
  label,
  title,
  children,
  imageSrc,
  imageAlt,
  reverse = false,
  accentColor,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  reverse?: boolean;
  accentColor?: string;
}) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div
          className={`flex flex-col gap-10 lg:gap-16 ${imageSrc ? (reverse ? 'lg:flex-row-reverse' : 'lg:flex-row') : ''} w-full lg:items-center`}
        >
          <div className="flex-1 space-y-4">
            <span
              className={`text-sm font-semibold tracking-wider uppercase ${!accentColor ? 'text-primary' : ''}`}
              style={accentColor ? { color: accentColor } : undefined}
            >
              {label}
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-[1.75rem]">
              {title}
            </h2>
            <div className="text-muted-foreground space-y-4 text-base leading-relaxed md:text-lg">
              {children}
            </div>
          </div>
          {imageSrc && (
            <div className="flex flex-1 justify-center lg:max-w-md">
              <div className="bg-muted/50 ring-border/50 relative overflow-hidden rounded-2xl shadow-lg ring-1">
                <img src={imageSrc} alt={imageAlt ?? ''} className="h-auto w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </CenterContainer>
    </section>
  );
}

function OtherCasesSection({ projectId, accentColor }: { projectId: string; accentColor: string }) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const otherProjects = OUR_WORK_PROJECTS.filter((p) => p.id !== projectId);

  return (
    <section className="border-border bg-muted/30 border-t py-16 md:py-24">
      <CenterContainer>
        <div className="space-y-12 md:space-y-16">
          <header className="max-w-2xl">
            <span
              className="mb-2 block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: accentColor }}
            >
              Más trabajo
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Otros casos de uso
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Conoce otros proyectos que hemos desarrollado junto a nuestros clientes.
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
                        src={project.image.startsWith('/') ? project.image : `/projects/${project.image}`}
                        alt=""
                        className="size-full object-contain object-center p-6"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.25 }}
                      />
                      <span
                        className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-xs font-medium tracking-wide text-white shadow-sm ${project.badgeColor ? '' : BADGE_COLORS[project.categoryKey as CategoryKey]}`}
                        style={
                          project.badgeColor ? { backgroundColor: project.badgeColor } : undefined
                        }
                      >
                        {t(`ourWork.projects.${project.id}.category`)}
                      </span>
                    </div>
                    <div className="border-border flex flex-col gap-0.5 border-x-0 border-t border-b-0 px-5 py-4">
                      <h3 className="text-foreground font-bold tracking-tight group-hover:underline">
                        {t(`ourWork.projects.${project.id}.title`)}
                        {t(`ourWork.projects.${project.id}.subtitle`) && (
                          <>
                            <span className="text-muted-foreground font-normal"> · </span>
                            <span className="text-foreground/90">
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
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <span aria-hidden>←</span> Volver a Nuestro trabajo
            </Link>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}

export function ProjectCaseStudyTemplate({ config }: { config: ProjectCaseStudyConfig }) {
  const { projectId, hero, stack, accentColor, sections } = config;

  const Accent = ({ children }: { children: React.ReactNode }) => (
    <span className="font-semibold" style={{ color: accentColor }}>
      {children}
    </span>
  );

  return (
    <article className="bg-background">
      <ProjectHero {...hero} />

      <ProjectStack items={stack} variant="logos-row" accentColor={accentColor} label="Stack" />

      {sections.map((section, index) => (
        <CaseSection
          key={index}
          label={section.label}
          title={section.title}
          accentColor={accentColor}
          imageSrc={section.imageSrc}
          imageAlt={section.imageAlt}
          reverse={section.reverse}
        >
          {section.content(Accent)}
        </CaseSection>
      ))}

      <OtherCasesSection projectId={projectId} accentColor={accentColor} />
    </article>
  );
}
