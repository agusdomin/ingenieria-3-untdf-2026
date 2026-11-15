import type { ReactNode } from 'react';

export const INITIAL_CENTER: [number, number] = [-68.30, -54.81];
export const INITIAL_ZOOM = 11;

export interface MapContainerProps {
  focusBounds?: [number, number, number, number];

  mapStyle: 'street' | 'terrain';

  userLocation: {
    latitude: number;
    longitude: number;
  } | null;

  zoomControlTop?: number;

  children?: ReactNode;

  locating?: boolean;

  onLocate?: () => void;

  onLoad?: () => void;

  onError?: () => void;

  onMapPress?: (coordinate: [number, number]) => void;

  onCameraChange?: (camera: {
    center: [number, number];
    zoom: number;
  }) => void;
}