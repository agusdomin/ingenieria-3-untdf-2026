export type OutingStatus =
  | 'pendiente'
  | 'en_curso'
  | 'finalizado'
  | 'cancelado';

export interface OutingCoordinates {
  latitude: number;
  longitude: number;
}

export interface Outing {
  id: number;

  usuario: number;
  usuario_nombre: string;

  coordenadas: OutingCoordinates | null;

  fecha_hora_inicio: string;
  fecha_hora_retorno: string;

  cantidad_acompanantes: number;

  itinerario_descripcion: string;

  estado: OutingStatus;
  estado_display: string;
}

export interface CreateOutingDTO {
  coordenadas?: OutingCoordinates;

  fecha_hora_inicio: string;
  fecha_hora_retorno: string;

  cantidad_acompanantes?: number;

  itinerario_descripcion: string;

  estado?: OutingStatus;
}