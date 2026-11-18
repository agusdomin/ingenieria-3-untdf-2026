import { useCallback, useMemo, useState } from "react";
import { observationAreas } from '../../components/map/observationAreas';
import { ObservationAreaSheet } from '../../components/map/ObservationAreaSheet';

import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { SymbolViewProps } from "expo-symbols";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { MapAccountModal } from "../../components/auth/MapAccountModal";
import { LoginGateModal } from '../../components/auth/LoginGateModal';
import { MapContainer } from "../../components/map/MapContainer";
import { MapLayersSheet } from "../../components/map/MapLayersSheet";
import { MapEventSheet } from '../../components/map/MapEventSheet';
import { mapEvents } from '../../components/map/mapEvents';
import { useObservations } from '../../queries/observations.queries';
import { useReports } from '../../queries/reports.queries';
import { useAuth } from '../../contexts/AuthContext';
import { MoreOptionsButton } from "../../components/navigation/MoreOptionsButton";

import { useLocation } from "../../hooks/useLocation";
import { AppBottomSheet } from "../../components/ui/AppBottomSheet";
import { useCurrentMeteorology } from "../../queries/meteorology.queries";
import { useTrafficByArea } from "../../queries/outings.queries";
import { useTheme } from "../../theme/useTheme";

type SelectedArea = {
  latitude: number;
  longitude: number;
  radius: number;
};
export function MapScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const observationsQuery = useObservations();
  const reportsQuery = useReports();
  const [showObservations, setShowObservations] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showObservationAreas, setShowObservationAreas] = useState(true);
  const [selectedObservationAreaId, setSelectedObservationAreaId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const allEvents = useMemo(() => mapEvents(
    observationsQuery.data ?? [], reportsQuery.data ?? [],
  ), [observationsQuery.data, reportsQuery.data]);
  const events = useMemo(() => allEvents.filter((event) =>
    event.kind === 'observation' ? showObservations : showReports,
  ), [allEvents, showObservations, showReports]);
  const observationCount = allEvents.filter((event) => event.kind === 'observation').length;
  const areas = useMemo(() => showObservationAreas ? observationAreas(allEvents) : [], [allEvents, showObservationAreas]);
  const selectedObservationArea = areas.find((area) => area.id === selectedObservationAreaId) ?? null;
  const reportCount = allEvents.length - observationCount;
  const observationStatus = layerStatus(observationsQuery, observationCount);
  const reportStatus = layerStatus(reportsQuery, reportCount);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  const [focusBounds, setFocusBounds] =
    useState<[number, number, number, number]>();

  const [mapStyle, setMapStyle] =
    useState<"street" | "terrain">("terrain");

  const [showLayers, setShowLayers] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showReportLogin, setShowReportLogin] = useState(false);

  const {
    latitude,
    longitude,
    loading: locating,
    error,
    isFallback,
    retry,
  } = useLocation();
  const [selectedArea, setSelectedArea] =
  useState<SelectedArea | null>(null);
  const [trafficLocation, setTrafficLocation] = useState<SelectedArea | null>(null);
  const handleEventPress = useCallback((id: string) => {
    setSelectedObservationAreaId(null);
    Keyboard.dismiss();
    setSelectedArea(null);
    setSelectedEventId(id);
  }, []);
  const handleObservationAreaPress = useCallback((id: string) => {
    Keyboard.dismiss();
    setSelectedArea(null);
    setSelectedEventId(null);
    setSelectedObservationAreaId(id);
  }, []);
  const [locationNoticeDismissed, setLocationNoticeDismissed] = useState(false);
  const [mapResetVersion, setMapResetVersion] = useState(0);
  const [bottomControlsHeight, setBottomControlsHeight] = useState(54);

  const bottomSpacing = Math.max(12, insets.bottom);
  const zoomControlBottom =
    bottomSpacing + bottomControlsHeight + 12;

  const userLocation = useMemo(
    () =>
      isFallback ||
      latitude === null ||
      longitude === null ||
      locating
        ? null
        : { latitude, longitude },
    [latitude, longitude, locating, isFallback],
  );

  const locationMessage = !locating ? error : null;

  const [showSafetyNotice, setShowSafetyNotice] =
    useState(false);

  const trafficQuery = useTrafficByArea(
    trafficLocation && showTraffic && isAuthenticated
      ? {
          latitude: trafficLocation.latitude,
          longitude: trafficLocation.longitude,
          radiusKm: trafficLocation.radius / 1000,
        }
      : null,
  );

  const meteorologyQuery = useCurrentMeteorology(
    selectedArea
      ? {
          latitude: selectedArea.latitude,
          longitude: selectedArea.longitude,
        }
      : null,
  );

  const handleMapPress = useCallback(
    (coordinate: [number, number]) => {
      const [longitude, latitude] = coordinate;

      Keyboard.dismiss();
      setSelectedEventId(null);
      setSelectedObservationAreaId(null);
      setTrafficLocation({ latitude, longitude, radius: 1000 });

      setSelectedArea({
        latitude,
        longitude,
        radius: 1000,
      });
    },
    [],
  );

  const locateMe = useCallback(async () => {
    setLocationNoticeDismissed(false);
    setFocusBounds(undefined);

    await retry();

    // Reiniciar la cámara también cuando no hay
    // una posición real que la recentre.
    setMapResetVersion((version) => version + 1);
  }, [retry]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={StyleSheet.absoluteFill}>
        <MapContainer
          key={mapResetVersion}
          focusBounds={focusBounds}
          mapStyle={mapStyle}
          showRiskZones={false}
          events={events}
          observationAreas={areas}
          onObservationAreaPress={handleObservationAreaPress}
          onEventPress={handleEventPress}
          trafficArea={showTraffic && isAuthenticated ? trafficQuery.data : null}
          selectedLocation={selectedArea}
          onMapPress={handleMapPress}
          userLocation={userLocation}
          zoomControlTop={insets.top + 64}
          zoomControlBottom={zoomControlBottom}
        />
      </View>

      <SafeAreaView
        edges={[]}
        pointerEvents="box-none"
        style={[styles.overlay, { top: insets.top + 8 }]}
      >
        <Pressable
          accessibilityLabel="Aviso de seguridad"
          accessibilityRole="button"
          onPress={() => setShowSafetyNotice(true)}
          style={({ pressed }) => [
            styles.safetyButton,
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "exclamationmark.triangle",
              android: "warning",
              web: "warning",
            }}
            tintColor="#FFFFFF"
            size={23}
          />
        </Pressable>

        <MoreOptionsButton onAccountPress={() => setShowAccount(true)} />
      </SafeAreaView>

      <View
        style={[
          styles.mapControls,
          { bottom: zoomControlBottom + 114 },
        ]}
      >
        <MapControl
          label="Capas del mapa"
          icon={{
            ios: "square.3.layers.3d",
            android: "layers",
            web: "layers",
          }}
          active={showLayers}
          onPress={() => {
            Keyboard.dismiss();
            setShowLayers(true);
          }}
        />

        <Pressable
          accessibilityLabel="Mostrar mi ubicación"
          accessibilityRole="button"
          disabled={locating}
          onPress={locateMe}
          style={({ pressed }) => [
            styles.mapControl,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          {locating ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
            />
          ) : (
            <SymbolView
              name={{
                ios: "location.north.fill",
                android: "my_location",
                web: "my_location",
              }}
              tintColor={
                userLocation
                  ? theme.colors.primary
                  : theme.colors.textPrimary
              }
              size={21}
            />
          )}
        </Pressable>
      </View>

      {locationMessage && !locationNoticeDismissed && (
        <View
          style={[
            styles.locationNotice,
            {
              bottom: zoomControlBottom,
              right: 76,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.locationNoticeText,
              { color: theme.colors.textPrimary },
            ]}
          >
            {locationMessage}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar aviso"
            onPress={() =>
              setLocationNoticeDismissed(true)
            }
            style={({ pressed }) => [
              styles.locationNoticeClose,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <SymbolView
              name={{
                ios: "xmark",
                android: "close",
                web: "close",
              }}
              size={16.5}
              tintColor={theme.colors.primary}
            />
          </Pressable>
        </View>
      )}

      <View
        pointerEvents="box-none"
        onLayout={(event) =>
          setBottomControlsHeight(
            event.nativeEvent.layout.height,
          )
        }
        style={[
          styles.bottomOverlay,
          { bottom: bottomSpacing },
        ]}
      >
        <View />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear reporte"
          onPress={() => {
            if (!isAuthenticated) {
              Keyboard.dismiss();
              setShowReportLogin(true);
              return;
            }
            router.push("/(tabs)/mapa/observacion/cargar-observacion" as never);
          }}
          style={({ pressed }) => [
            styles.reportButton,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "plus",
              android: "add",
              web: "add",
            }}
            tintColor={theme.colors.textInverse}
            size={22}
          />

          <Text
            style={[
              styles.reportButtonText,
              { color: theme.colors.textInverse },
            ]}
          >
            Reportar
          </Text>
        </Pressable>
      </View>

      <View style={[styles.activityBar, { top: insets.top + 8, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, { color: theme.colors.textSecondary }]}>ACTIVIDAD</Text>
          <Pressable disabled={!events.length} accessibilityRole="button" accessibilityLabel="Ver todos los puntos en el mapa" onPress={() => {
          const longitudes = events.map((event) => event.coordinate[0]);
          const latitudes = events.map((event) => event.coordinate[1]);
          setFocusBounds([Math.min(...longitudes) - 0.002, Math.min(...latitudes) - 0.002, Math.max(...longitudes) + 0.002, Math.max(...latitudes) + 0.002]);
          }} style={({ pressed }) => [styles.activityFit, { backgroundColor: theme.colors.surfaceSecondary, opacity: !events.length ? 0.4 : pressed ? 0.65 : 1 }]}>
            <SymbolView name={{ ios: 'arrow.up.left.and.arrow.down.right', android: 'fit_screen', web: 'fit_screen' }} size={20} tintColor={theme.colors.primary} />
          </Pressable>
        </View>
        <View style={styles.activityCounts}>
          {[
            { label: 'observaciones', count: observationCount, visible: showObservations, query: observationsQuery, color: '#176B91', round: true },
            { label: 'reportes', count: reportCount, visible: showReports, query: reportsQuery, color: '#A64616', round: false },
          ].map((item) => <View key={item.label} style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: item.color, borderRadius: item.round ? 6 : 2, opacity: item.visible ? 1 : 0.4 }]} />
            <Text style={[styles.activityLabel, { color: theme.colors.textPrimary }]}>
              <Text style={styles.activityCount}>{!item.visible ? '—' : item.query.isLoading ? '…' : item.query.isError ? '!' : item.count}</Text>
              {' '}{item.label}{!item.visible ? ' · oculta' : ''}
            </Text>
          </View>)}
        </View>
        {((showObservations && observationsQuery.isError) || (showReports && reportsQuery.isError)) &&
          <Pressable accessibilityRole="button" onPress={() => { void observationsQuery.refetch(); void reportsQuery.refetch(); }}>
            <Text style={{ color: theme.colors.danger, fontSize: 12, paddingVertical: 8 }}>Error en una capa · Reintentar</Text>
          </Pressable>}
        {showTraffic && trafficQuery.data && isAuthenticated && <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Área consultada: {trafficQuery.data.total_personas} personas · {trafficQuery.data.radio_km} km
        </Text>}
      </View>

      <MapEventSheet event={selectedEvent} onClose={() => setSelectedEventId(null)} />
      <ObservationAreaSheet area={selectedObservationArea} onClose={() => setSelectedObservationAreaId(null)} onEventPress={handleEventPress} />
      <AppBottomSheet
        visible={selectedArea !== null}
        onClose={() => setSelectedArea(null)}
        title="Área seleccionada"
      >
        {selectedArea && (
          <View style={styles.areaDetails}>
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor:
                    theme.colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Personas en salidas registradas
              </Text>
              {(!showTraffic || !isAuthenticated) && <Text style={{ color: theme.colors.textSecondary }}>
                {!isAuthenticated ? 'Iniciá sesión para consultar afluencia.' : 'Activá Afluencia en Capas del mapa para consultar esta área.'}
              </Text>}

              {trafficQuery.isLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />

                  <Text
                    style={[
                      styles.description,
                      {
                        color:
                          theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Consultando tránsito...
                  </Text>
                </View>
              )}

              {trafficQuery.isError && (
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.danger },
                  ]}
                >
                  No se pudo obtener la información de
                  tránsito.
                </Text>
              )}

              {showTraffic && isAuthenticated && trafficQuery.isSuccess && (
                <>
                  <Text
                    style={[
                      styles.trafficValue,
                      {
                        color:
                          theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {trafficQuery.data.total_personas}
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      {
                        color:
                          theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Personas asociadas a salidas en curso
                    dentro de un radio de{" "}
                    {trafficQuery.data.radio_km} km.
                  </Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor:
                    theme.colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Condiciones meteorológicas
              </Text>

              {meteorologyQuery.isLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />

                  <Text
                    style={[
                      styles.description,
                      {
                        color:
                          theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Consultando condiciones
                    meteorológicas...
                  </Text>
                </View>
              )}

              {meteorologyQuery.isError && (
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.danger },
                  ]}
                >
                  No se pudo obtener la información
                  meteorológica.
                </Text>
              )}

              {meteorologyQuery.isSuccess && (
                <>
                  <View style={styles.weatherMain}>
                    <Text
                      style={[
                        styles.weatherTemperature,
                        {
                          color:
                            theme.colors.textPrimary,
                        },
                      ]}
                    >
                      {meteorologyQuery.data.temperatura !=
                      null
                        ? `${meteorologyQuery.data.temperatura} °C`
                        : "—"}
                    </Text>

                    <Text
                      style={[
                        styles.weatherDescription,
                        {
                          color:
                            theme.colors.textSecondary,
                        },
                      ]}
                    >
                      Temperatura actual
                    </Text>
                  </View>

                  <View style={styles.weatherGrid}>
                    <WeatherItem
                      label="Viento"
                      value={`${
                        meteorologyQuery.data
                          .velocidad_viento ?? "—"
                      } km/h`}
                      detail={
                        meteorologyQuery.data
                          .direccion_viento ?? "Sin datos"
                      }
                    />

                    <WeatherItem
                      label="Ráfagas"
                      value={`${
                        meteorologyQuery.data.rafaga ?? "—"
                      } km/h`}
                    />

                    <WeatherItem
                      label="Precipitaciones"
                      value={`${
                        meteorologyQuery.data
                          .precipitaciones ?? "—"
                      } mm`}
                    />

                    <WeatherItem
                      label="Humedad"
                      value={`${
                        meteorologyQuery.data.humedad ?? "—"
                      } %`}
                    />

                    <WeatherItem
                      label="Nieve fresca"
                      value={`${
                        meteorologyQuery.data
                          .nieve_fresca ?? "—"
                      } cm`}
                    />

                    <WeatherItem
                      label="Espesor de nieve"
                      value={`${
                        meteorologyQuery.data
                          .espesor_nieve ?? "—"
                      } cm`}
                    />
                  </View>

                  <Text
                    style={[
                      styles.weatherUpdated,
                      {
                        color:
                          theme.colors.textSecondary,
                      },
                    ]}
                  >
                    Actualizado:{" "}
                    {new Date(
                      meteorologyQuery.data.fecha_hora,
                    ).toLocaleString("es-AR")}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </AppBottomSheet>

      <MapLayersSheet
        visible={showLayers}
        onClose={() => setShowLayers(false)}
        mapStyle={mapStyle}
        onMapStyleChange={setMapStyle}
        layers={[
          { id: 'observation-areas', label: 'Áreas con observaciones', detail: `${areas.length} grupos · 2 km · Todas las fechas. Amarillo: informativa; naranja: precaución; rojo: peligrosa`, visible: showObservationAreas, onChange: setShowObservationAreas },
          { id: 'observations', label: 'Observaciones de campo', detail: `Binoculares · ${observationStatus}`, visible: showObservations, onChange: setShowObservations },
          { id: 'reports', label: 'Reportes técnicos', detail: `R · ${reportStatus}`, visible: showReports, onChange: setShowReports },
          { id: 'traffic', label: 'Afluencia de personas', detail: isAuthenticated ? 'Tocá el mapa para consultar un radio de 500 m' : 'Iniciá sesión para consultar afluencia', visible: showTraffic, onChange: setShowTraffic },
        ]}
      />

      <LoginGateModal
        visible={showReportLogin}
        onDismiss={() => setShowReportLogin(false)}
        onSuccess={() => {
          setShowReportLogin(false);
          router.push("/(tabs)/mapa/observacion/cargar-observacion" as never);
        }}
      />

      {showAccount ? (
        <MapAccountModal
          onDismiss={() => setShowAccount(false)}
        />
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={showSafetyNotice}
        onRequestClose={() =>
          setShowSafetyNotice(false)
        }
      >
        <View
          style={[
            styles.noticeBackdrop,
            {
              backgroundColor:
                theme.colors.overlay,
            },
          ]}
        >
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.noticeIcon,
                {
                  backgroundColor: `${theme.colors.danger}22`,
                },
              ]}
            >
              <SymbolView
                name={{
                  ios: "exclamationmark.triangle.fill",
                  android: "warning",
                  web: "warning",
                }}
                tintColor={theme.colors.danger}
                size={25}
              />
            </View>

            <Text
              style={[
                styles.noticeTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              Antes de salir
            </Text>

            <Text
              style={[
                styles.noticeBody,
                {
                  color:
                    theme.colors.textSecondary,
                },
              ]}
            >
              La información mostrada en el mapa es
              orientativa. Consultá los reportes y
              boletines disponibles antes de tomar
              decisiones en terreno.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setShowSafetyNotice(false)
              }
              style={[
                styles.noticeAction,
                {
                  backgroundColor:
                    theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.noticeActionText,
                  {
                    color:
                      theme.colors.textInverse,
                  },
                ]}
              >
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function layerStatus(query: { isLoading: boolean; isError: boolean; data?: unknown[] }, locatedCount: number) {
  if (query.isLoading) return 'Cargando…';
  if (query.isError) return 'Error al cargar';
  const total = query.data?.length ?? 0;
  if (total === 0) return 'Sin registros';
  const missing = total - locatedCount;
  return `${locatedCount} puntos${missing > 0 ? ` · ${missing} sin ubicación válida` : ''}`;
}

interface MapControlProps {
  label: string;
  icon: SymbolViewProps["name"];
  active?: boolean;
  onPress: () => void;
}

function MapControl({
  label,
  icon,
  active,
  onPress,
}: MapControlProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.mapControl,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        active && {
          borderColor: theme.colors.primary,
        },
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={icon}
        tintColor={
          active
            ? theme.colors.primary
            : theme.colors.textPrimary
        }
        size={21}
      />
    </Pressable>
  );
}

interface WeatherItemProps {
  label: string;
  value: string;
  detail?: string;
}

function WeatherItem({
  label,
  value,
  detail,
}: WeatherItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.weatherItem,
        {
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.weatherLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.weatherValue,
          { color: theme.colors.textPrimary },
        ]}
      >
        {value}
      </Text>

      {detail ? (
        <Text
          style={[
            styles.weatherDetail,
            { color: theme.colors.textSecondary },
          ]}
        >
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activityBar: {
    position: 'absolute', left: 12, right: 76, maxWidth: 380,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10,
    shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  activityFit: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityCounts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 8, paddingBottom: 6 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  activityDot: { width: 10, height: 10 },
  activityLabel: { fontSize: 12 },
  activityCount: { fontSize: 19, fontWeight: '700', fontVariant: ['tabular-nums'] },
  screen: {
    flex: 1,
    overflow: "hidden",
  },

  overlay: {
    position: 'absolute',
    right: 12,
    zIndex: 4,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 0,
    paddingTop: 0,
  },

  safetyButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5222D",
    marginTop: 0,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  mapControls: {
    position: "absolute",
    right: 13,
    zIndex: 3,
    gap: 9,
  },

  mapControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  locationNotice: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 3,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  locationNoticeText: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
  },

  locationNoticeClose: {
    width: 33,
    height: 33,
    flexShrink: 0,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomOverlay: {
    position: "absolute",
    zIndex: 3,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },

  reportButton: {
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 11,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  reportButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  areaDetails: {
    gap: 14,
  },

  infoCard: {
    gap: 8,
    padding: 14,
    borderRadius: 16,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
  },

  trafficValue: {
    fontSize: 30,
    fontWeight: "800",
  },

  weatherMain: {
    gap: 2,
  },

  weatherTemperature: {
    fontSize: 30,
    fontWeight: "800",
  },

  weatherDescription: {
    fontSize: 12,
  },

  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  weatherItem: {
    width: "47%",
    padding: 10,
    borderRadius: 12,
  },

  weatherLabel: {
    fontSize: 11,
  },

  weatherValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  weatherDetail: {
    fontSize: 11,
  },

  weatherUpdated: {
    fontSize: 11,
    marginTop: 4,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  noticeBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  zoneWeatherUpdated: {
  fontSize: 11,
  marginTop: 4,
},
  noticeCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 24,
    borderWidth: 1,
    padding: 23,
    gap: 12,
  },

  noticeIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  noticeTitle: {
    fontSize: 21,
    fontWeight: "700",
  },

  noticeBody: {
    fontSize: 14,
    lineHeight: 21,
  },

  noticeAction: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  noticeActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
