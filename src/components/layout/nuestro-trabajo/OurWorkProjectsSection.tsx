import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'wouter';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';
import {
  OUR_WORK_PROJECTS,
  BADGE_COLORS,
} from '@/components/layout/nuestro-trabajo/ourWorkProjects';

const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASING,
    },
  },
};

export function OurWorkProjectsSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <motion.section
      className="py-12 md:py-16 lg:py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CenterContainer>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:gap-8"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {OUR_WORK_PROJECTS.map((project) => (
            <Link
              key={project.id}
              href={path(`/nuestro-trabajo/${project.id}`)}
              className="focus-visible:ring-primary block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <motion.div
                className="relative"
                variants={card}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className={`absolute top-[-6px] right-[-6px] z-10 rounded-tr-lg rounded-bl-lg px-3 py-1.5 text-xs font-medium tracking-wide text-white uppercase shadow ${project.badgeColor ? '' : BADGE_COLORS[project.categoryKey]}`}
                  style={project.badgeColor ? { backgroundColor: project.badgeColor } : undefined}
                >
                  {t(`ourWork.projects.${project.id}.category`)}
                </motion.span>
                <motion.article
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
                  whileHover={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center px-6 py-6 md:p-4">
                    <img
                      src={project.image.startsWith('/') ? project.image : `/projects/${project.image}`}
                      alt=""
                      className="h-auto w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-col gap-2 px-6 py-5 md:px-8 md:py-6">
                    <h3 className="text-foreground text-lg font-bold tracking-tight md:text-xl">
                      {t(`ourWork.projects.${project.id}.title`)}
                      {t(`ourWork.projects.${project.id}.subtitle`) && (
                        <>
                          {' | '}
                          <span className="font-semibold">
                            {t(`ourWork.projects.${project.id}.subtitle`)}
                          </span>
                        </>
                      )}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm md:text-base">
                      {t(`ourWork.projects.${project.id}.description`)}
                    </p>
                  </div>
                </motion.article>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </CenterContainer>
    </motion.section>
  );
}
