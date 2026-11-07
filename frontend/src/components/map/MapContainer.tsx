import { isRunningInExpoGo } from 'expo';
import type { ComponentType } from 'react';
import { View } from 'react-native';
import { ZoneMap } from '../../screens/map/ZoneMap';
import { LocationControl } from './LocationControl';
import type { MapContainerProps } from './MapContainer.types';

function ExpoGoMapContainer(props: MapContainerProps) {
  return (
    <View style={{ flex: 1 }}>
      <ZoneMap {...props} />
      <LocationControl {...props} />
      {props.children}
    </View>
  );
} 

export const MapContainer: ComponentType<MapContainerProps> = isRunningInExpoGo()
  ? ExpoGoMapContainer
  : require('./MapContainerNative').MapContainerNative;
