import { View } from 'react-native';
import { ZoneMap } from '../../screens/map/ZoneMap.web';
import { LocationControl } from './LocationControl';
import type { MapContainerProps } from './MapContainer.types';

export function MapContainer(props: MapContainerProps) {
  return (
    <View style={{ flex: 1 }}>
      <ZoneMap {...props} />
      <LocationControl {...props} />
      {props.children}
    </View>
  );
}
