import { View } from 'react-native';

import { BaseMap } from '../../screens/map/BaseMap.web';
import { LocationControl } from './LocationControl';
import type { MapContainerProps } from './MapContainer.types';

export function MapContainer(props: MapContainerProps) {
  return (
    <View style={{ flex: 1 }}>
      <BaseMap {...props} />
      <LocationControl {...props} />
      {props.children}
    </View>
  );
}