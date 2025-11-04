import { RolUsuario } from './enums';

export interface Usuario {
  id?: number;
  empresaId: number;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  rolUsuario: RolUsuario;
  activo?: boolean;
  ultimo_login?: string;
  fecha_registro?: string;
  fecha_modificacion?: string;
}
