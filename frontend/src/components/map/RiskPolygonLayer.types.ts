import type { Feature, FeatureCollection, Polygon } from 'geojson';

export interface RiskZoneProperties {
  id: string;
  name: string;
  riskLevel: string;
}

export type RiskZoneFeature = Feature<Polygon, RiskZoneProperties>;
export type RiskZoneCollection = FeatureCollection<Polygon, RiskZoneProperties>;

export interface RiskPolygonLayerProps {
  zones: RiskZoneCollection;
  onSelectZone: (zoneId: string) => void;
  id?: string;
}
