"use client";

import { useCallback, useEffect, useState } from "react";
import { Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type LeadEngineIcpPeekCardProps = {
  name: string;
  description?: string | null;
  /** Ej. "Pipeline" o "Lead Engine". */
  contextLabel?: string;
  accent?: "violet" | "blue";
  /** Una línea más compacta (lead-engine-v2). */
  compact?: boolean;
  className?: string;
};

const accentStyles = {
  violet: {
    card: "border-violet-500/25 bg-gradient-to-b from-violet-500/10 to-transparent hover:border-violet-500/40",
    pressing:
      "scale-[0.985] border-violet-500/55 bg-violet-500/22 shadow-[inset_0_2px_12px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/35",
    icon: "border-violet-500/30 bg-violet-500/15 text-violet-200",
    iconPress: "scale-95 border-violet-500/45 bg-violet-500/25",
    label: "text-violet-200/80",
  },
  blue: {
    card: "border-[#3390FF]/25 bg-gradient-to-b from-[#3390FF]/10 to-transparent hover:border-[#3390FF]/40",
    pressing:
      "scale-[0.985] border-[#3390FF]/55 bg-[#3390FF]/22 shadow-[inset_0_2px_12px_rgba(51,144,255,0.15)] ring-1 ring-[#3390FF]/35",
    icon: "border-[#3390FF]/30 bg-[#3390FF]/15 text-[#D6EBFF]",
    iconPress: "scale-95 border-[#3390FF]/45 bg-[#3390FF]/25",
    label: "text-[#7CB8FF]/90",
  },
} as const;

export function LeadEngineIcpPeekCard({
  name,
  description,
  contextLabel = "Lead Engine",
  accent = "violet",
  compact = false,
  className,
}: LeadEngineIcpPeekCardProps) {
  const tone = accentStyles[accent];
  const [pressing, setPressing] = useState(false);
  const trimmed = description?.trim() ?? "";
  const hasDescription = trimmed.length > 0;

  const endPress = useCallback(() => setPressing(false), []);

  useEffect(() => {
    setPressing(false);
  }, [name]);

  useEffect(() => {
    if (!pressing) return;
    window.addEventListener("pointerup", endPress);
    window.addEventListener("pointercancel", endPress);
    return () => {
      window.removeEventListener("pointerup", endPress);
      window.removeEventListener("pointercancel", endPress);
    };
  }, [pressing, endPress]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setPressing(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setPressing(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={pressing}
        aria-label={
          hasDescription
            ? `Mantené pulsado para ver la descripción del ICP ${name}`
            : `ICP ${name}, sin descripción`
        }
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={endPress}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "w-full cursor-pointer rounded-lg border text-left transition-[transform,background-color,border-color,box-shadow] duration-100",
          tone.card,
          "touch-manipulation select-none",
          pressing && tone.pressing,
          className
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            compact ? "gap-2.5 px-3 py-2" : "p-3 sm:px-4 sm:py-3.5"
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg border transition-transform duration-100",
              compact ? "h-8 w-8" : "h-10 w-10",
              tone.icon,
              pressing && tone.iconPress
            )}
          >
            <Target className={cn(compact ? "h-4 w-4" : "h-5 w-5")} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-[0.65rem] font-medium uppercase tracking-wide", tone.label)}>
              ICP · {contextLabel}
            </p>
            <p
              className={cn(
                "truncate font-semibold leading-tight text-foreground",
                compact ? "mt-0 text-sm" : "mt-0.5 text-base"
              )}
            >
              {name}
            </p>
            {!compact ? (
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {hasDescription ? "Mantené pulsado para ver la descripción" : "Sin descripción en este ICP"}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={pressing} onOpenChange={(o) => !o && endPress()}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[min(85vh,32rem)] gap-3 sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onPointerDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="pr-2 text-base leading-snug">{name}</DialogTitle>
            <p className={cn("text-[0.65rem] font-medium uppercase tracking-wide", tone.label)}>
              ICP · {contextLabel}
            </p>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="max-h-[min(60vh,24rem)] overflow-y-auto rounded-md border border-border/70 bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground scrollbar-thin">
              {hasDescription ? (
                <span className="whitespace-pre-wrap">{trimmed}</span>
              ) : (
                <span className="italic text-muted-foreground">
                  Sin descripción en este ICP. Completa el perfil en Configuración para mejores resultados.
                </span>
              )}
            </div>
          </DialogDescription>
          <p className="text-center text-[0.65rem] text-muted-foreground">Suelta para cerrar</p>
        </DialogContent>
      </Dialog>
    </>
  );
}
