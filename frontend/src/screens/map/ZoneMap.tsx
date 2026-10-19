import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { useTheme } from '../../theme/useTheme';
import { getZoneColor, getZoneCoordinates } from './zoneMap.types';
import type { ZoneMapProps } from './zoneMap.types';

type MapState = 'loading' | 'ready' | 'tiles-error' | 'engine-error';
type MapMessage = { type: 'ready' | 'tiles-ready' | 'tile-error' | 'engine-error' | 'zone-press'; id?: string };

export function ZoneMap({ features, onZonePress, mapStyle, userLocation, zoomControlTop }: ZoneMapProps) {
  const { theme } = useTheme();
  const [mapState, setMapState] = useState<MapState>('loading');

  const html = useMemo(() => {
    const payload = JSON.stringify({
      mapStyle,
      userLocation,
      zoomControlTop,
      features: features.map((feature) => ({
        id: feature.properties.id,
        name: feature.properties.name,
        riskLevel: feature.properties.riskLevel,
        color: getZoneColor(feature.properties.riskLevel, theme),
        coordinates: getZoneCoordinates(feature).map(({ latitude, longitude }) => [latitude, longitude]),
      })),
    }).replace(/</g, '\\u003c');

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #e8eef2; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .leaflet-container { background: #e8eef2; }
    .leaflet-top.leaflet-left { top: ${zoomControlTop}px; left: 12px; }
  </style>
</head>
<body>
  <div id="map" role="application" aria-label="Mapa de zonas de montaña"></div>
  <script>
    const DATA = ${payload};
    const report = (message) => window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    window.onerror = () => report({ type: 'engine-error' });
  </script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" onerror="report({type:'engine-error'})"></script>
  <script>
    try {
      const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([-54.745, -68.275], 10);
      L.control.zoom({ position: 'topleft' }).addTo(map);
      const isTerrain = DATA.mapStyle === 'terrain';
      const tileUrl = isTerrain
        ? 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      const layer = L.tileLayer(tileUrl, {
        maxZoom: isTerrain ? 17 : 19,
        attribution: isTerrain
          ? 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      layer.once('tileload', () => report({ type: 'tiles-ready' }));
      layer.on('tileerror', () => report({ type: 'tile-error' }));

      const polygons = DATA.features.map((feature) => {
        const polygon = L.polygon(feature.coordinates, {
          color: feature.color,
          fillColor: feature.color,
          fillOpacity: 0.45,
          weight: 2
        }).addTo(map);
        const label = document.createElement('span');
        label.textContent = feature.name + ' · ' + feature.riskLevel;
        polygon.bindTooltip(label);
        polygon.on('click', () => report({ type: 'zone-press', id: feature.id }));
        return polygon;
      });

      if (DATA.userLocation) {
        L.circleMarker([DATA.userLocation.latitude, DATA.userLocation.longitude], {
          radius: 8,
          color: '#FFFFFF',
          weight: 3,
          fillColor: '${theme.colors.primary}',
          fillOpacity: 1
        }).addTo(map).bindTooltip('Tu ubicación');
        map.setView([DATA.userLocation.latitude, DATA.userLocation.longitude], 13);
      } else if (polygons.length) {
        map.fitBounds(L.featureGroup(polygons).getBounds(), { padding: [32, 32], maxZoom: 12 });
      }

      setTimeout(() => map.invalidateSize(true), 250);
      report({ type: 'ready' });
    } catch (error) {
      report({ type: 'engine-error' });
    }
  </script>
</body>
</html>`;
  }, [features, mapStyle, theme, userLocation, zoomControlTop]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as MapMessage;
      if (message.type === 'ready' || message.type === 'tiles-ready') {
        setMapState('ready');
      } else if (message.type === 'tile-error') {
        setMapState((current) => current === 'ready' ? current : 'tiles-error');
      } else if (message.type === 'engine-error') {
        setMapState('engine-error');
      } else if (message.type === 'zone-press' && message.id) {
        onZonePress(message.id);
      }
    } catch {
      setMapState('engine-error');
    }
  };

  const statusMessage = mapState === 'loading'
    ? 'Iniciando mapa…'
    : mapState === 'engine-error'
      ? 'No se pudo iniciar Leaflet. Revisá la conexión para descargar el motor del mapa.'
      : mapState === 'tiles-error'
        ? 'El mapa inició, pero no llegan las imágenes del mapa. Revisá la conexión.'
        : null;

  return (
    <View style={styles.container}>
      <WebView
        key={html}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="never"
        onMessage={handleMessage}
        onError={() => setMapState('engine-error')}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 400) setMapState('tiles-error');
        }}
        style={styles.webView}
        containerStyle={styles.webViewContainer}
      />
      {statusMessage && (
        <View pointerEvents="none" style={[styles.status, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.statusText, { color: theme.colors.textPrimary }]}>{statusMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: StyleSheet.absoluteFill,
  webViewContainer: { flex: 1, backgroundColor: '#E8EEF2' },
  webView: { flex: 1, backgroundColor: '#E8EEF2' },
  status: {
    position: 'absolute',
    top: 12,
    left: 18,
    right: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
