"use client";

import { Layers, ListChecks, Lock, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LeadEngineV2ClassifyLeadsCardProps = {
  domainCount: number;
  unlocked: boolean;
  className?: string;
};

const MOCK_ACTIONS = [
  {
    icon: ListChecks,
    label: "Clasificar encaje ICP",
    hint: "Score y etiquetas por dominio enriquecido.",
  },
  {
    icon: UserCheck,
    label: "Armar contacto principal",
    hint: "Decision maker, cargo y email para CRM.",
  },
  {
    icon: Layers,
    label: "Guardar leads",
    hint: "Fila en Leads con resumen y notas.",
  },
] as const;

export function LeadEngineV2ClassifyLeadsCard({
  domainCount,
  unlocked,
  className,
}: LeadEngineV2ClassifyLeadsCardProps) {
  const locked = !unlocked;

  return (
    <Card
      className={cn(
        "gap-0 py-0 relative border-emerald-500/25 bg-card/95 p-4 shadow-sm transition-opacity duration-500 sm:p-5",
        locked && "border-border/60 opacity-[0.72]",
        className
      )}
    >
      {locked ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-background/55 backdrop-blur-[1px]"
          aria-hidden
        />
      ) : null}

      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/10">
            <Layers className="h-5 w-5 text-emerald-400" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-emerald-400/90">
              Paso 3 · Mock
            </p>
            <h2 className="text-sm font-semibold text-foreground">Clasificar y armar leads</h2>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 border-amber-500/40 bg-amber-500/10 text-[0.65rem] text-amber-200/90">
          Próximamente
        </Badge>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {locked
          ? "Disponible después de Hunter y Tavily (vista previa)."
          : domainCount > 0
            ? `${domainCount} dominio${domainCount === 1 ? "" : "s"} listos para clasificar y exportar a Leads.`
            : "Sin dominios para clasificar — completa los pasos anteriores."}
      </p>

      <ul className="mb-4 space-y-2">
        {MOCK_ACTIONS.map(({ icon: Icon, label, hint }) => (
          <li
            key={label}
            className="flex gap-2 rounded-md border border-border/60 bg-muted/10 px-2.5 py-2"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/80" aria-hidden />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-foreground">{label}</span>
              <span className="block text-[0.65rem] text-muted-foreground">{hint}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={cn("gap-0 py-0 space-y-2", locked && "pointer-events-none select-none")}>
        <label className="flex cursor-not-allowed items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" disabled checked className="rounded accent-emerald-600" />
          Solo leads con score ICP ≥ 6
        </label>
        <label className="flex cursor-not-allowed items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" disabled checked className="rounded accent-emerald-600" />
          Incluir resumen Tavily en notas del lead
        </label>

        <Button
          type="button"
          disabled
          className="mt-1 w-full gap-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-100 opacity-60"
        >
          <Lock className="h-4 w-4" aria-hidden />
          Clasificar y guardar leads
        </Button>
      </div>

      <p className="mt-3 text-[0.65rem] text-muted-foreground">
        Mock de UI — sin persistencia. Conectará score ICP, contactos y guardado en Leads.
      </p>
    </Card>
  );
}
