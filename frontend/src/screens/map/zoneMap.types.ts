import type { zonesGeoJSON } from '../../mocks/zones.mock';
import type { AppTheme, RiskLevel } from '../../theme/types';

export type ZoneFeature = (typeof zonesGeoJSON.features)[number];

export interface ZoneMapProps {
  features: ZoneFeature[];
  onZonePress: (zonaId: string) => void;
  mapStyle: 'street' | 'terrain';
  userLocation: { latitude: number; longitude: number } | null;
  zoomControlTop: number;
}

export function getZoneColor(riskLevel: string, theme: AppTheme) {
  return theme.risk[riskLevel as RiskLevel] ?? '#64748B';
}

// GeoJSON stores longitude first; native maps and Leaflet expect latitude first.
export function getZoneCoordinates(feature: ZoneFeature) {
  return feature.geometry.coordinates[0].map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
}
