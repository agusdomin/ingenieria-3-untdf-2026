import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  ViewAnnotation,
  type CameraRef,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useTheme } from "../../theme/useTheme";
import { circle } from '@turf/turf';
import { SymbolView } from 'expo-symbols';
import { EMPTY_ZONES, ignoreZonePress } from "../../screens/map/zoneMap.types";
import { RiskPolygonLayer } from "./RiskPolygonLayer";
import { LocationControl } from "./LocationControl";
import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  type MapContainerProps,
} from "./MapContainer.types";

export function MapContainerNative({
  features = EMPTY_ZONES,
  showRiskZones = true,
  focusBounds,
  onZonePress = ignoreZonePress,
  mapStyle,
  userLocation,
  selectedLocation,
  zoomControlTop,
  zoomControlBottom,
  children,
  onLoad,
  onError,
  onMapPress,
  onCameraChange,
  onLocate,
  locating,
  events,
  onEventPress,
  trafficArea,
  observationAreas,
  onObservationAreaPress,
}: MapContainerProps) {
  const { theme } = useTheme();
  const camera = useRef<CameraRef>(null);
  const zoom = useRef(INITIAL_ZOOM);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const maxZoom = mapStyle === "terrain" ? 17 : 19;
  const style = useMemo<StyleSpecification>(
    () => ({
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        base: {
          type: "raster",
          tileSize: 256,
          maxzoom: maxZoom,
          tiles: [
            mapStyle === "terrain"
              ? "https://tile.opentopomap.org/{z}/{x}/{y}.png"
              : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          attribution:
            mapStyle === "terrain"
              ? "© OpenStreetMap contributors · © OpenTopoMap (CC-BY-SA)"
              : "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "base", type: "raster", source: "base" }],
    }),
    [mapStyle, maxZoom],
  );
  const data = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features,
    }),
    [features],
  );

  useEffect(() => {
    if (ready && userLocation) {
      camera.current?.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
        duration: 600,
      });
    }
  }, [ready, userLocation]);

  useEffect(() => {
    if (ready && focusBounds) {
      camera.current?.fitBounds(focusBounds, {
        padding: { top: (zoomControlTop ?? 16) + 32, bottom: 120, left: 72, right: 72 },
        duration: 600,
      });
    }
  }, [ready, focusBounds, zoomControlTop]);

  useEffect(() => {
    if (ready && selectedLocation) {
      const circleGeo = circle(
        [selectedLocation.longitude, selectedLocation.latitude],
        (selectedLocation.radius ?? 1000) / 1000,
        { steps: 64, units: "kilometers" }
      );
      const coords = circleGeo.geometry.coordinates[0];
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      const bounds: [number, number, number, number] = [
        Math.min(...lons),
        Math.min(...lats),
        Math.max(...lons),
        Math.max(...lats),
      ];
      camera.current?.fitBounds(bounds, {
        padding: {
          top: Math.max(72, zoomControlTop ?? 16),
          bottom: selectedLocation.radius ? 360 : 60,
          left: 36,
          right: 36,
        },
        duration: 450,
      });
    }
  }, [ready, selectedLocation, zoomControlTop]);

  function changeZoom(delta: number) {
    zoom.current = Math.max(2, Math.min(maxZoom, zoom.current + delta));
    camera.current?.zoomTo(zoom.current, { duration: 200 });
  }

  return (
    <View style={styles.container}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={style}
        onDidFinishLoadingMap={() => {
          setReady(true);
          setFailed(false);
          onLoad?.();
        }}
        onDidFailLoadingMap={() => {
          setFailed(true);
          onError?.();
        }}
        onPress={(event) => onMapPress?.(event.nativeEvent.lngLat)}
        onRegionDidChange={(event) => {
          zoom.current = event.nativeEvent.zoom;
          onCameraChange?.({
            center: event.nativeEvent.center,
            zoom: event.nativeEvent.zoom,
          });
        }}
      >
        <Camera
          ref={camera}
          initialViewState={{ center: INITIAL_CENTER, zoom: INITIAL_ZOOM }}
          minZoom={2}
          maxZoom={maxZoom}
        />
        {showRiskZones ? (
          <RiskPolygonLayer zones={data} onSelectZone={onZonePress} />
        ) : null}
        {!!observationAreas?.length && <GeoJSONSource id="observation-areas" data={{ type: 'FeatureCollection', features: observationAreas.map((area) => area.feature) }}
          onPress={(event) => {
            event.stopPropagation();
            const id = event.nativeEvent.features[0]?.properties?.id;
            if (typeof id === 'string') onObservationAreaPress?.(id);
          }}>
          <Layer id="observation-areas-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.22 }} />
          <Layer id="observation-areas-border" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
        </GeoJSONSource>}
        {events?.filter((item) => item.kind === 'observation').map((item) => (
          <ViewAnnotation key={item.id} id={item.id} lngLat={item.coordinate} onPress={(event) => {
            event.stopPropagation();
            onEventPress?.(item.id);
          }}>
            <View collapsable={false} accessible accessibilityRole="button" accessibilityLabel={item.title}
              style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: item.color, alignItems: 'center', justifyContent: 'center' }}>
              <SymbolView name={{ ios: 'binoculars.fill', android: 'visibility', web: 'visibility' }} size={20} tintColor="#FFFFFF" />
            </View>
          </ViewAnnotation>
        ))}
        {!!events?.some((item) => item.kind === 'report') && <GeoJSONSource id="map-events" data={{ type: 'FeatureCollection', features: events.filter((item) => item.kind === 'report').map((item) => ({
          type: 'Feature', geometry: { type: 'Point', coordinates: item.coordinate },
          properties: { id: item.id, color: item.color, label: item.kind === 'report' ? 'R' : 'O' },
        })) }} onPress={(event) => {
          event.stopPropagation();
          const id = event.nativeEvent.features[0]?.properties?.id;
          if (typeof id === 'string') onEventPress?.(id);
        }}>
          <Layer id="event-dots" type="circle" paint={{ 'circle-radius': 14, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 }} />
          <Layer id="event-labels" type="symbol" layout={{ 'text-field': ['get', 'label'], 'text-font': ['Open Sans Regular'], 'text-size': 14, 'text-allow-overlap': true }} paint={{ 'text-color': '#FFFFFF' }} />
        </GeoJSONSource>}
        {userLocation && (
          <GeoJSONSource
            id="user-location"
            data={{
              type: "Point",
              coordinates: [userLocation.longitude, userLocation.latitude],
            }}
          >
            <Layer
              id="user-dot"
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": theme.colors.primary,
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 3,
              }}
            />
          </GeoJSONSource>
        )}
        {selectedLocation && (
          <>
            <GeoJSONSource
              id="selected-location-radius"
              data={circle(
                [selectedLocation.longitude, selectedLocation.latitude],
                (selectedLocation.radius ?? 1000) / 1000,
                { steps: 64, units: "kilometers" }
              )}
            >
              <Layer
                id="selected-location-radius-fill"
                type="fill"
                paint={{
                  "fill-color": "#EA4335",
                  "fill-opacity": 0.16,
                }}
              />
              <Layer
                id="selected-location-radius-line"
                type="line"
                paint={{
                  "line-color": "#EA4335",
                  "line-width": 2,
                }}
              />
            </GeoJSONSource>
            <GeoJSONSource
              id="selected-location"
              data={{
                type: "Point",
                coordinates: [
                  selectedLocation.longitude,
                  selectedLocation.latitude,
                ],
              }}
            >
              <Layer
                id="selected-location-dot"
                type="circle"
                paint={{
                  "circle-radius": 11,
                  "circle-color": "#EA4335",
                  "circle-stroke-color": "#FFFFFF",
                  "circle-stroke-width": 3,
                }}
              />
            </GeoJSONSource>
          </>
        )}

        {children}
      </Map>
      <View
        style={[
          styles.zoom,
          zoomControlBottom === undefined
            ? { top: zoomControlTop }
            : { bottom: zoomControlBottom },
        ]}
      >
        {[1, -1].map((delta) => (
          <Pressable
            key={delta}
            accessibilityRole="button"
            accessibilityLabel={delta > 0 ? "Acercar mapa" : "Alejar mapa"}
            onPress={() => changeZoom(delta)}
            style={[styles.button, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={{ fontSize: 26, color: theme.colors.textPrimary }}>
              {delta > 0 ? "+" : "−"}
            </Text>
          </Pressable>
        ))}
      </View>
      <LocationControl
        onLocate={onLocate}
        locating={locating}
        zoomControlTop={zoomControlTop}
        zoomControlBottom={zoomControlBottom}
      />
      {failed && (
        <Text
          accessibilityRole="alert"
          style={[
            styles.error,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.textPrimary,
            },
          ]}
        >
          No se pudo cargar el mapa. Revisá la conexión.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  zoom: { position: "absolute", right: 11, gap: 9 },
  button: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
  },
});
