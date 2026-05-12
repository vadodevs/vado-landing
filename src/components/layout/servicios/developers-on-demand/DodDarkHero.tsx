import { Link } from 'wouter';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { Spotlight } from '@/components/ui/spotlight-new';
import { useLocale } from '@/hooks/useLocale';

export function DodDarkHero() {
  const { path } = useLocale();

  return (
    <section className="relative flex min-h-[min(88vh,920px)] flex-col justify-center overflow-hidden bg-black pb-20 pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:4rem_4rem]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 z-0">
        <Spotlight />
      </div>
      <CenterContainer className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <div className="px-4 py-10 text-center md:px-8 md:py-12">
            <p className="text-xs font-medium tracking-[0.35em] text-zinc-500 uppercase">
              IT STAFF AUGMENTATION
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-[1.12]">
              Nearshore IT Staff Augmentation in Mexico: High-Velocity AI-Native Engineering.
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
              Scale your product roadmap with senior talent in your timezone. Save 60% vs. US local hiring
              while retaining 100% code ownership.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-xl px-6">
                <Link href={path('/contact')}>Get a Free Strategy Session (7-Day Placement Guarantee).</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </CenterContainer>
    </section>
  );
}
