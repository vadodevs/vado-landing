"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LEAD_ENGINE_COUNTRY_OPTIONS } from "@/lib/lead-engine/country-iso-options";
import { LeadEngineFlagSvg } from "@/components/lead-engine/LeadEngineFlagSvg";

type LeadEngineCountrySelectProps = {
  id: string;
  value: string;
  onChange: (iso2: string) => void;
  className?: string;
  /** Solo bandera clicable (MX ↔ US). Más limpio en layouts compactos. */
  flagOnly?: boolean;
};

/**
 * País: solo México y Estados Unidos; bandera desde `public/flags` (flag-icons, MIT).
 */
export function LeadEngineCountrySelect({
  id,
  value,
  onChange,
  className,
  flagOnly = false,
}: LeadEngineCountrySelectProps) {
  const options = useMemo(() => LEAD_ENGINE_COUNTRY_OPTIONS, []);
  const upper = value.trim().toUpperCase();
  const safeValue: "MX" | "US" = upper === "US" ? "US" : "MX";
  const label = safeValue === "MX" ? "México" : "Estados Unidos";
  const nextValue: "MX" | "US" = safeValue === "MX" ? "US" : "MX";
  const nextLabel = nextValue === "MX" ? "México" : "Estados Unidos";

  if (flagOnly) {
    return (
      <button
        type="button"
        id={id}
        aria-label={`País: ${label}. Clic para cambiar a ${nextLabel}`}
        title={`${label} · clic → ${nextLabel}`}
        onClick={() => onChange(nextValue)}
        className={cn(
          "flex h-10 w-12 shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/40 px-1 transition-colors hover:border-border hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <LeadEngineFlagSvg iso={safeValue} className="h-7" />
      </button>
    );
  }

  return (
    <div className="flex min-w-0 items-stretch gap-2">
      <div
        className="flex h-11 w-[3.25rem] shrink-0 items-center justify-center rounded-md border border-border/80 bg-muted/40 px-1"
        title={safeValue}
        aria-hidden
      >
        <LeadEngineFlagSvg iso={safeValue} className="h-7" />
      </div>
      <Select
        id={id}
        aria-label="País"
        options={options}
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        className={cn("min-w-0 flex-1", className)}
      />
    </div>
  );
}
