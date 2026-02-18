import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import {
  OUR_WORK_PROJECTS,
  BADGE_COLORS,
  type CategoryKey,
} from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import { useLocale } from '@/hooks/useLocale';

export function SenderoOtherCases() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const otherProjects = OUR_WORK_PROJECTS.filter((p) => p.id !== 'sendero').slice(0, 3);

  return (
    <section className="border-border bg-muted/30 border-t py-16 md:py-24">
      <CenterContainer>
        <h2 className="mb-10 text-2xl font-bold tracking-tight text-slate-700 md:text-3xl">
          {t('ourWork.caseStudy.sendero.otherCases.title')}
        </h2>
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
                  className="bg-background ring-border/50 rounded-2xl shadow-sm ring-1"
                  whileHover={{
                    y: -4,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ type: 'tween', duration: 0.2 }}
                >
                  <div className="bg-muted/40 relative aspect-4/3">
                    <motion.img
                      src={project.image.startsWith('/') ? project.image : `/projects/${project.image}`}
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
      </CenterContainer>
    </section>
  );
}
