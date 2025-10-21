export interface CrearEmpresaRequest {
  nombreEmpresa: string;
  nit: string;
  correoEmpresa: string;
  nombreAdmin: string;
  apellidoAdmin: string;
  correoAdmin: string;
  passwordAdmin: string;
}

export interface CrearEmpresaResponse {
  empresa: {
    id: number;
    nombre: string;
    nit: string;
    correo: string;
    fecha_registro?: string;
  };
  usuarioAdmin: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    empresa_id: number;
    rol_usuario?: string;
  };
  mensaje: string;
}
