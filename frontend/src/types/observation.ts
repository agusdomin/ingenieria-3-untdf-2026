export type ObservationType =
  | 'nieve'
  | 'indicio_avalancha'
  | 'terreno'
  | 'peligro'
  | 'otra';

export interface Observation {
  id: string;

  zoneId: string;

  latitude: number;
  longitude: number;

  type: ObservationType;

  description: string;

  imageUrl?: string;

  createdAt: string;

  createdBy: string;
}

export interface CreateObservationDTO {
  zoneId: string;

  latitude: number;
  longitude: number;

  type: ObservationType;

  description: string;

  imageUrl?: string;
}