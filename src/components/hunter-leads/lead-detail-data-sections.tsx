"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { AiGradientChromeButton } from "@/components/ui/ai-gradient-chrome-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HunterLeadDetailInput } from "@/components/hunter-leads/hunter-lead-detail-types";
import { useMcpChatLoadingIndicator } from "@/hooks/useMcpChatLoadingIndicator";
import { buildHunterSavedLeadAiContextMarkdown } from "@/lib/lead-engine/build-hunter-lead-ai-context";
import type { HunterLeadAiContextInput } from "@/lib/lead-engine/build-hunter-lead-ai-context";
import { collectHunterLeadEmails, collectHunterLeadPhones } from "@/lib/lead-engine/hunter-lead-phones";
import { cn } from "@/lib/utils";

const URL_IN_SOURCE = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

function fmtScore(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number.isInteger(n) ? String(n) : String(n);
}

function renderPhoneSourceWithLinks(text: string): ReactNode {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(URL_IN_SOURCE);
  const linkClass =
    "text-primary underline-offset-2 hover:underline break-all font-normal";

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//i.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {part}
            </a>
          );
        }
        if (/^www\./i.test(part)) {
          const href = `https://${part}`;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function SectionHeader({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function DataSectionShell({
  title,
  hint,
  className,
  headerAction,
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 space-y-2 border-b border-border pb-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={title} hint={headerAction ? undefined : hint} className="min-w-0 flex-1" />
        {headerAction}
      </div>
      {headerAction && hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </section>
  );
}

type LeadDetailDataSectionsProps = {
  lead: HunterLeadDetailInput;
  agencyLabel: string;
  showLeadActions?: boolean;
  leadId?: string;
  notesSectionTitle?: string;
  notesSectionHint?: string;
};

export function LeadDetailDataSections({
  lead,
  agencyLabel,
  showLeadActions = false,
  leadId,
  notesSectionTitle = "Ideas y notas",
  notesSectionHint = "Texto libre del import (Markdown / MCP): hipótesis, próximos pasos, contexto comercial.",
}: LeadDetailDataSectionsProps) {
  const mcpAiBusy = useMcpChatLoadingIndicator();
  const p = lead.primaryEmail?.toLowerCase() ?? "";
  const s = lead.secondaryEmail?.toLowerCase() ?? "";
  const extraContacts = lead.contacts.filter((c) => {
    if (!c.email?.includes("@")) return true;
    const e = c.email.toLowerCase();
    return e !== p && e !== s;
  });
  const allPhones = collectHunterLeadPhones(lead);
  const allEmails = collectHunterLeadEmails(lead);

  const resumenContent = (
    <dl className="space-y-2 text-sm">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Prioridad</dt>
        <dd className="min-w-0 font-medium sm:text-right">{lead.priority ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Estado / región</dt>
        <dd className="min-w-0 break-words font-medium sm:text-right">{lead.estado ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Especialidad</dt>
        <dd className="min-w-0 break-words font-medium sm:text-right">{lead.especialidad ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">ICP</dt>
        <dd className="min-w-0 font-medium tabular-nums sm:text-right">{fmtScore(lead.icpScore)}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground"># fila import</dt>
        <dd className="min-w-0 font-medium tabular-nums sm:text-right">{lead.rowNumber ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">LinkedIn empresa</dt>
        <dd className="min-w-0 sm:text-right">
          {lead.companyLinkedinUrl?.trim() ? (
            <a
              href={lead.companyLinkedinUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-xs font-medium text-primary hover:underline"
            >
              Ver perfil
            </a>
          ) : (
            <span className="font-medium">—</span>
          )}
        </dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Actualizado</dt>
        <dd className="min-w-0 text-xs text-muted-foreground sm:text-right">
          {lead.updatedAt
            ? new Intl.DateTimeFormat("es", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(lead.updatedAt))
            : "—"}
        </dd>
      </div>
    </dl>
  );

  const origenContent = (
    <dl className="space-y-2 text-sm">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Query</dt>
        <dd className="min-w-0 break-words text-xs sm:text-right">{lead.sourceQuery ?? "—"}</dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">País / ciudad</dt>
        <dd className="min-w-0 break-words font-medium sm:text-right">
          {[lead.sourceCountry, lead.sourceCity].filter(Boolean).join(" · ") || "—"}
        </dd>
      </div>
      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
        <dt className="shrink-0 text-muted-foreground">Emails (personal / genérico / total)</dt>
        <dd className="min-w-0 font-medium tabular-nums sm:text-right">
          {[lead.emailsPersonal, lead.emailsGeneric, lead.emailsTotal].every((v) => v == null)
            ? "—"
            : `${lead.emailsPersonal ?? "—"} / ${lead.emailsGeneric ?? "—"} / ${lead.emailsTotal ?? "—"}`}
        </dd>
      </div>
    </dl>
  );

  const correosContent =
    allEmails.length > 0 ? (
      <ul className="space-y-1">
        {allEmails.map((em) => (
          <li key={em} className="text-sm">
            <a href={`mailto:${em}`} className="break-all font-mono text-xs text-primary hover:underline">
              {em}
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground">No hay correos guardados.</p>
    );

  const phoneAiButton =
    showLeadActions && leadId ? (
      <AiGradientChromeButton
        type="button"
        className="shrink-0"
        isProcessing={mcpAiBusy}
        onClick={() => {
          const contextLead: HunterLeadAiContextInput = { ...lead, id: leadId };
          const contextText = buildHunterSavedLeadAiContextMarkdown(contextLead);
          const draftMessage =
            `Buscar el número telefónico de ${agencyLabel} (${lead.domain}). ` +
            `La base ya tiene los campos phone y phoneSource en hunter_saved_leads (no digas que faltan): para persistir un número verificable usa la herramienta MCP updateHunterSavedLeadPhone ` +
            `con leadId="${leadId}", phone (incluye código de país si puedes) y phoneSource (URL exacta o referencia, p. ej. Crunchbase / ZoomInfo). ` +
            `Si no hay dato confiable, explica por qué.`;
          window.dispatchEvent(
            new CustomEvent("mcpChat:sendPhoneSearch", {
              detail: {
                contextText,
                displayName: agencyLabel,
                draftMessage,
                enableWebSearch: true,
              },
            })
          );
        }}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Buscar teléfono con IA
      </AiGradientChromeButton>
    ) : null;

  const phonesHint = showLeadActions
    ? "«Rebúsqueda» actualiza Hunter, el sitio web y la IA (contactos decisores, región, teléfono). Este botón abre el chat solo para buscar teléfono manualmente."
    : undefined;

  const telefonosBody = (
    <>
      {allPhones.length > 0 ? (
        <ul className="space-y-1">
          {allPhones.map((phone) => (
            <li key={phone} className="phone-number-reveal text-sm font-medium text-foreground">
              {phone}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-foreground">No disponible</p>
      )}
      {allPhones.length > 0 && lead.phoneSource?.trim() ? (
        <p className="break-words text-xs text-muted-foreground">
          <span className="text-muted-foreground">Referencia: </span>
          {renderPhoneSourceWithLinks(lead.phoneSource)}
        </p>
      ) : null}
    </>
  );

  const notasContent = lead.description?.trim() ? (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
      {lead.description}
    </p>
  ) : (
    <p className="text-sm text-muted-foreground">
      Todavía no hay notas para este lead. Puedes enriquecerlas desde el import de pipeline o desde el chat
      con <span className="font-medium text-foreground">savePipelineLeadsMarkdown</span>.
    </p>
  );

  const contactosPrincipalesContent = (
    <div className="grid gap-6 text-sm sm:grid-cols-2">
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Principal</p>
        <p className="font-medium">{lead.primaryContactName ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{lead.primaryContactTitle ?? "—"}</p>
        {lead.primaryEmail ? (
          <a href={`mailto:${lead.primaryEmail}`} className="break-all text-primary hover:underline">
            {lead.primaryEmail}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secundario</p>
        <p className="font-medium">{lead.secondaryContactName ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{lead.secondaryContactTitle ?? "—"}</p>
        {lead.secondaryEmail ? (
          <a href={`mailto:${lead.secondaryEmail}`} className="break-all text-primary hover:underline">
            {lead.secondaryEmail}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );

  const hunterContactsContent =
    lead.contacts.length > 0 ? (
      <div className="-mx-1 overflow-x-auto px-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Senioridad</TableHead>
              <TableHead>Área</TableHead>
              <TableHead className="text-right">Confianza</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(extraContacts.length > 0 ? extraContacts : lead.contacts).map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">
                  {c.email?.includes("@") ? (
                    <a href={`mailto:${c.email}`} className="break-all text-primary hover:underline">
                      {c.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.position ?? "—"}</TableCell>
                <TableCell className="text-xs">
                  {c.linkedinUrl?.trim() ? (
                    <a
                      href={c.linkedinUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Perfil
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.phone ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.seniority ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.department ?? "—"}</TableCell>
                <TableCell className="text-right text-xs tabular-nums">
                  {c.confidence != null ? String(c.confidence) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ) : null;

  return (
    <>
      <div className="grid min-w-0 gap-8 border-b border-border pb-6 md:grid-cols-2 md:gap-10">
        <section className="min-w-0 space-y-2">
          <SectionHeader title="Resumen" hint="Datos principales del pipeline / Hunter." />
          {resumenContent}
        </section>
        <section className="min-w-0 space-y-2">
          <SectionHeader title="Origen Hunter" hint="Búsqueda y métricas de correos (si aplica)." />
          {origenContent}
        </section>
      </div>

      <DataSectionShell
        title="Correos"
        hint="Todos los correos guardados (Hunter, sitio, import); las filas solo-teléfono no aparecen aquí."
      >
        {correosContent}
      </DataSectionShell>

      <DataSectionShell title="Teléfonos" hint={phonesHint} headerAction={phoneAiButton}>
        {telefonosBody}
      </DataSectionShell>

      <DataSectionShell title={notesSectionTitle} hint={notesSectionHint}>
        {notasContent}
      </DataSectionShell>

      <DataSectionShell title="Contactos principales" hint="Datos de la tabla pipeline.">
        {contactosPrincipalesContent}
      </DataSectionShell>

      {hunterContactsContent ? (
        <DataSectionShell
          title="Contactos Hunter / enriquecimiento"
          hint={
            extraContacts.length > 0
              ? "Incluye filas extra respecto al principal y secundario (Hunter, crawl del sitio, teléfonos detectados)."
              : "Todas las filas guardadas: Hunter, correos/teléfonos del sitio y enriquecimiento."
          }
          className="border-b-0 pb-2"
        >
          {hunterContactsContent}
        </DataSectionShell>
      ) : null}
    </>
  );
}
