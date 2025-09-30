export interface LoginResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  mensaje: string;
  exitoso: boolean;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
