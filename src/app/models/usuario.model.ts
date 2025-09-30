export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  activo?: boolean;
  ultimo_login?: string;
  fecha_registro?: string;
  fecha_modificacion?: string;
}
