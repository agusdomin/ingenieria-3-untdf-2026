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
// INTERFAZ PARA LAS CONSULTAS DEL TRAFICO POR ZONA
export interface TrafficByZoneResponse {
  coordenadas: {
    latitud: number;
    longitud: number;
  };

  radio_km: number;
  total_personas: number;
}

export interface TrafficByZoneParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
}