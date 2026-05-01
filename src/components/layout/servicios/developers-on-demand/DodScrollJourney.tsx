import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from 'motion/react';
import { MessageSquare, Rocket, Users, Layers3 } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { cn } from '@/lib/utils';

const STEP_ORDER = ['client', 'team', 'build', 'launch'] as const;

const ICONS = {
  client: MessageSquare,
  team: Users,
  build: Layers3,
  launch: Rocket,
} as const;

const SCOPE = 'services.developersOnDemand.journey';

const cardEase = [0.22, 1, 0.36, 1] as const;

export function DodScrollJourney() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.min(STEP_ORDER.length - 1, Math.floor(latest * STEP_ORDER.length));
    setPhase((prev) => (prev !== next ? next : prev));
  });

  return (
    <section ref={sectionRef} className="relative h-[320vh] bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="sticky top-[max(4rem,8vh)] z-[1] pb-16 pt-6 md:top-[max(5rem,10vh)] md:pb-24 md:pt-10">
        <CenterContainer>
          <motion.header
            className="mx-auto mb-8 max-w-2xl text-center md:mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: cardEase }}
          >
            <p className="text-xs font-medium tracking-[0.28em] text-zinc-500 uppercase">{t(`${SCOPE}.label`)}</p>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl md:leading-tight">
              {t(`${SCOPE}.titleLine1`)}{' '}
              <span className="text-zinc-400">{t(`${SCOPE}.titleLine2`)}</span>
            </h2>
            <p className="mt-3 text-sm text-zinc-500 md:text-base">{t(`${SCOPE}.subtitle`)}</p>
          </motion.header>

          <motion.article
            className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 px-5 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-md md:px-10 md:py-10"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: cardEase }}
          >
            <p className="mb-8 text-center text-[11px] tracking-[0.2em] text-zinc-600 uppercase">
              {t(`${SCOPE}.inCardHint`)}
            </p>

            {/* Timeline animada según scroll */}
            <div className="relative px-1 md:px-4">
              <div className="relative flex justify-between gap-2 md:gap-4">
                <div className="pointer-events-none absolute left-[10%] right-[10%] top-[22px] md:top-[26px]">
                  <div className="h-[3px] w-full rounded-full bg-white/[0.08]" />
                  <motion.div
                    className="absolute left-0 top-0 h-[3px] w-full origin-left rounded-full bg-white"
                    style={{ scaleX: lineScale }}
                  />
                </div>

                {STEP_ORDER.map((key, index) => {
                  const Icon = ICONS[key];
                  const active = phase === index;
                  const done = phase > index;

                  return (
                    <div key={key} className="relative z-[1] flex flex-1 flex-col items-center">
                      <motion.div
                        className={cn(
                          'flex size-11 items-center justify-center rounded-full border md:size-[52px]',
                          done || active
                            ? 'border-white/25 bg-white/[0.08] text-white'
                            : 'border-white/[0.06] bg-black/40 text-zinc-600',
                        )}
                        animate={{
                          scale: active ? 1.08 : 1,
                          boxShadow: active
                            ? '0 0 0 6px rgba(255,255,255,0.06), 0 0 28px rgba(255,255,255,0.12)'
                            : '0 0 0 0px rgba(255,255,255,0)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      >
                        <Icon className="size-[18px] md:size-[22px]" aria-hidden />
                      </motion.div>
                      <span
                        className={cn(
                          'mt-3 hidden text-center text-[10px] font-medium tracking-wider uppercase sm:block',
                          active ? 'text-zinc-300' : done ? 'text-zinc-500' : 'text-zinc-700',
                        )}
                      >
                        {t(`${SCOPE}.steps.${key}.short`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative mt-10 min-h-[200px] border-t border-white/[0.06] pt-10 md:mt-12 md:min-h-[220px] md:pt-12">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={phase}
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.38, ease: cardEase }}
                  className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8"
                >
                  <motion.div
                    className="relative mx-auto size-16 shrink-0 md:mx-0 md:size-20"
                    initial={{ scale: 0.88 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <motion.span
                      key={phase}
                      className="pointer-events-none absolute inset-[-8px] rounded-2xl bg-white/12"
                      initial={{ opacity: 0.4, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 1.25, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <div className="relative flex size-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                      {(() => {
                        const stepKey = STEP_ORDER[phase];
                        const StepIcon = ICONS[stepKey];
                        return <StepIcon className="size-8 text-white md:size-9" aria-hidden />;
                      })()}
                    </div>
                  </motion.div>

                  <div className="min-w-0 flex-1 text-center md:text-left">
                    <p className="font-mono text-xs text-zinc-600 tabular-nums">
                      {String(phase + 1).padStart(2, '0')} / {String(STEP_ORDER.length).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                      {t(`${SCOPE}.steps.${STEP_ORDER[phase]}.title`)}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-500 md:text-base">
                      {t(`${SCOPE}.steps.${STEP_ORDER[phase]}.description`)}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.article>
        </CenterContainer>
      </div>
    </section>
  );
}
