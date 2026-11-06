export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Observation {
  id: number;

  usuario: number;
  usuario_nombre: string;

  coordenadas: Coordinates | null;

  titulo: string | null;
  descripcion: string | null;

  foto_url: string | null;

  fecha_hora: string;

  tipo: string;

  nivel_relevancia: string | null;
}

export interface CreateObservationDTO {
  coordenadas?: Coordinates;

  titulo?: string;

  descripcion?: string;

  foto_url?: string;

  fecha_hora?: string;

  tipo: string;

  nivel_relevancia?: string;
}