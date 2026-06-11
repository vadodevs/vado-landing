import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';

const PROJECTS_PATH = '/projects';

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v != null ? String(v).trim() : '';
}

function parseProspectos(raw: unknown): AssignedProjectRecord['prospectos'] {
  if (!Array.isArray(raw)) return [];
  const out: AssignedProjectRecord['prospectos'] = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') continue;
    const p = x as Record<string, unknown>;
    const id = str(p.id);
    const nombre = str(p.nombre ?? p.fullName ?? p.name);
    const rol = str(p.rol ?? p.role);
    const correo = str(p.correo ?? p.email);
    if (!id || !nombre) continue;
    out.push({ id, nombre, rol: rol || '—', correo: correo || '—' });
  }
  return out;
}

/** Convierte una fila JSON del backend a nuestro modelo (acepta camelCase o snake_case). */
export function mapApiProjectRow(row: unknown): AssignedProjectRecord | null {
  if (!row || typeof row !== 'object') return null;
  const o = row as Record<string, unknown>;
  const id = str(o.id);
  const titulo = str(o.titulo ?? o.title);
  const empresa = str(o.empresa ?? o.company);
  if (!id || !titulo || !empresa) return null;

  const contactId = str(o.contactId ?? o.contact_id);
  const contactoNombre = str(o.contactoNombre ?? o.contact_name ?? o.contactName);
  const servicio = str(o.servicio ?? o.service ?? o.subject);
  const descripcion = str(o.descripcion ?? o.description ?? o.message);
  const createdRaw = str(o.createdAt ?? o.created_at);
  const createdAt =
    createdRaw !== '' && Number.isFinite(Date.parse(createdRaw))
      ? new Date(createdRaw).toISOString()
      : new Date().toISOString();

  const prospectos = parseProspectos(o.prospectos ?? o.developers ?? o.team);

  return {
    id,
    contactId,
    titulo,
    empresa,
    contactoNombre: contactoNombre || '—',
    servicio: servicio || '—',
    descripcion: descripcion || '—',
    prospectos,
    createdAt,
  };
}

/**
 * Un lead (contactId) → un solo proyecto en UI.
 * Si hay varias filas (datos viejos o API duplicada), se usa solo la más reciente
 * por `createdAt` — sin unir equipos: lo que importa es la última asignación guardada.
 */
export function dedupeAssignedProjectsByContactId(
  projects: AssignedProjectRecord[],
): AssignedProjectRecord[] {
  const byContact = new Map<string, AssignedProjectRecord[]>();
  for (const p of projects) {
    const cid = p.contactId.trim();
    if (!cid) continue;
    const g = byContact.get(cid) ?? [];
    g.push(p);
    byContact.set(cid, g);
  }
  const byRecency = (a: AssignedProjectRecord, b: AssignedProjectRecord) => {
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    if (tb !== ta) return tb - ta;
    return b.id.localeCompare(a.id);
  };
  const out: AssignedProjectRecord[] = [];
  for (const [, group] of byContact) {
    group.sort(byRecency);
    out.push(group[0]!);
  }
  out.sort(byRecency);
  return out;
}

export type FetchProjectsResult = {
  /** HTTP 200 y cuerpo JSON array (puede estar vacío). */
  ok: boolean;
  projects: AssignedProjectRecord[];
};

/** GET /projects — lista desde la base de datos. */
export async function fetchRemoteProjects(apiBase: string): Promise<FetchProjectsResult> {
  const base = apiBase.replace(/\/$/, '');
  let res: Response;
  try {
    res = await fetch(`${base}${PROJECTS_PATH}`);
  } catch {
    return { ok: false, projects: [] };
  }
  if (!res.ok) return { ok: false, projects: [] };
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, projects: [] };
  }
  if (!Array.isArray(data)) return { ok: false, projects: [] };
  const projects: AssignedProjectRecord[] = [];
  for (const row of data) {
    const p = mapApiProjectRow(row);
    if (p) projects.push(p);
  }
  return { ok: true, projects: dedupeAssignedProjectsByContactId(projects) };
}

function projectPayload(record: AssignedProjectRecord) {
  return {
    id: record.id,
    contactId: record.contactId,
    titulo: record.titulo,
    empresa: record.empresa,
    contactoNombre: record.contactoNombre,
    servicio: record.servicio,
    descripcion: record.descripcion,
    prospectos: record.prospectos,
    createdAt: record.createdAt,
  };
}

/** POST /projects — persiste en la base de datos. */
export async function postRemoteProject(
  apiBase: string,
  record: AssignedProjectRecord,
): Promise<boolean> {
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${PROJECTS_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload(record)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * PUT /projects/:id — actualiza un proyecto existente (si el backend lo expone).
 * Si no existe la ruta, devuelve false y se puede usar POST con el mismo id.
 */
export async function putRemoteProject(
  apiBase: string,
  record: AssignedProjectRecord,
): Promise<boolean> {
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}${PROJECTS_PATH}/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload(record)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** POST o PUT según convenga: actualización por id existente vs alta nueva. */
export async function upsertRemoteProject(
  apiBase: string,
  record: AssignedProjectRecord,
  isUpdate: boolean,
): Promise<boolean> {
  if (isUpdate) {
    const okPut = await putRemoteProject(apiBase, record);
    if (okPut) return true;
  }
  return postRemoteProject(apiBase, record);
}

/** DELETE /projects/by-contact/:contactId — elimina asignación vigente del lead. */
export async function deleteRemoteProjectsByContactId(
  apiBase: string,
  contactId: string,
): Promise<boolean> {
  const base = apiBase.replace(/\/$/, '');
  try {
    const res = await fetch(
      `${base}${PROJECTS_PATH}/by-contact/${encodeURIComponent(contactId.trim())}`,
      { method: 'DELETE' },
    );
    return res.ok;
  } catch {
    return false;
  }
}
