"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type AiGradientChromeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: React.ReactNode;
  /** Muestra el borde cónico animado (p. ej. mientras el MCP Chat está ocupado). */
  isProcessing?: boolean;
};

export function AiGradientChromeButton({
  className,
  children,
  isProcessing = false,
  disabled,
  type = "button",
  ...props
}: AiGradientChromeButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isProcessing}
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-md p-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {isProcessing ? (
        <>
          <span
            aria-hidden
            className="absolute inset-[-1000%] z-0 animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
          />
          <span className="relative z-[1] inline-flex h-full w-full items-center justify-center gap-1.5 rounded-md bg-background px-3 py-1.5 text-xs font-medium text-foreground">
            {children}
          </span>
        </>
      ) : (
        <span className="relative inline-flex h-full w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          {children}
        </span>
      )}
    </button>
  );
}
