import type { RiskZoneFeature } from '../../components/map/RiskPolygonLayer.types';
import type { AppTheme, RiskLevel } from '../../theme/types';

export type ZoneFeature = RiskZoneFeature;

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

export function getZoneCenter(feature: ZoneFeature) {
  const ring = feature.geometry.coordinates[0];

  if (!ring || ring.length < 3) {
    return null;
  }

  // Quitamos el último punto si repite el primero.
  const points = ring.slice();

  const first = points[0];
  const last = points[points.length - 1];

  if (
    first &&
    last &&
    first[0] === last[0] &&
    first[1] === last[1]
  ) {
    points.pop();
  }

  let area = 0;
  let centroidLongitude = 0;
  let centroidLatitude = 0;

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    if (!current || !next) continue;

    const cross =
      current[0] * next[1] -
      next[0] * current[1];

    area += cross;

    centroidLongitude +=
      (current[0] + next[0]) * cross;

    centroidLatitude +=
      (current[1] + next[1]) * cross;
  }

  if (Math.abs(area) < 1e-12) {
    return null;
  }

  return {
    longitude: centroidLongitude / (3 * area),
    latitude: centroidLatitude / (3 * area),
  };
}