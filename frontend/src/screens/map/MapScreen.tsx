import { useCallback, useMemo, useState } from "react";

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
import { MapContainer } from "../../components/map/MapContainer";
import { MapLayersSheet } from "../../components/map/MapLayersSheet";
import { MoreOptionsButton } from "../../components/navigation/MoreOptionsButton";
import { AppBottomSheet } from "../../components/ui/AppBottomSheet";

import { useLocation } from "../../hooks/useLocation";
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

  const [focusBounds, setFocusBounds] =
    useState<[number, number, number, number]>();

  const [mapStyle, setMapStyle] =
    useState<"street" | "terrain">("terrain");

  const [showLayers, setShowLayers] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

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

  const [locationNoticeDismissed, setLocationNoticeDismissed] =
    useState(false);

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
    selectedArea
      ? {
          latitude: selectedArea.latitude,
          longitude: selectedArea.longitude,
          radiusKm: selectedArea.radius / 1000,
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

      setSelectedArea({
        latitude,
        longitude,
        radius: 500,
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
          onMapPress={handleMapPress}
          userLocation={userLocation}
          zoomControlTop={insets.top + 64}
          zoomControlBottom={zoomControlBottom}
        />
      </View>

      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={styles.overlay}
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

        <MoreOptionsButton />
      </SafeAreaView>

      <View
        style={[
          styles.mapControls,
          { bottom: zoomControlBottom + 114 },
        ]}
      >
        <MapControl
          label="Mi cuenta"
          icon={{
            ios: "person.crop.circle",
            android: "account_circle",
            web: "account_circle",
          }}
          active={showAccount}
          onPress={() => {
            Keyboard.dismiss();
            setShowAccount(true);
          }}
        />

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
          onPress={() =>
            router.push(
              "/(tabs)/mapa/observacion/cargar-observacion" as never,
            )
          }
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

              {trafficQuery.isSuccess && (
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
    zIndex: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 12,
    paddingTop: 8,
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