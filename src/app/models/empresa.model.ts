export interface Empresa {
  id?: number;
  nombre: string;
  nit: string;
  correo: string;
  activo?: boolean;
  fecha_registro?: string;
  fecha_modificacion?: string;
}
