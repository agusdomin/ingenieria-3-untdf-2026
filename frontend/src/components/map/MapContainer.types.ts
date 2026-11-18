import type { ReactNode } from "react";
import type { ObservationArea } from './observationAreas';
import type { MapEvent } from './mapEvents';
import type { TrafficByAreaResponse } from '../../types/outing';
import type { ZoneMapProps } from "../../screens/map/zoneMap.types";

export const INITIAL_CENTER: [number, number] = [-68.3, -54.81];
export const INITIAL_ZOOM = 11;

export interface MapContainerProps extends ZoneMapProps {
  observationAreas?: ObservationArea[];
  onObservationAreaPress?: (id: string) => void;
  events?: MapEvent[];
  onEventPress?: (id: string) => void;
  trafficArea?: TrafficByAreaResponse | null;
  showRiskZones?: boolean;
  zoomControlBottom?: number;
  focusBounds?: [number, number, number, number];
  children?: ReactNode;
  locating?: boolean;
  onLocate?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  onMapPress?: (coordinate: [number, number]) => void;
  onCameraChange?: (camera: { center: [number, number]; zoom: number }) => void;
  selectedLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}
