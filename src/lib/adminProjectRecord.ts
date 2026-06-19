import type { AdminProspecto } from '@/lib/adminProspectos';


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
