import { TipoGateway } from './enums';

export interface GatewayDto {
  id?: number;
  procesoId: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoGateway;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
  cantidadArcosEntrantes?: number;
  cantidadArcosSalientes?: number;
}
