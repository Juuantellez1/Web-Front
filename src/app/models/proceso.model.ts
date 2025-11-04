import { EstadoProceso } from './enums';
import { ActividadDto } from './actividad.model';
import { ArcoDto } from './arco.model';
import { GatewayDto } from './gateway.model';

export interface ProcesoDto {
  id?: number;
  empresaId: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  estado: EstadoProceso;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
  cantidadActividades?: number;
  cantidadArcos?: number;
  cantidadGateways?: number;
}

export interface ProcesoDetalleDto {
  id?: number;
  empresaId: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  estado: EstadoProceso;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
  actividades: ActividadDto[];
  arcos: ArcoDto[];
  gateways: GatewayDto[];
}
