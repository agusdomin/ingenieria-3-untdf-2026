import { buffer, convex, distance, featureCollection, lineString, point } from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import type { MapEvent } from './mapEvents';

export const AREA_COLORS = { informativa: '#D6AC16', precaucion: '#E07820', peligrosa: '#D93636', desconocida: '#7C8794' };
export type Relevance = keyof typeof AREA_COLORS;
export function relevance(value: string | null): Relevance {
  const normalized = value?.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized === 'informativa' || normalized === 'precaucion' || normalized === 'peligrosa' ? normalized : 'desconocida';
}
export interface ObservationArea {
  id: string;
  members: MapEvent[];
  counts: Record<Relevance, number>;
  level: Relevance;
  feature: Feature<Polygon | MultiPolygon>;
}

export function observationAreas(events: MapEvent[]): ObservationArea[] {
  const observations = events.filter((event) => event.kind === 'observation')
    .sort((a, b) => a.id.localeCompare(b.id));
  // Complete-link grouping prevents chains from extending beyond 2 km.
  const groups: MapEvent[][] = [];
  for (const event of observations) {
    const group = groups.find((members) => members.every((member) => distance(member.coordinate, event.coordinate) <= 2));
    if (group) group.push(event); else groups.push([event]);
  }
  return groups.flatMap((members): ObservationArea[] => {
    if (members.length < 2) return [];
    const coordinates = [...new Map(members.map((member) => [member.coordinate.join(','), member.coordinate])).values()];
    const hull = coordinates.length >= 3 ? convex(featureCollection(coordinates.map((coordinate) => point(coordinate)))) : null;
    // A 75 m envelope gives pairs, collinear and coincident points a visible area.
    const geometry = hull ?? buffer(coordinates.length > 1 ? lineString(coordinates) : point(coordinates[0]), 0.075);
    if (!geometry) return [];
    const counts = { informativa: 0, precaucion: 0, peligrosa: 0, desconocida: 0 };
    for (const member of members) counts[relevance(member.level)]++;
    const order: Relevance[] = ['peligrosa', 'precaucion', 'informativa'];
    const level = order.reduce<Relevance>((winner, candidate) => counts[candidate] > counts[winner] ? candidate : winner,
      counts.peligrosa + counts.precaucion + counts.informativa === 0 ? 'desconocida' : 'peligrosa');
    const id = members.map((member) => member.id).join('_');
    return [{ id, members, counts, level, feature: { ...geometry, properties: { id, color: AREA_COLORS[level] } } }];
  });
}
