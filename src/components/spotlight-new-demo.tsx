'use client';

import { Spotlight } from '@/components/ui/spotlight-new';

export default function SpotlightNewDemo() {
  return (
    <div
      className="relative flex h-[40rem] w-full overflow-hidden rounded-md bg-black/[0.96] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] antialiased [background-size:4rem_4rem] md:items-center md:justify-center"
    >
      <Spotlight />
      <div className="relative z-10 mx-auto max-w-7xl w-full pt-20 p-4 md:pt-0">
        <h1 className="bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          Spotlight <br /> which is not overused.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          A subtle yet effective spotlight effect, because the previous version is used a bit too much these days.
        </p>
      </div>
    </div>
  );
}
