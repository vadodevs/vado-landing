"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LINES = [
  "Conectando con Tavily…",
  "Recorriendo el sitio web…",
  "Buscando en LinkedIn y directorios…",
  "Consultando fuentes externas…",
  "Extrayendo datos estructurados…",
  "Rellenando campos del lead…",
] as const;

type LeadEngineV2TavilyFeedOverlayProps = {
  domain: string;
  className?: string;
};

export function LeadEngineV2TavilyFeedOverlay({
  domain,
  className,
}: LeadEngineV2TavilyFeedOverlayProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden",
        "bg-background/85 backdrop-blur-[3px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Tavily analizando ${domain}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(91,110,225,0.35), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 animate-[tavily-scan_2.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#8B9CF5] to-transparent opacity-80"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 animate-ping rounded-full border border-[#5B6EE1]/40 bg-[#5B6EE1]/10"
            aria-hidden
          />
          <span
            className="absolute inset-1 animate-pulse rounded-full border border-[#5B6EE1]/55 bg-[#5B6EE1]/15"
            aria-hidden
          />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#5B6EE1]/50 bg-[#1B1B3A]/90 shadow-[0_0_20px_rgba(91,110,225,0.35)]">
            <Image
              src="/logos/tavily.svg"
              alt=""
              width={56}
              height={18}
              className="h-4 w-auto object-contain"
              aria-hidden
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-[#C5CEFF]">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            Buscando datos con Tavily
          </p>
          <p className="font-mono text-xs text-muted-foreground">{domain}</p>
          <p
            key={lineIndex}
            className="animate-in fade-in slide-in-from-bottom-1 text-xs text-[#9EA8FF] duration-500"
          >
            {STATUS_LINES[lineIndex]}
          </p>
        </div>

        <div className="flex gap-1.5 pt-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#5B6EE1]/70 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
