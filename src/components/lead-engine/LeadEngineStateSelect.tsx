"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getLeadEngineSubdivisionOptions } from "@/lib/lead-engine/subdivision-options";

type LeadEngineStateSelectProps = {
  id: string;
  country: "MX" | "US";
  value: string;
  onChange: (state: string) => void;
  className?: string;
};

/**
 * Estado (México) o estado federado (EE. UU.). Valor vacío = sin filtro regional.
 */
export function LeadEngineStateSelect({ id, country, value, onChange, className }: LeadEngineStateSelectProps) {
  const options = useMemo(() => getLeadEngineSubdivisionOptions(country), [country]);
  const trimmed = value.trim();
  const safeValue = options.some((o) => o.value === trimmed) ? trimmed : "";

  return (
    <Select
      id={id}
      aria-label="Estado o provincia"
      options={options}
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-11 w-full min-w-0", className)}
    />
  );
}
