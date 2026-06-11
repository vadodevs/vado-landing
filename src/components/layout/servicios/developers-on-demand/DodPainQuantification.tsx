import { useTranslation } from 'react-i18next';
import { Coins, Scale, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';

const SCOPE = 'services.developersOnDemand.painQuantification';

export function DodPainQuantification() {
  const { t } = useTranslation();

  const items = ['capital', 'inaction', 'speed'] as const;

  const viewportOpts = { once: true, margin: '-40px' } as const;
  const motionEase = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="border-t border-white/[0.06] bg-zinc-950 py-16 md:py-24">
      <CenterContainer>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: motionEase }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{t(`${SCOPE}.title`)}</h2>
        </motion.div>

        <ul className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8 md:items-stretch">
          {items.map((key, i) => {
            if (key === 'capital') {
              return (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOpts}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: motionEase }}
                  className="flex min-h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left md:p-8"
                >
                  <div className="mb-5 flex gap-4">
                    <div
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/35 bg-sky-500/[0.12] text-sky-300"
                      aria-hidden
                    >
                      <Scale className="size-5 stroke-[1.5]" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="text-base font-semibold leading-snug text-white md:text-[17px]">
                        {t(`${SCOPE}.items.capital.title`)}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-500/20 bg-gradient-to-b from-sky-500/[0.12] to-transparent px-4 py-4">
                    <p className="text-2xl font-bold tracking-tight text-white md:text-[1.65rem]">
                      {t(`${SCOPE}.items.capital.metric`)}
                    </p>
                    <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4">
                      <p className="text-sm font-medium text-zinc-300">{t(`${SCOPE}.items.capital.usLine`)}</p>
                      <p className="text-sm font-medium text-sky-300">{t(`${SCOPE}.items.capital.vadoLine`)}</p>
                    </div>
                  </div>
                </motion.li>
              );
            }

            if (key === 'inaction') {
              return (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOpts}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: motionEase }}
                  className="relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/[0.18] bg-white/[0.06] p-6 text-left shadow-[0_16px_50px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl md:p-8"
                >
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-emerald-500/[0.06]"
                    aria-hidden
                  />
                  <div className="relative flex min-h-full flex-col">
                    <div className="flex h-[4.25rem] items-center justify-center">
                      <div className="relative flex items-center justify-center" aria-hidden>
                        <Coins className="size-[2.85rem] text-amber-200/85" strokeWidth={1.25} />
                        <TrendingDown
                          className="absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-[42%] text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.75)]"
                          strokeWidth={2.75}
                        />
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-semibold tracking-wide text-sky-400 uppercase">
                      {t(`${SCOPE}.items.inaction.label`)}
                    </p>
                    <p className="mt-5 rounded-lg border border-white/[0.12] bg-black/25 px-3 py-2.5 text-center text-lg font-bold tracking-tight text-white">
                      {t(`${SCOPE}.items.inaction.headline`)}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-zinc-300 md:text-[15px]">
                      {t(`${SCOPE}.items.inaction.body`)}
                    </p>
                  </div>
                </motion.li>
              );
            }

            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOpts}
                transition={{ duration: 0.5, delay: i * 0.08, ease: motionEase }}
                className="flex min-h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-left md:p-8"
              >
                <h3 className="text-sm font-semibold tracking-wide text-sky-400 uppercase">
                  {t(`${SCOPE}.items.${key}.label`)}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-[15px]">
                  {t(`${SCOPE}.items.${key}.body`)}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </CenterContainer>
    </section>
  );
}
