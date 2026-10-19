import { useState } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
} from '@maplibre/maplibre-react-native';

import { useRouter } from 'expo-router';

import { zonesGeoJSON } from '../../mocks/zones.mock';
import { useTheme } from '../../theme/useTheme';

interface SelectedZone {
  id: string;
  name: string;
  riskLevel: string;
}

export function MapScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [search, setSearch] = useState('');

  const handleZonePress = (event: any) => {
    const feature =
      event.nativeEvent.features?.[0];

    if (!feature) {
      return;
    }

    const zone: SelectedZone = {
      id: feature.properties.id,
      name: feature.properties.name,
      riskLevel:
        feature.properties.riskLevel,
    };

    router.push({
  pathname: '/mapa/zona/[zonaId]',
  params: {
    zonaId: zone.id,
  },
});
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            theme.typography.title,
            {
              color:
                theme.colors.textPrimary,
            },
          ]}
        >
          Mapa
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar zona"
          placeholderTextColor={
            theme.colors.inputPlaceholder
          }
          style={[
            styles.search,
            {
              backgroundColor:
                theme.colors.inputBackground,
              borderColor:
                theme.colors.inputBorder,
              color:
                theme.colors.textPrimary,
            },
          ]}
        />
      </View>

      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          mapStyle="https://demotiles.maplibre.org/style.json"
          logo={false}
          attribution={false}
        >
          <Camera
            initialViewState={{
              center: [
                -68.3029,
                -54.8019,
              ],
              zoom: 9,
            }}
          />

          <GeoJSONSource
            id="zones-source"
            data={zonesGeoJSON}
            onPress={handleZonePress}
          >
            <Layer
              id="zones-fill"
              type="fill"
              source="zones-source"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'riskLevel'],

                  'extremo',
                  theme.risk.extremo,

                  'alto',
                  theme.risk.alto,

                  'considerable',
                  theme.risk.considerable,

                  'moderado',
                  theme.risk.moderado,

                  'bajo',
                  theme.risk.bajo,

                  '#64748B',
                ],

                'fill-opacity': 0.45,
              }}
            />

            <Layer
              id="zones-border"
              type="line"
              source="zones-source"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'riskLevel'],

                  'extremo',
                  theme.risk.extremo,

                  'alto',
                  theme.risk.alto,

                  'considerable',
                  theme.risk.considerable,

                  'moderado',
                  theme.risk.moderado,

                  'bajo',
                  theme.risk.bajo,

                  '#64748B',
                ],

                'line-width': 2,
              }}
            />
          </GeoJSONSource>
        </Map>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },

  search: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  map: {
    flex: 1,
  },
});