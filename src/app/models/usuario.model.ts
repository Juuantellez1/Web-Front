export interface Usuario {
  id?: number;
  empresaId: number;
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  rolUsuario: 'ADMIN' | 'EDITOR' | 'LECTOR';
  activo?: boolean;
  ultimo_login?: string;
  fecha_registro?: string;
  fecha_modificacion?: string;
}

export type RolUsuario = 'ADMIN' | 'EDITOR' | 'LECTOR';
