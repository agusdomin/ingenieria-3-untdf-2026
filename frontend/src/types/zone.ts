export type RiskLevel =
  | 'extremo'
  | 'alto'
  | 'considerable'
  | 'moderado'
  | 'bajo';

export interface Zone {
  id: string;
  name: string;

  riskLevel: RiskLevel;

  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  updatedAt: string;
}