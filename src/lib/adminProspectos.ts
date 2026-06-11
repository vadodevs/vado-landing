/** Desarrollador asignado a un lead (snapshot; la lista viva sale de GET /users/developers). */
export type AdminProspecto = {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
  /** Solo UI al elegir; no es obligatorio en datos guardados. */
  expertis?: string;
};
