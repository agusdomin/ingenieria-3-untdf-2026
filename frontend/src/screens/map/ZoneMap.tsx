import { Fragment, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, UrlTile } from 'react-native-maps';

import { useTheme } from '../../theme/useTheme';
import { getZoneColor, getZoneCoordinates } from './zoneMap.types';
import type { ZoneMapProps } from './zoneMap.types';

// react-native-maps is bundled in Expo Go; MapLibre is not.
export function ZoneMap({ features, onZonePress, mapStyle, userLocation }: ZoneMapProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [readyTimedOut, setReadyTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ready) setReadyTimedOut(true);
    }, 12000);

    return () => clearTimeout(timeout);
  }, [ready]);

  useEffect(() => {
    if (userLocation && ready) {
      mapRef.current?.animateToRegion(
        { ...userLocation, latitudeDelta: 0.035, longitudeDelta: 0.035 },
        500
      );
    }
  }, [ready, userLocation]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        // Use public raster tiles instead of relying on Google basemap tiles,
        // which can appear blank in some Expo Go / device configurations.
        mapType="none"
        initialRegion={{
          latitude: -54.745,
          longitude: -68.275,
          latitudeDelta: 0.2,
          longitudeDelta: 0.5,
        }}
        userInterfaceStyle="light"
        onMapReady={() => {
          console.info('[ZoneMap] Native map is ready');
          setReady(true);
        }}
        onMapLoaded={() => console.info('[ZoneMap] Google base map loaded')}
      >
        <UrlTile
          urlTemplate={mapStyle === 'terrain'
            ? 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
            : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}
          maximumZ={19}
          tileSize={256}
          zIndex={1}
        />
        {features.map((feature) => {
          const coordinates = getZoneCoordinates(feature);
          const color = getZoneColor(feature.properties.riskLevel, theme);
          const latitudes = coordinates.map((point) => point.latitude);
          const longitudes = coordinates.map((point) => point.longitude);

          return (
            <Fragment key={feature.properties.id}>
              <Polygon
                coordinates={coordinates}
                strokeColor={color}
                fillColor={`${color}73`}
                strokeWidth={2}
                tappable
                onPress={() => onZonePress(feature.properties.id)}
              />
              <Marker
                coordinate={{
                  latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
                  longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
                }}
                title={feature.properties.name}
                description={`Peligro de ejemplo: ${feature.properties.riskLevel}`}
                pinColor={color}
                onCalloutPress={() => onZonePress(feature.properties.id)}
              />
            </Fragment>
          );
        })}
        {userLocation && (
          <Marker coordinate={userLocation} title="Tu ubicación">
            <View style={styles.locationMarker}>
              <View style={styles.locationDot} />
            </View>
          </Marker>
        )}
      </MapView>
      {readyTimedOut && !ready && (
        <View pointerEvents="none" style={styles.mapWarning}>
          <Text style={styles.mapWarningTitle}>El mapa no se inicializó</Text>
          <Text style={styles.mapWarningBody}>
            El mapa nativo no confirmó que esté listo. Revisá los logs de Android para ver el error concreto.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapWarning: {
    position: 'absolute',
    top: '42%',
    left: 24,
    right: 24,
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#10202BEB',
  },
  mapWarningTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  mapWarningBody: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  locationMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#22D3EE55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22D3EE',
  },
});
