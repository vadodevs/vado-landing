"use client";

import { Loader2, Scale, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** `v2`: colores del preview Lead Engine V2. `outline`: mismo estilo que Historial / Rebúsqueda en ficha de lead. */
export type LeadEngineV2LeadActionButtonsAppearance = "v2" | "outline";

const OUTLINE_BTN_CLASS = "h-8 shrink-0 gap-1.5";

type LeadEngineV2LeadActionButtonsProps = {
  hasTavilyData?: boolean;
  descriptionReady?: boolean;
  icpVersionReady?: boolean;
  comparingIcp?: boolean;
  feedingTavily?: boolean;
  onCompareIcp?: () => void;
  onFeedWithTavily?: () => void;
  appearance?: LeadEngineV2LeadActionButtonsAppearance;
  className?: string;
};

export function LeadEngineV2LeadActionButtons({
  hasTavilyData = false,
  descriptionReady = false,
  icpVersionReady = true,
  comparingIcp = false,
  feedingTavily = false,
  onCompareIcp,
  onFeedWithTavily,
  appearance = "v2",
  className,
}: LeadEngineV2LeadActionButtonsProps) {
  const busy = comparingIcp || feedingTavily;
  const isOutline = appearance === "outline";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant={isOutline ? "outline" : undefined}
        size="sm"
        disabled={busy || !icpVersionReady || !descriptionReady || !onCompareIcp}
        title={
          !descriptionReady ? "Necesitas un resumen (Tavily) para comparar con el ICP" : undefined
        }
        className={
          isOutline
            ? OUTLINE_BTN_CLASS
            : "h-8 shrink-0 gap-1.5 border border-emerald-500/45 bg-emerald-500/12 text-[0.75rem] text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-60"
        }
        onClick={() => onCompareIcp?.()}
      >
        {comparingIcp ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            Comparando…
          </>
        ) : (
          <>
            <Scale className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Comparar con ICP
          </>
        )}
      </Button>
      <Button
        type="button"
        variant={isOutline ? "outline" : undefined}
        size="sm"
        disabled={busy || !onFeedWithTavily}
        className={
          isOutline
            ? OUTLINE_BTN_CLASS
            : "h-8 shrink-0 gap-1.5 border border-[#5B6EE1]/50 bg-[#5B6EE1]/15 text-[0.75rem] text-[#DDE2FF] hover:bg-[#5B6EE1]/25 disabled:opacity-60"
        }
        onClick={() => onFeedWithTavily?.()}
      >
        {feedingTavily ? (
          <>
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
            Buscando…
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {hasTavilyData ? "Actualizar con Tavily" : "Alimentar con Tavily"}
          </>
        )}
      </Button>
    </div>
  );
}
