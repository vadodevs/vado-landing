import type { CompanyContact } from '@/lib/companyAdminContact'
import {
  getUpcomingReminder,
  type CompanyLeadUpdate,
} from '@/lib/companyLeadUpdates'

/** Entidades del wizard de importación de Pipedrive. */
export type PipedriveExportEntity =
  | 'persons'
  | 'organizations'
  | 'leads'
  | 'deals'
  | 'activities'
  | 'products'
  | 'projects'
  | 'notes'

export type PipedriveExportOptions = {
  entities: PipedriveExportEntity[]
  /** updates por contactId (para actividades / recordatorios). */
  updatesByContactId?: Record<string, CompanyLeadUpdate[]>
}

/**
 * Cabeceras oficiales Pipedrive (ES).
 * Pipedrive genera plantillas distintas según entidades del wizard:
 * - completa (17 cols): Prospectos…Projects
 * - otra (12 cols): Org…Persona…Trato…Actividad + `Nota - Contenido *`
 */
export const PIPEDRIVE_COLUMNS = {
  leadTitle: 'Prospecto - Título *',
  orgName: 'Organización - Nombre *',
  orgAddress: 'Organización - Dirección (sugeridos)',
  dealTitle: 'Trato - Título',
  dealValue: 'Trato - Valor',
  personName: 'Persona - Nombre *',
  personFirst: 'Persona - Nombre',
  personLast: 'Persona - Apellidos',
  personPhone: 'Persona - Teléfono (sugeridos)',
  personEmail: 'Persona - Correo electrónico (sugeridos)',
  activitySubject: 'Actividad - Asunto',
  activityDue: 'Actividad - Fecha de vencimiento',
  productName: 'Producto - Nombre *',
  productPrice: 'Producto - Precio unitario',
  projectTitle: 'Projecto - Título *',
  projectStart: 'Projecto - Fecha de inicio',
  projectEnd: 'Projecto - Fecha de finalización',
  noteContent: 'Nota - Contenido *',
} as const

type ColumnKey = keyof typeof PIPEDRIVE_COLUMNS

/** Orden canónico al combinar entidades (headers exactos; Pipedrive mapea por nombre). */
const TEMPLATE_COLUMN_ORDER: { key: ColumnKey; entity: PipedriveExportEntity }[] = [
  { key: 'leadTitle', entity: 'leads' },
  { key: 'orgName', entity: 'organizations' },
  { key: 'orgAddress', entity: 'organizations' },
  { key: 'personName', entity: 'persons' },
  { key: 'personFirst', entity: 'persons' },
  { key: 'personLast', entity: 'persons' },
  { key: 'personPhone', entity: 'persons' },
  { key: 'personEmail', entity: 'persons' },
  { key: 'dealTitle', entity: 'deals' },
  { key: 'dealValue', entity: 'deals' },
  { key: 'activitySubject', entity: 'activities' },
  { key: 'activityDue', entity: 'activities' },
  { key: 'noteContent', entity: 'notes' },
  { key: 'productName', entity: 'products' },
  { key: 'productPrice', entity: 'products' },
  { key: 'projectTitle', entity: 'projects' },
  { key: 'projectStart', entity: 'projects' },
  { key: 'projectEnd', entity: 'projects' },
]

/** Placeholder para no dejar celdas vacías (la plantilla no tiene ninguna). */
const BLANK = '-'

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { first: '', last: '' }
  if (parts.length === 1) return { first: parts[0], last: '' }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

/**
 * Acorta el nombre de empresa como en la plantilla:
 * "Moveer Limited" → "Moveer", "ABC Inc" → "ABC", "Blue Marble LLP" → "Blue Marble".
 */
function orgShortName(empresa: string): string {
  const cleaned = empresa
    .replace(
      /\b(limited|ltd\.?|inc\.?|corp\.?|corporation|llp|llc|s\.?a\.?|s\.?\s*de\s*r\.?\s*l\.?)\b\.?/gi,
      '',
    )
    .replace(/[,\s]+$/g, '')
    .trim()
  return cleaned || empresa
}

/** Fechas estilo plantilla de proyectos: MM/DD/YYYY */
function formatTemplateDate(ms: number): string {
  const d = new Date(ms)
  if (!Number.isFinite(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

function addDays(ms: number, days: number): number {
  return ms + days * 24 * 60 * 60 * 1000
}

/** Teléfono estilo plantilla: 570-809-7197 */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function nonEmpty(value: string, fallback = BLANK): string {
  const v = value.trim()
  return v !== '' ? v : fallback
}

export function buildPipedriveHeaders(entities: PipedriveExportEntity[]): string[] {
  const set = new Set(entities)
  return TEMPLATE_COLUMN_ORDER.filter((c) => set.has(c.entity)).map(
    (c) => PIPEDRIVE_COLUMNS[c.key],
  )
}

export function mapContactToPipedriveRow(
  contact: CompanyContact,
  entities: PipedriveExportEntity[],
  updates: CompanyLeadUpdate[] = [],
): Record<string, string> {
  const set = new Set(entities)
  const { first, last } = splitName(contact.nombre === '—' ? '' : contact.nombre)
  const fullName = [first, last].filter(Boolean).join(' ') || contact.nombre
  const empresaRaw = contact.empresa === '—' ? '' : contact.empresa.trim()
  const empresa = empresaRaw || fullName || contact.correo.trim() || 'Organización'
  const short = orgShortName(empresa)
  const email = nonEmpty(contact.correo)
  const phoneRaw = contact.telefono === '—' ? '' : contact.telefono.trim()
  const phone = phoneRaw ? formatPhone(phoneRaw) : BLANK
  const servicio =
    contact.servicio && contact.servicio !== 'Selecciona uno...'
      ? contact.servicio.trim()
      : ''
  const now = Date.now()
  const created =
    contact.createdAtMs && Number.isFinite(contact.createdAtMs)
      ? contact.createdAtMs
      : now

  const row: Record<string, string> = {}

  if (set.has('leads')) {
    // Plantilla: "Moveer Lead", "ABC Lead"
    row[PIPEDRIVE_COLUMNS.leadTitle] = `${short} Lead`
  }
  if (set.has('organizations')) {
    row[PIPEDRIVE_COLUMNS.orgName] = empresa
    row[PIPEDRIVE_COLUMNS.orgAddress] = nonEmpty(contact.ciudad ?? '')
  }
  if (set.has('deals')) {
    // Plantilla: "Moveer Deal" + valor numérico
    row[PIPEDRIVE_COLUMNS.dealTitle] = servicio
      ? `${short} Deal — ${servicio}`
      : `${short} Deal`
    row[PIPEDRIVE_COLUMNS.dealValue] = '0'
  }
  if (set.has('persons')) {
    row[PIPEDRIVE_COLUMNS.personName] = nonEmpty(fullName, 'Contacto')
    row[PIPEDRIVE_COLUMNS.personFirst] = nonEmpty(first || fullName, 'Contacto')
    row[PIPEDRIVE_COLUMNS.personLast] = nonEmpty(last)
    row[PIPEDRIVE_COLUMNS.personPhone] = phone
    row[PIPEDRIVE_COLUMNS.personEmail] = email
  }
  if (set.has('activities')) {
    // Plantilla usa asuntos cortos: Call, Meeting, Email, Task…
    const upcoming = getUpcomingReminder(updates)
    if (upcoming) {
      const body = upcoming.body?.trim() ?? ''
      row[PIPEDRIVE_COLUMNS.activitySubject] = body
        ? body.slice(0, 80)
        : 'Seguimiento'
      row[PIPEDRIVE_COLUMNS.activityDue] = upcoming.scheduledAtMs
        ? formatTemplateDate(upcoming.scheduledAtMs)
        : formatTemplateDate(addDays(now, 7))
    } else {
      row[PIPEDRIVE_COLUMNS.activitySubject] = 'Seguimiento'
      row[PIPEDRIVE_COLUMNS.activityDue] = formatTemplateDate(addDays(created, 7))
    }
  }
  if (set.has('products')) {
    // Plantilla: nombre + "5 USD" / "5 EUR, 5 USD"
    row[PIPEDRIVE_COLUMNS.productName] = servicio || 'Servicio'
    row[PIPEDRIVE_COLUMNS.productPrice] = '0 USD'
  }
  if (set.has('projects')) {
    // Plantilla: "Moveer Project" + inicio/fin (~2 semanas)
    row[PIPEDRIVE_COLUMNS.projectTitle] = `${short} Project`
    row[PIPEDRIVE_COLUMNS.projectStart] = formatTemplateDate(now)
    row[PIPEDRIVE_COLUMNS.projectEnd] = formatTemplateDate(addDays(now, 14))
  }
  if (set.has('notes')) {
    // Plantilla `Nota - Contenido *` — mensaje del lead (puede ir vacío)
    row[PIPEDRIVE_COLUMNS.noteContent] = contact.mensaje?.trim() ?? ''
  }

  return row
}

export function buildPipedriveCsv(
  contacts: CompanyContact[],
  options: PipedriveExportOptions,
): string {
  const entities = options.entities
  if (entities.length === 0 || contacts.length === 0) return ''

  const headers = buildPipedriveHeaders(entities)
  const lines = [headers.map(csvEscape).join(',')]

  for (const contact of contacts) {
    const updates = options.updatesByContactId?.[contact.id] ?? []
    const row = mapContactToPipedriveRow(contact, entities, updates)
    lines.push(
      headers
        .map((h) => {
          const raw = row[h]
          // Notas pueden ir vacías (como en la plantilla de 12 cols)
          if (h === PIPEDRIVE_COLUMNS.noteContent) {
            return csvEscape(raw ?? '')
          }
          return csvEscape(raw ?? BLANK)
        })
        .join(','),
    )
  }

  // BOM para que Excel / Pipedrive lean UTF-8 correctamente
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

export function downloadPipedriveCsv(csv: string, filename?: string): void {
  const name =
    filename ??
    `pipedrive-import-${new Date().toISOString().slice(0, 10)}.csv`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const DEFAULT_PIPEDRIVE_EXPORT_ENTITIES: PipedriveExportEntity[] = [
  'persons',
  'organizations',
  'leads',
  'notes',
]

/** Todas las entidades soportadas (plantillas 12 y 17 cols). */
export const ALL_PIPEDRIVE_EXPORT_ENTITIES: PipedriveExportEntity[] = [
  'leads',
  'organizations',
  'persons',
  'deals',
  'activities',
  'notes',
  'products',
  'projects',
]
