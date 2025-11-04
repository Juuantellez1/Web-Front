import { TipoNodo } from './enums';

export interface ArcoDto {
  id?: number;
  procesoId: number;
  tipoOrigen: TipoNodo;
  origenId: number;
  tipoDestino: TipoNodo;
  destinoId: number;
  condicion?: string;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
  origenNombre?: string;
  destinoNombre?: string;
}
