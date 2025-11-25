import { RolUsuario } from './enums';

export interface LoginResponse {
  id: number;
  empresaId: number;
  nombreEmpresa: string;
  nombre: string;
  apellido: string;
  correo: string;
  rolUsuario: RolUsuario;
  mensaje: string;
  exitoso: boolean;
  token: string;
}
