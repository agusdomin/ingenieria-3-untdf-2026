import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map, type CameraRef, type StyleSpecification } from '@maplibre/maplibre-react-native';
import { useTheme } from '../../theme/useTheme';
import { RiskPolygonLayer } from './RiskPolygonLayer';
import { LocationControl } from './LocationControl';
import { INITIAL_CENTER, INITIAL_ZOOM, type MapContainerProps } from './MapContainer.types';

export function MapContainerNative({ features, focusBounds, onZonePress, mapStyle, userLocation, zoomControlTop, children, onLoad, onError, onMapPress, onCameraChange, onLocate, locating }: MapContainerProps) {
  const { theme } = useTheme();
  const camera = useRef<CameraRef>(null);
  const zoom = useRef(INITIAL_ZOOM);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const maxZoom = mapStyle === 'terrain' ? 17 : 19;
  const style = useMemo<StyleSpecification>(() => ({
    version: 8,
    sources: {
      base: {
        type: 'raster', tileSize: 256, maxzoom: maxZoom,
        tiles: [mapStyle === 'terrain' ? 'https://tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        attribution: mapStyle === 'terrain' ? '© OpenStreetMap contributors · © OpenTopoMap (CC-BY-SA)' : '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  }), [mapStyle, maxZoom]);
  const data = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features,
  }), [features]);

  useEffect(() => {
    if (ready && userLocation) {
      camera.current?.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 13, duration: 600 });
    }
  }, [ready, userLocation]);

  useEffect(() => {
    if (ready && focusBounds) {
      camera.current?.fitBounds(focusBounds, { padding: { top: zoomControlTop + 32, bottom: 120, left: 72, right: 72 }, duration: 600 });
    }
  }, [ready, focusBounds, zoomControlTop]);

  function changeZoom(delta: number) {
    zoom.current = Math.max(2, Math.min(maxZoom, zoom.current + delta));
    camera.current?.zoomTo(zoom.current, { duration: 200 });
  }

  return (
    <View style={styles.container}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={style}
        onDidFinishLoadingMap={() => { setReady(true); setFailed(false); onLoad?.(); }}
        onDidFailLoadingMap={() => { setFailed(true); onError?.(); }}
        onPress={(event) => onMapPress?.(event.nativeEvent.lngLat)}
        onRegionDidChange={(event) => {
          zoom.current = event.nativeEvent.zoom;
          onCameraChange?.({ center: event.nativeEvent.center, zoom: event.nativeEvent.zoom });
        }}
      >
        <Camera ref={camera} initialViewState={{ center: INITIAL_CENTER, zoom: INITIAL_ZOOM }} minZoom={2} maxZoom={maxZoom} />
        <RiskPolygonLayer zones={data} onSelectZone={onZonePress} />
        {userLocation && (
          <GeoJSONSource id="user-location" data={{ type: 'Point', coordinates: [userLocation.longitude, userLocation.latitude] }}>
            <Layer id="user-dot" type="circle" paint={{ 'circle-radius': 8, 'circle-color': theme.colors.primary, 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 3 }} />
          </GeoJSONSource>
        )}
        {children}
      </Map>
      <View style={[styles.zoom, { top: zoomControlTop }]}>
        {[1, -1].map((delta) => (
          <Pressable key={delta} accessibilityRole="button" accessibilityLabel={delta > 0 ? 'Acercar mapa' : 'Alejar mapa'} onPress={() => changeZoom(delta)} style={[styles.button, { backgroundColor: theme.colors.surface }]}>
            <Text style={{ fontSize: 26, color: theme.colors.textPrimary }}>{delta > 0 ? '+' : '−'}</Text>
          </Pressable>
        ))}
      </View>
      <LocationControl onLocate={onLocate} locating={locating} zoomControlTop={zoomControlTop} />
      {failed && <Text accessibilityRole="alert" style={[styles.error, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]}>No se pudo cargar el mapa. Revisá la conexión.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  zoom: { position: 'absolute', left: 12, gap: 4 },
  button: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  error: { position: 'absolute', bottom: 100, left: 16, right: 16, padding: 12, borderRadius: 12 },
});
