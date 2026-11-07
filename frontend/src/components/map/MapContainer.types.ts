import type { ReactNode } from 'react';
import type { ZoneMapProps } from '../../screens/map/zoneMap.types';

export const INITIAL_CENTER: [number, number] = [-68.30, -54.81];
export const INITIAL_ZOOM = 11;

export interface MapContainerProps extends ZoneMapProps {
  focusBounds?: [number, number, number, number];
  children?: ReactNode;
  locating?: boolean;
  onLocate?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  onMapPress?: (coordinate: [number, number]) => void;
  onCameraChange?: (camera: { center: [number, number]; zoom: number }) => void;
}
