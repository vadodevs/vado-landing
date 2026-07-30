/** Campos mínimos para armar el bloque Markdown de contexto (MCP / tabla). */
export type HunterLeadAiContextInput = {
  id: string;
  domain: string;
  agencyName?: string | null;
  organization?: string | null;
  rowNumber?: number | null;
  priority?: string | null;
  estado?: string | null;
  especialidad?: string | null;
  icpScore?: number | null;
  primaryContactName?: string | null;
  primaryContactTitle?: string | null;
  primaryEmail?: string | null;
  secondaryContactName?: string | null;
  secondaryContactTitle?: string | null;
  secondaryEmail?: string | null;
  description?: string | null;
  phone?: string | null;
  phoneSource?: string | null;
  companyLinkedinUrl?: string | null;
  contacts: Array<{
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    position?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    seniority?: string | null;
    department?: string | null;
  }>;
};

export function buildHunterSavedLeadAiContextMarkdown(lead: HunterLeadAiContextInput): string {
  const agency = lead.agencyName || lead.organization || "—";
  const blocks: string[] = [
    "### Lead (pipeline / Hunter)",
    "",
    `- **ID del lead (leadId):** \`${lead.id}\``,
    `- **Agencia / organización:** ${agency}`,
    `- **Dominio / sitio:** ${lead.domain}`,
    `- **Prioridad:** ${lead.priority ?? "—"}`,
    `- **Estado / región:** ${lead.estado ?? "—"}`,
    `- **Especialidad:** ${lead.especialidad ?? "—"}`,
    `- **# fila import:** ${lead.rowNumber ?? "—"}`,
    `- **ICP score:** ${lead.icpScore != null && !Number.isNaN(lead.icpScore) ? String(lead.icpScore) : "—"}`,
    `- **Teléfono guardado:** ${lead.phone?.trim() ? lead.phone.trim() : "—"}`,
    lead.phoneSource?.trim()
      ? `- **Fuente teléfono guardada:** ${lead.phoneSource.trim()}`
      : null,
    lead.companyLinkedinUrl?.trim()
      ? `- **LinkedIn empresa:** ${lead.companyLinkedinUrl.trim()}`
      : null,
    "",
    "#### Contacto principal",
    `- Nombre: ${lead.primaryContactName ?? "—"}`,
    `- Cargo: ${lead.primaryContactTitle ?? "—"}`,
    `- Email: ${lead.primaryEmail ?? "—"}`,
    "",
    "#### Contacto secundario",
    `- Nombre: ${lead.secondaryContactName ?? "—"}`,
    `- Cargo: ${lead.secondaryContactTitle ?? "—"}`,
    `- Email: ${lead.secondaryEmail ?? "—"}`,
  ].filter((line): line is string => line != null);

  if (lead.description?.trim()) {
    blocks.push("", "#### Notas / descripción", lead.description.trim());
  }
  if (lead.contacts.length > 0) {
    blocks.push(
      "",
      "---",
      "#### Otros emails (Hunter / enriquecimiento)",
      ...lead.contacts.map((c) => {
        const bits = [
          c.position ? ` — ${c.position}` : "",
          c.linkedinUrl ? ` — LinkedIn: ${c.linkedinUrl}` : "",
          c.phone ? ` — tel: ${c.phone}` : "",
          c.seniority ? ` — seniority: ${c.seniority}` : "",
          c.department ? ` — área: ${c.department}` : "",
        ].join("");
        return `- ${c.email}${c.firstName || c.lastName ? ` (${[c.firstName, c.lastName].filter(Boolean).join(" ")})` : ""}${bits}`;
      }),
    );
  }
  return blocks.join("\n");
}
