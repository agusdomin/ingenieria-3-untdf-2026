import { useCallback, useMemo, useState } from "react";
import { distance } from "@turf/turf";
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
import { INITIAL_CENTER } from "../../components/map/MapContainer.types";
import { MapLayersSheet } from "../../components/map/MapLayersSheet";
import { MapEventSheet } from '../../components/map/MapEventSheet';
import { mapEvents, type MapEvent } from '../../components/map/mapEvents';
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
  const { isAuthenticated, hasRole } = useAuth();
  const observationsQuery = useObservations();
  const reportsQuery = useReports();
  const [showObservations, setShowObservations] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showObservationAreas, setShowObservationAreas] = useState(true);
  const [selectedObservationAreaId, setSelectedObservationAreaId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);
  const [trafficLocation, setTrafficLocation] = useState<SelectedArea | null>(null);
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
  const selectedEvent = allEvents.find((event) => event.id === selectedEventId) ?? null;

  const [activityCategory, setActivityCategory] = useState<'observation' | 'report'>('observation');

  const nearbyEvents = useMemo(() => {
    if (!selectedArea) return { observations: [] as MapEvent[], reports: [] as MapEvent[] };
    const center: [number, number] = [selectedArea.longitude, selectedArea.latitude];
    const observations: MapEvent[] = [];
    const reports: MapEvent[] = [];
    for (const ev of allEvents) {
      if (distance(center, ev.coordinate, { units: 'kilometers' }) <= 1) {
        if (ev.kind === 'observation') {
          observations.push(ev);
        } else {
          reports.push(ev);
        }
      }
    }
    return { observations, reports };
  }, [selectedArea, allEvents]);

  const activeCategoryItems =
    activityCategory === 'observation'
      ? nearbyEvents.observations
      : nearbyEvents.reports;

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

  const bottomSpacing = Math.max(12, insets.bottom);
  const zoomControlBottom = bottomSpacing + 12;

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

  const weatherCoords = useMemo(() => {
    if (selectedArea) {
      return {
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
      };
    }
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };
    }
    return {
      latitude: INITIAL_CENTER[1],
      longitude: INITIAL_CENTER[0],
    };
  }, [selectedArea, userLocation]);

  const meteorologyQuery = useCurrentMeteorology(weatherCoords);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
  }, []);

  const trafficBadge = useMemo(() => {
    return (
      <View
        style={[
          styles.trafficBadge,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityRole="summary"
        accessibilityLabel={
          showTraffic && isAuthenticated && trafficQuery.data
            ? `Afluencia en 1 km: ${trafficQuery.data.total_personas} personas`
            : "Afluencia en 1 km"
        }
      >
        <SymbolView
          name={{
            ios: "figure.skiing.downhill",
            android: "downhill_skiing",
            web: "downhill_skiing",
          }}
          size={16}
          tintColor={theme.colors.primary}
        />
        {trafficQuery.isLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{ transform: [{ scale: 0.7 }], width: 14, height: 14 }}
          />
        ) : (
          <Text
            style={[
              styles.trafficBadgeText,
              { color: theme.colors.textPrimary },
            ]}
          >
            {showTraffic && isAuthenticated && trafficQuery.data
              ? trafficQuery.data.total_personas
              : trafficQuery.isError
              ? "!"
              : "—"}
          </Text>
        )}
        <Text
          style={[
            styles.trafficBadgeText,
            { color: theme.colors.textSecondary },
          ]}
        >
          · 1 km
        </Text>
      </View>
    );
  }, [
    trafficQuery.isLoading,
    trafficQuery.isError,
    trafficQuery.data,
    showTraffic,
    isAuthenticated,
    theme.colors,
  ]);

  const handleMapPress = useCallback(
    (coordinate: [number, number]) => {
      const [longitude, latitude] = coordinate;

      Keyboard.dismiss();
      setIsWeatherExpanded(false);
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

      {/* Widget meteorológico flotante (esquina superior izquierda) */}
      <View
        pointerEvents="box-none"
        style={[styles.weatherWidgetContainer, { top: insets.top + 8 }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isWeatherExpanded
              ? "Colapsar información meteorológica"
              : `Clima hoy ${todayFormatted}: ${
                  meteorologyQuery.data?.temperatura != null
                    ? `${meteorologyQuery.data.temperatura} °C`
                    : "Consultando"
                }. Tocá para ver más detalles.`
          }
          onPress={() => setIsWeatherExpanded((prev) => !prev)}
          style={({ pressed }) => [
            styles.weatherWidgetPill,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{
              ios: "thermometer.medium",
              android: "device_thermostat",
              web: "device_thermostat",
            }}
            size={16}
            tintColor={theme.colors.primary}
          />
          <Text
            style={[
              styles.weatherWidgetDate,
              { color: theme.colors.textSecondary },
            ]}
          >
            {todayFormatted}
          </Text>
          <Text style={{ color: theme.colors.border }}>·</Text>
          {meteorologyQuery.isLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ transform: [{ scale: 0.7 }], width: 14, height: 14 }}
            />
          ) : (
            <Text
              style={[
                styles.weatherWidgetTemp,
                { color: theme.colors.textPrimary },
              ]}
            >
              {meteorologyQuery.data?.temperatura != null
                ? `${meteorologyQuery.data.temperatura} °C`
                : "—"}
            </Text>
          )}
          <SymbolView
            name={{
              ios: isWeatherExpanded ? "chevron.up" : "chevron.down",
              android: isWeatherExpanded ? "expand_less" : "expand_more",
              web: isWeatherExpanded ? "expand_less" : "expand_more",
            }}
            size={14}
            tintColor={theme.colors.textSecondary}
          />
        </Pressable>

        {isWeatherExpanded && (
          <View
            style={[
              styles.weatherExpandedCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.weatherExpandedHeader}>
              <View style={styles.weatherExpandedHeaderLeft}>
                <Text
                  style={[
                    styles.weatherExpandedTemp,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {meteorologyQuery.data?.temperatura != null
                    ? `${meteorologyQuery.data.temperatura} °C`
                    : "—"}
                </Text>
                <Text
                  style={[
                    styles.weatherExpandedDate,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Condiciones hoy · {todayFormatted}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar detalle meteorológico"
                onPress={() => setIsWeatherExpanded(false)}
                hitSlop={8}
                style={styles.weatherCloseButton}
              >
                <SymbolView
                  name={{
                    ios: "xmark",
                    android: "close",
                    web: "close",
                  }}
                  size={16}
                  tintColor={theme.colors.textSecondary}
                />
              </Pressable>
            </View>

            {meteorologyQuery.isLoading ? (
              <View style={styles.weatherLoadingRow}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  Consultando condiciones...
                </Text>
              </View>
            ) : meteorologyQuery.isError ? (
              <Text style={{ color: theme.colors.danger, fontSize: 12 }}>
                No se pudo obtener la información meteorológica.
              </Text>
            ) : meteorologyQuery.data ? (
              <>
                <View style={styles.weatherExpandedGrid}>
                  <WeatherItem
                    label="Viento"
                    value={`${
                      meteorologyQuery.data.velocidad_viento ?? "—"
                    } km/h`}
                    detail={
                      meteorologyQuery.data.direccion_viento ?? "Sin datos"
                    }
                  />

                  <WeatherItem
                    label="Ráfagas"
                    value={`${meteorologyQuery.data.rafaga ?? "—"} km/h`}
                  />

                  <WeatherItem
                    label="Precipitación"
                    value={`${
                      meteorologyQuery.data.precipitaciones ?? "—"
                    } mm`}
                  />

                  <WeatherItem
                    label="Humedad"
                    value={`${meteorologyQuery.data.humedad ?? "—"} %`}
                  />

                  {meteorologyQuery.data.nieve_fresca != null && (
                    <WeatherItem
                      label="Nieve fresca"
                      value={`${meteorologyQuery.data.nieve_fresca} cm`}
                    />
                  )}

                  {meteorologyQuery.data.espesor_nieve != null && (
                    <WeatherItem
                      label="Espesor nieve"
                      value={`${meteorologyQuery.data.espesor_nieve} cm`}
                    />
                  )}
                </View>

                {meteorologyQuery.data.fecha_hora && (
                  <Text
                    style={[
                      styles.weatherExpandedFooter,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Actualizado:{" "}
                    {new Date(
                      meteorologyQuery.data.fecha_hora
                    ).toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                )}
              </>
            ) : null}
          </View>
        )}
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

      <MapEventSheet event={selectedEvent} onClose={() => setSelectedEventId(null)} />
      <ObservationAreaSheet area={selectedObservationArea} onClose={() => setSelectedObservationAreaId(null)} onEventPress={handleEventPress} />
      <AppBottomSheet
        visible={selectedArea !== null && selectedEventId === null}
        onClose={() => {
          setSelectedArea(null);
          setTrafficLocation(null);
        }}
        title="Área seleccionada"
        headerRight={trafficBadge}
      >
        {selectedArea && (
          <View style={styles.areaDetails}>
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Actividad en 1 km
              </Text>

              <View style={styles.categoryRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Observaciones: ${nearbyEvents.observations.length} en 1 km`}
                  onPress={() => setActivityCategory('observation')}
                  style={[
                    styles.categoryChip,
                    activityCategory === 'observation'
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          activityCategory === 'observation'
                            ? theme.colors.textInverse
                            : '#176B91',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          activityCategory === 'observation'
                            ? theme.colors.textInverse
                            : theme.colors.textPrimary,
                        fontWeight:
                          activityCategory === 'observation' ? '700' : '500',
                      },
                    ]}
                  >
                    Observaciones ({nearbyEvents.observations.length})
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Reportes: ${nearbyEvents.reports.length} en 1 km`}
                  onPress={() => setActivityCategory('report')}
                  style={[
                    styles.categoryChip,
                    activityCategory === 'report'
                      ? {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        }
                      : {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          activityCategory === 'report'
                            ? theme.colors.textInverse
                            : '#A64616',
                        borderRadius: 2,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color:
                          activityCategory === 'report'
                            ? theme.colors.textInverse
                            : theme.colors.textPrimary,
                        fontWeight:
                          activityCategory === 'report' ? '700' : '500',
                      },
                    ]}
                  >
                    Reportes ({nearbyEvents.reports.length})
                  </Text>
                </Pressable>
              </View>

              {activeCategoryItems.length === 0 ? (
                <View style={styles.emptyActivityContainer}>
                  <Text
                    style={[
                      styles.emptyActivityText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {activityCategory === 'observation'
                      ? 'No hay observaciones de campo en este radio de 1 km.'
                      : 'No hay reportes técnicos en este radio de 1 km.'}
                  </Text>
                </View>
              ) : (
                <View style={styles.activityItemList}>
                  {activeCategoryItems.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver detalle de ${item.title}`}
                      onPress={() => setSelectedEventId(item.id)}
                      style={({ pressed }) => [
                        styles.activityItemRow,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.activityItemDot,
                          {
                            backgroundColor: item.color,
                            borderRadius: item.kind === 'observation' ? 6 : 2,
                          },
                        ]}
                      />
                      <View style={styles.activityItemTextContainer}>
                        <Text
                          style={[
                            styles.activityItemTitle,
                            { color: theme.colors.textPrimary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.activityItemSubtitle,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.author || 'Autor no informado'}
                          {' · '}
                          {new Date(item.date).toLocaleDateString('es-AR')}
                          {item.level ? ` · ${item.level}` : ''}
                        </Text>
                      </View>
                      <SymbolView
                        name={{
                          ios: 'chevron.right',
                          android: 'chevron_right',
                          web: 'chevron_right',
                        }}
                        size={16}
                        tintColor={theme.colors.textSecondary}
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Acciones sobre el área seleccionada */}
            <View style={styles.modalActionsContainer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nueva observación en este punto"
                onPress={() => {
                  if (!isAuthenticated) {
                    setSelectedArea(null);
                    setTrafficLocation(null);
                    setShowReportLogin(true);
                    return;
                  }
                  const lat = selectedArea.latitude;
                  const lon = selectedArea.longitude;
                  setSelectedArea(null);
                  setTrafficLocation(null);
                  router.push({
                    pathname: "/(tabs)/mapa/observacion/cargar-observacion",
                    params: {
                      lat: lat.toString(),
                      lon: lon.toString(),
                    },
                  } as never);
                }}
                style={({ pressed }) => [
                  styles.modalActionButton,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <SymbolView
                  name={{
                    ios: "binoculars.fill",
                    android: "visibility",
                    web: "visibility",
                  }}
                  size={18}
                  tintColor={theme.colors.textInverse}
                />
                <Text
                  style={[
                    styles.modalActionButtonText,
                    { color: theme.colors.textInverse },
                  ]}
                >
                  Nueva observación
                </Text>
              </Pressable>

              {hasRole(["observador_experto", "administrador"]) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Nuevo reporte de análisis en este punto"
                  onPress={() => {
                    const lat = selectedArea.latitude;
                    const lon = selectedArea.longitude;
                    const meteo = meteorologyQuery.data;
                    setSelectedArea(null);
                    setTrafficLocation(null);
                    router.push({
                      pathname: "/(tabs)/mapa/analisis/cargar-analisis",
                      params: {
                        lat: lat.toString(),
                        lon: lon.toString(),
                        ...(meteo
                          ? {
                              meteoId: meteo.id.toString(),
                              temp:
                                meteo.temperatura != null
                                  ? meteo.temperatura.toString()
                                  : undefined,
                              windSpeed:
                                meteo.velocidad_viento != null
                                  ? meteo.velocidad_viento.toString()
                                  : undefined,
                              windDir: meteo.direccion_viento ?? undefined,
                              snowDepth:
                                meteo.espesor_nieve != null
                                  ? meteo.espesor_nieve.toString()
                                  : undefined,
                              freshSnow:
                                meteo.nieve_fresca != null
                                  ? meteo.nieve_fresca.toString()
                                  : undefined,
                            }
                          : {}),
                      },
                    } as never);
                  }}
                  style={({ pressed }) => [
                    styles.modalActionButton,
                    {
                      backgroundColor: theme.colors.surfaceSecondary,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: "doc.badge.plus",
                      android: "post_add",
                      web: "post_add",
                    }}
                    size={18}
                    tintColor={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.modalActionButtonText,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Nuevo reporte
                  </Text>
                </Pressable>
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

  trafficBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  trafficBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },

  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },

  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  categoryChipText: {
    fontSize: 13,
  },

  emptyActivityContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },

  emptyActivityText: {
    fontSize: 13,
    fontStyle: "italic",
  },

  activityItemList: {
    gap: 6,
    marginTop: 2,
  },

  activityItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  activityItemDot: {
    width: 10,
    height: 10,
  },

  activityItemTextContainer: {
    flex: 1,
  },

  activityItemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },

  activityItemSubtitle: {
    fontSize: 11,
    marginTop: 2,
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

  weatherWidgetContainer: {
    position: "absolute",
    left: 12,
    zIndex: 4,
    maxWidth: 290,
  },

  weatherWidgetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  weatherWidgetDate: {
    fontSize: 13,
    fontWeight: "700",
  },

  weatherWidgetTemp: {
    fontSize: 13,
    fontWeight: "700",
  },

  weatherExpandedCard: {
    marginTop: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },

  weatherExpandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weatherExpandedHeaderLeft: {
    gap: 2,
  },

  weatherExpandedTemp: {
    fontSize: 24,
    fontWeight: "800",
  },

  weatherExpandedDate: {
    fontSize: 12,
  },

  weatherCloseButton: {
    padding: 6,
    borderRadius: 12,
  },

  weatherLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },

  weatherExpandedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  weatherExpandedFooter: {
    fontSize: 11,
    marginTop: 2,
  },

  modalActionsContainer: {
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },

  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  modalActionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
