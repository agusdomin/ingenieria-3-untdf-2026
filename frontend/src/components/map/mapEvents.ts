import type { Observation } from '../../types/observation';
import type { Report } from '../../types/report';

export interface MapEvent {
  id: string;
  kind: 'observation' | 'report';
  coordinate: [number, number];
  title: string;
  summary: string;
  author: string;
  date: string;
  level: string | null;
  image?: string | null;
  color: string;
}

// Coordinates are an unrestricted JSON field in the deployed schema.
export function pointCoordinates(value: unknown): [number, number] | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Record<string, unknown>;
  const pair = p.type === 'Point' ? p.coordinates : value;
  const longitude = Array.isArray(pair) ? pair[0] : p.longitude ?? p.longitud ?? p.lon ?? p.x;
  const latitude = Array.isArray(pair) ? pair[1] : p.latitude ?? p.latitud ?? p.lat ?? p.y;
  if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
      !Number.isFinite(longitude) || !Number.isFinite(latitude) ||
      Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return null;
  return [longitude, latitude];
}

export function mapEvents(observations: Observation[], reports: Report[]): MapEvent[] {
  return [
    ...observations.flatMap((item): MapEvent[] => {
      const coordinate = pointCoordinates(item.coordenadas);
      return coordinate ? [{ id: `observation-${item.id}`, kind: 'observation', coordinate,
        title: item.titulo || `Observación #${item.id}`, summary: item.descripcion || 'Sin descripción',
        author: item.usuario_nombre, date: item.fecha_hora, level: item.nivel_relevancia,
        image: item.imagen || item.foto_url, color: '#176B91' }] : [];
    }),
    ...reports.flatMap((item): MapEvent[] => {
      const coordinate = pointCoordinates(item.coordenadas);
      return coordinate ? [{ id: `report-${item.id}`, kind: 'report', coordinate,
        title: `Reporte técnico #${item.id}`, summary: item.diagnostico_resumen || 'Sin diagnóstico resumido',
        author: item.usuario_nombre, date: item.fecha_hora, level: item.nivel_peligro_estimado,
        color: '#A64616' }] : [];
    }),
  ];
}
