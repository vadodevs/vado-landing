import type { CompanyContact } from '@/lib/companyAdminContact';

/** Columnas de la plantilla / import (Excel abre este CSV con BOM UTF-8). */
export const COMPANY_LEADS_EXCEL_HEADERS = [
  'nombre',
  'correo',
  'empresa',
  'telefono',
  'servicio',
  'mensaje',
  'sector',
  'ciudad',
] as const;

export type CompanyLeadExcelHeader = (typeof COMPANY_LEADS_EXCEL_HEADERS)[number];

export type CompanyLeadExcelRow = Record<CompanyLeadExcelHeader, string>;

const HEADER_ALIASES: Record<string, CompanyLeadExcelHeader> = {
  nombre: 'nombre',
  name: 'nombre',
  firstname: 'nombre',
  'first name': 'nombre',
  correo: 'correo',
  email: 'correo',
  'e-mail': 'correo',
  mail: 'correo',
  empresa: 'empresa',
  company: 'empresa',
  organization: 'empresa',
  telefono: 'telefono',
  teléfono: 'telefono',
  phone: 'telefono',
  tel: 'telefono',
  servicio: 'servicio',
  subject: 'servicio',
  asunto: 'servicio',
  mensaje: 'mensaje',
  message: 'mensaje',
  notes: 'mensaje',
  nota: 'mensaje',
  sector: 'sector',
  industry: 'sector',
  ciudad: 'ciudad',
  city: 'ciudad',
};

function escapeCsvCell(value: string): string {
  const v = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** CSV con BOM para que Excel respete acentos. */
export function buildCompanyLeadsCsv(rows: CompanyLeadExcelRow[]): string {
  const lines = [
    COMPANY_LEADS_EXCEL_HEADERS.join(','),
    ...rows.map((row) =>
      COMPANY_LEADS_EXCEL_HEADERS.map((h) => escapeCsvCell(row[h] ?? '')).join(','),
    ),
  ];
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function companyContactToExcelRow(contact: CompanyContact): CompanyLeadExcelRow {
  return {
    nombre: contact.nombre === '—' ? '' : contact.nombre,
    correo: contact.correo,
    empresa: contact.empresa === '—' ? '' : contact.empresa,
    telefono: contact.telefono === '—' ? '' : contact.telefono,
    servicio: contact.servicio === 'Selecciona uno...' ? '' : contact.servicio,
    mensaje: contact.mensaje,
    sector: contact.sector,
    ciudad: contact.ciudad,
  };
}

export function downloadCompanyLeadsExcel(contacts: CompanyContact[], filename?: string) {
  const rows = contacts.map(companyContactToExcelRow);
  const csv = buildCompanyLeadsCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(
    filename ?? `leads-company-${stamp}.csv`,
    csv,
    'text/csv;charset=utf-8',
  );
}

export function downloadCompanyLeadsExcelTemplate() {
  const example: CompanyLeadExcelRow = {
    nombre: 'Ana Pérez',
    correo: 'ana@empresa.com',
    empresa: 'Empresa Ejemplo SA',
    telefono: '+52 55 1234 5678',
    servicio: 'Staff Augmentation',
    mensaje: 'Interesados en ampliar el equipo de desarrollo.',
    sector: 'Tecnología',
    ciudad: 'Ciudad de México',
  };
  const empty: CompanyLeadExcelRow = {
    nombre: '',
    correo: '',
    empresa: '',
    telefono: '',
    servicio: '',
    mensaje: '',
    sector: '',
    ciudad: '',
  };
  downloadBlob(
    'plantilla-leads-company.csv',
    buildCompanyLeadsCsv([example, empty]),
    'text/csv;charset=utf-8',
  );
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',' || ch === ';') {
      cells.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

function normalizeHeader(raw: string): CompanyLeadExcelHeader | null {
  const key = raw
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');
  return HEADER_ALIASES[key] ?? null;
}

export type ParseCompanyLeadsExcelResult =
  | { ok: true; rows: CompanyLeadExcelRow[] }
  | { ok: false; error: string };

export function parseCompanyLeadsExcelText(text: string): ParseCompanyLeadsExcelResult {
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleaned.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { ok: false, error: 'El archivo está vacío.' };

  const headerCells = parseCsvLine(lines[0]!);
  const indexByHeader = new Map<CompanyLeadExcelHeader, number>();
  headerCells.forEach((cell, idx) => {
    const mapped = normalizeHeader(cell);
    if (mapped && !indexByHeader.has(mapped)) indexByHeader.set(mapped, idx);
  });

  if (!indexByHeader.has('nombre') || !indexByHeader.has('correo')) {
    return {
      ok: false,
      error: 'La plantilla debe incluir las columnas «nombre» y «correo».',
    };
  }

  const rows: CompanyLeadExcelRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!);
    const get = (h: CompanyLeadExcelHeader) => {
      const idx = indexByHeader.get(h);
      return idx == null ? '' : (cells[idx] ?? '').trim();
    };
    const row: CompanyLeadExcelRow = {
      nombre: get('nombre'),
      correo: get('correo'),
      empresa: get('empresa'),
      telefono: get('telefono'),
      servicio: get('servicio'),
      mensaje: get('mensaje'),
      sector: get('sector'),
      ciudad: get('ciudad'),
    };
    if (!row.nombre && !row.correo && !row.empresa) continue;
    rows.push(row);
  }

  return { ok: true, rows };
}

export async function readCompanyLeadsExcelFile(
  file: File,
): Promise<ParseCompanyLeadsExcelResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return {
      ok: false,
      error:
        'Por ahora usa la plantilla CSV (ábrela o guárdala desde Excel como CSV UTF-8).',
    };
  }
  const text = await file.text();
  return parseCompanyLeadsExcelText(text);
}

export function isValidImportEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
