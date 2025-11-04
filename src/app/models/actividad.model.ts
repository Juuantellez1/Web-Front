import { TipoActividad } from './enums';

export interface ActividadDto {
  id?: number;
  procesoId: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoActividad;
  rolResponsableId?: number;
  rolResponsableNombre?: string;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
}
