import { useMemo } from 'react';
import { GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';

import { useTheme } from '../../theme/useTheme';
import { getZoneColor } from '../../screens/map/zoneMap.types';
import type { RiskPolygonLayerProps } from './RiskPolygonLayer.types';

export function RiskPolygonLayer({ zones, onSelectZone, id = 'risk-zones' }: RiskPolygonLayerProps) {
  const { theme } = useTheme();
  const data = useMemo(() => ({
    ...zones,
    features: zones.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        color: getZoneColor(feature.properties.riskLevel, theme),
      },
    })),
  }), [zones, theme]);

  return (
    <GeoJSONSource id={id} data={data} onPress={(event) => {
      const zoneId = event.nativeEvent.features[0]?.properties?.id;
      if (typeof zoneId === 'string' && zoneId.length > 0) onSelectZone(zoneId);
    }}>
      <Layer id={`${id}-fill`} type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.45 }} />
      <Layer id={`${id}-border`} type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
    </GeoJSONSource>
  );
}
