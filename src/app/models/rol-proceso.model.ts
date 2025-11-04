export interface RolProcesoDto {
  id?: number;
  empresaId: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
  cantidadActividadesAsignadas?: number;
  procesosUtilizados?: string[];
}
