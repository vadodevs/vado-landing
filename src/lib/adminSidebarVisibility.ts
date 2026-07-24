/** Visibilidad de secciones del sidebar admin (UI only; rutas siguen existiendo). */

export type AdminSidebarSectionId =
  | 'general'
  | 'talent'
  | 'sales'
  | 'channels'
  | 'utilities'

export type AdminSidebarVisibility = Record<AdminSidebarSectionId, boolean>

export const ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS: AdminSidebarSectionId[] = [
  'general',
  'talent',
  'sales',
  'channels',
  'utilities',
]

export const DEFAULT_ADMIN_SIDEBAR_VISIBILITY: AdminSidebarVisibility = {
  general: true,
  talent: true,
  sales: true,
  channels: true,
  utilities: true,
}

const STORAGE_KEY = 'vado.admin.sidebar.sectionVisibility.v1'
export const ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT = 'vado-admin-sidebar-visibility-change'

export function normalizeAdminSidebarVisibility(
  raw: Partial<AdminSidebarVisibility> | null | undefined,
): AdminSidebarVisibility {
  const next = { ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY }
  if (!raw || typeof raw !== 'object') return next
  for (const id of ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS) {
    if (typeof raw[id] === 'boolean') next[id] = raw[id]
  }
  return next
}

export function adminSidebarVisibilityHasExplicitKeys(
  raw: Partial<AdminSidebarVisibility> | null | undefined,
): boolean {
  if (!raw || typeof raw !== 'object') return false
  return ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS.some((id) => typeof raw[id] === 'boolean')
}

export function readAdminSidebarVisibility(): AdminSidebarVisibility {
  if (typeof window === 'undefined') return { ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY }
    return normalizeAdminSidebarVisibility(JSON.parse(raw) as Partial<AdminSidebarVisibility>)
  } catch {
    return { ...DEFAULT_ADMIN_SIDEBAR_VISIBILITY }
  }
}

export function writeAdminSidebarVisibility(next: AdminSidebarVisibility): void {
  if (typeof window === 'undefined') return
  const normalized = normalizeAdminSidebarVisibility(next)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(
    new CustomEvent(ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT, { detail: normalized }),
  )
}

export function hydrateAdminSidebarVisibilityFromServer(
  raw: Partial<AdminSidebarVisibility> | null | undefined,
): AdminSidebarVisibility {
  const normalized = normalizeAdminSidebarVisibility(raw)
  writeAdminSidebarVisibility(normalized)
  return normalized
}

export function setAdminSidebarSectionVisible(
  id: AdminSidebarSectionId,
  visible: boolean,
): AdminSidebarVisibility {
  const next = { ...readAdminSidebarVisibility(), [id]: visible }
  writeAdminSidebarVisibility(next)
  return next
}

export function isAdminSidebarSectionVisible(
  visibility: AdminSidebarVisibility,
  id: AdminSidebarSectionId,
): boolean {
  return visibility[id] !== false
}

export function isAdminSidebarVisibilityEqual(
  a: AdminSidebarVisibility,
  b: AdminSidebarVisibility,
): boolean {
  return ADMIN_SIDEBAR_TOGGLEABLE_SECTIONS.every((id) => a[id] === b[id])
}
