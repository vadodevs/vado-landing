"use client";

import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type V2FlowStepStatus = "idle" | "active" | "done" | "locked";

function stepDotClass(status: V2FlowStepStatus): string {
  switch (status) {
    case "active":
      return "border-[#3390FF]/60 bg-[#3390FF]/20 text-[#B8D9FF]";
    case "done":
      return "border-[#3390FF]/50 bg-[#3390FF]/15 text-[#9EC5FF]";
    case "locked":
      return "border-border/70 bg-muted/25 text-muted-foreground";
    default:
      return "border-border/60 bg-muted/15 text-muted-foreground";
  }
}

function FlowStepChip({
  n,
  label,
  status,
}: {
  n: number;
  label: string;
  status: V2FlowStepStatus;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium",
        stepDotClass(status)
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full text-[0.55rem] font-bold tabular-nums",
          status === "active" && "bg-[#3390FF]/35",
          status === "done" && "bg-[#3390FF]/30",
          (status === "locked" || status === "idle") && "bg-muted/80"
        )}
      >
        {status === "done" ? <Check className="h-2.5 w-2.5" aria-hidden /> : n}
      </span>
      <span className="whitespace-nowrap">{label}</span>
      {status === "locked" ? <Lock className="h-2.5 w-2.5 opacity-60" aria-hidden /> : null}
    </div>
  );
}

type LeadEngineV2FlowStepperProps = {
  hunterStatus: V2FlowStepStatus;
  tavilyStatus: V2FlowStepStatus;
  classifyStatus: V2FlowStepStatus;
  resultsStatus: V2FlowStepStatus;
  className?: string;
};

export function LeadEngineV2FlowStepper({
  hunterStatus,
  tavilyStatus,
  classifyStatus,
  resultsStatus,
  className,
}: LeadEngineV2FlowStepperProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <FlowStepChip n={1} label="Hunter" status={hunterStatus} />
      <span className="text-muted-foreground/30 text-xs" aria-hidden>
        →
      </span>
      <FlowStepChip n={2} label="Enriquecer" status={tavilyStatus} />
      <span className="text-muted-foreground/30 text-xs" aria-hidden>
        →
      </span>
      <FlowStepChip n={3} label="Clasificar" status={classifyStatus} />
      <span className="text-muted-foreground/30 text-xs" aria-hidden>
        →
      </span>
      <FlowStepChip n={4} label="Dominios" status={resultsStatus} />
    </div>
  );
}

type LeadEngineV2FlowShellProps = {
  historyPanel: ReactNode;
  historyOpen: boolean;
  hunterCard: ReactNode;
  tavilyCard: ReactNode;
  resultsPanel: ReactNode;
};

/**
 * Historial (opcional) | fila de cards Hunter + Tavily | dominios abajo a ancho completo.
 */
export function LeadEngineV2FlowShell({
  historyPanel,
  historyOpen,
  hunterCard,
  tavilyCard,
  resultsPanel,
}: LeadEngineV2FlowShellProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-4",
        historyOpen
          ? "lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
          : "grid-cols-1"
      )}
    >
      {historyOpen ? (
        <aside
          className={cn(
            "sticky top-3 z-[1] flex w-full min-w-0 flex-col self-start overflow-hidden",
            "h-[min(28rem,calc(100dvh-5.5rem))]",
            "lg:top-4 lg:h-[calc(100dvh-6.5rem)]"
          )}
        >
          {historyPanel}
        </aside>
      ) : null}

      <div className="min-w-0 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 md:items-start">
          {hunterCard}
          {tavilyCard}
        </div>
        {resultsPanel}
      </div>
    </div>
  );
}
