import type { AdminProspecto } from '@/lib/adminProspectos';

/** Proyecto creado al asignar desarrolladores a un lead de compañías. */
export type AssignedProjectRecord = {
  id: string;
  contactId: string;
  titulo: string;
  empresa: string;
  contactoNombre: string;
  servicio: string;
  descripcion: string;
  prospectos: Pick<AdminProspecto, 'id' | 'nombre' | 'rol' | 'correo'>[];
  createdAt: string;
};
