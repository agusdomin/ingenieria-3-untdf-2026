import { isRunningInExpoGo } from 'expo';
import type { ComponentType } from 'react';

import type { MapContainerProps } from './MapContainer.types';

export const MapContainer: ComponentType<MapContainerProps> =
  isRunningInExpoGo()
    ? require('./MapContainerGo').MapContainerGo
    : require('./MapContainerNative').MapContainerNative;
