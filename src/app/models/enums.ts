
export enum RolUsuario {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  LECTOR = 'LECTOR'
}

export enum EstadoProceso {
  BORRADOR = 'BORRADOR',
  PUBLICADO = 'PUBLICADO'
}

export enum TipoActividad {
  USUARIO = 'USUARIO',
  AUTOMATICA = 'AUTOMATICA',
  MANUAL = 'MANUAL'
}

export enum TipoGateway {
  EXCLUSIVO = 'EXCLUSIVO',
  INCLUSIVO = 'INCLUSIVO',
  PARALELO = 'PARALELO'
}

export enum TipoNodo {
  ACTIVIDAD = 'ACTIVIDAD',
  GATEWAY = 'GATEWAY',
  EVENTO_INICIO = 'EVENTO_INICIO',
  EVENTO_FIN = 'EVENTO_FIN'
}
