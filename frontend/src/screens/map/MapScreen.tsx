import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
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
import { AppBottomSheet } from "../../components/dialogs/AppBottomSheet";
import { LoginGateModal } from "../../components/auth/LoginGateModal";
import { useNetwork } from "../../network/NetworkContext";
import { useTheme } from "../../theme/useTheme";
import { MapContainer } from "../../components/map/MapContainer";
import { useLocation } from "../../hooks/useLocation";
import { useCurrentMeteorology } from "../../queries/meteorology.queries";
import { useTrafficByArea } from "@/queries/outings.queries";

type SelectedArea = {
  latitude: number;
  longitude: number;
  radius: number;
};

export function MapScreen() {
  const { theme } = useTheme();
  const { status: networkStatus } = useNetwork();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showLogin, setShowLogin] = useState(false);
  const [focusBounds, setFocusBounds] =
    useState<[number, number, number, number]>();
  const [mapStyle, setMapStyle] = useState<"street" | "terrain">("terrain");
  const {
    latitude,
    longitude,
    loading: locating,
    error,
    isFallback,
    retry,
  } = useLocation();
  const [locationNoticeDismissed, setLocationNoticeDismissed] = useState(false);
  const [mapResetVersion, setMapResetVersion] = useState(0);
  const [bottomControlsHeight, setBottomControlsHeight] = useState(54);
  const userLocation = useMemo(
    () =>
      isFallback || latitude === null || longitude === null || locating
        ? null
        : { latitude, longitude },
    [latitude, longitude, locating, isFallback],
  );
  const locationMessage = !locating ? error : null;
  const [showSafetyNotice, setShowSafetyNotice] = useState(false);
  const [selectedArea, setSelectedArea] =
  useState<SelectedArea | null>(null);

 

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
    // Reiniciar la cámara también cuando no hay una posición real que la recentre.
    setMapResetVersion((version) => version + 1);
  }, [retry]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {showLogin ? (
        <LoginGateModal visible onDismiss={() => setShowLogin(false)} />
      ) : null}
      <View style={StyleSheet.absoluteFill}>
        <MapContainer
  key={mapResetVersion}
  focusBounds={focusBounds}
  mapStyle={mapStyle}
  userLocation={userLocation}
  zoomControlTop={insets.top + 169}
  onMapPress={handleMapPress}
/>
      </View>

      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={styles.overlay}
      >
        <View
          style={[
            styles.topPanel,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.locationHeading}>
  <Text
    numberOfLines={1}
    style={[
      styles.areaTitle,
      { color: theme.colors.textPrimary },
    ]}
  >
    Mapa de Ushuaia
  </Text>

  <Text
    style={[
      styles.areaMeta,
      { color: theme.colors.textMuted },
    ]}
  >
    Tocá un punto del mapa para consultar el área
  </Text>
</View>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
            >
          
  
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      networkStatus === "online"
                        ? theme.colors.success
                        : networkStatus === "offline"
                          ? theme.colors.warning
                          : theme.colors.textMuted,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {networkStatus === "online"
                  ? "En línea"
                  : networkStatus === "offline"
                    ? "Sin conexión"
                    : "Comprobando red"}
              </Text>
            </View>
          </View>
        </View>

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
      </SafeAreaView>

      <View style={[styles.mapControls, { top: insets.top + 63 }]}>
        <MapControl
          label={
            mapStyle === "terrain"
              ? "Cambiar a mapa callejero"
              : "Cambiar a mapa topográfico"
          }
          icon={
            mapStyle === "terrain"
              ? { ios: "square.3.layers.3d", android: "layers", web: "layers" }
              : { ios: "mountain.2", android: "terrain", web: "terrain" }
          }
          active={mapStyle === "terrain"}
          onPress={() =>
            setMapStyle((style) => (style === "terrain" ? "street" : "terrain"))
          }
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
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <SymbolView
              name={{
                ios: "location.north.fill",
                android: "my_location",
                web: "my_location",
              }}
              tintColor={
                userLocation ? theme.colors.primary : theme.colors.textPrimary
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
              bottom:
                (Platform.OS === "web" ? 12 : 10) + bottomControlsHeight + 12,
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
            onPress={() => setLocationNoticeDismissed(true)}
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
              name={{ ios: "xmark", android: "close", web: "close" }}
              size={16.5}
              tintColor={theme.colors.primary}
            />
          </Pressable>
        </View>
      )}

      <View
        pointerEvents="box-none"
        onLayout={(event) =>
          setBottomControlsHeight(event.nativeEvent.layout.height)
        }
        style={[
          styles.bottomOverlay,
          { bottom: Platform.OS === "web" ? 12 : 10 },
        ]}
      >
        <View
          style={[
            styles.legend,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {[
            { label: "Bajo", color: theme.risk.bajo },
            { label: "Considerable", color: theme.risk.considerable },
            { label: "Alto", color: theme.risk.alto },
          ].map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: item.color }]}
              />
              <Text
                style={[
                  styles.legendLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear reporte"
          onPress={() =>
            router.push("/(tabs)/mapa/observacion/cargar-observacion" as never)
          }
          style={({ pressed }) => [
            styles.reportButton,
            { backgroundColor: theme.colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <SymbolView
            name={{ ios: "plus", android: "add", web: "add" }}
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

      <Modal
        animationType="fade"
        transparent
        visible={showSafetyNotice}
        onRequestClose={() => setShowSafetyNotice(false)}
      >
        <View
          style={[
            styles.noticeBackdrop,
            { backgroundColor: theme.colors.overlay },
          ]}
        >
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.noticeIcon,
                { backgroundColor: `${theme.colors.danger}22` },
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
              style={[styles.noticeTitle, { color: theme.colors.textPrimary }]}
            >
              Antes de salir
            </Text>
            <Text
              style={[styles.noticeBody, { color: theme.colors.textSecondary }]}
            >
              La información mostrada en el mapa es orientativa.
  Consultá los reportes y boletines disponibles antes de
  tomar decisiones en terreno.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowSafetyNotice(false)}
              style={[
                styles.noticeAction,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.noticeActionText,
                  { color: theme.colors.textInverse },
                ]}
              >
                Entendido
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Panel inferior con información del area */}

     
      <AppBottomSheet
        visible={selectedArea !== null}
        onClose={() => setSelectedArea(null)}
        title="Área seleccionada"  >
        {selectedArea && (
          <View style={styles.zoneDetails}>
            <View style={styles.zoneRiskContainer}>
              <Text
                style={[
                  styles.zoneLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
               Coordenadas
              </Text>
        <Text
          style={{
           color: theme.colors.textPrimary,
            fontWeight: "600",
        }}
      >
        {selectedArea.latitude.toFixed(5)},{" "}
        {selectedArea.longitude.toFixed(5)}
      </Text>

      <Text
        style={[
          styles.zoneLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        Radio
      </Text>

      <Text style={{ color: theme.colors.textPrimary }}>
        {selectedArea.radius} m
      </Text>
              
            </View>

            {/* Tránsito de personas */}
            <View style={styles.zoneTrafficContainer}>
              <Text
                style={[
                  styles.zoneLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Personas en salidas registradas
              </Text>

              {trafficQuery.isLoading && (
                <View style={styles.zoneTrafficLoading}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.zoneTrafficDescription,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Consultando tránsito...
                  </Text>
                </View>
              )}

              {trafficQuery.isError && (
                <Text
                  style={[
                    styles.zoneTrafficDescription,
                    { color: theme.colors.danger },
                  ]}
                >
                  No se pudo obtener la información de tránsito.
                </Text>
              )}

              {trafficQuery.isSuccess && (
                <>
                  <Text
                    style={[
                      styles.zoneTrafficValue,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {trafficQuery.data.total_personas}
                  </Text>

                  <Text
                    style={[
                      styles.zoneTrafficDescription,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Personas asociadas a salidas en curso dentro de un radio de{" "}
                    {trafficQuery.data.radio_km} km.
                  </Text>
                </>
              )}
            </View>

            {/* Información meteorológica */}
            <View style={styles.zoneWeatherContainer}>
              <Text style={styles.zoneWeatherTitle}>
                Condiciones meteorológicas
              </Text>

              {meteorologyQuery.isLoading && (
                <View style={styles.zoneTrafficLoading}>
                  <ActivityIndicator size="small" />
                  <Text>Consultando condiciones meteorológicas...</Text>
                </View>
              )}

              {meteorologyQuery.isError && (
                <Text style={styles.zoneWeatherError}>
                  No se pudo obtener la información meteorológica. Intentá
                  nuevamente más tarde.
                </Text>
              )}
              {/* DATOS METEREOLOGICOS DEl AREA */}
              {meteorologyQuery.isSuccess && (
                <>
                  <View style={styles.zoneWeatherMain}>
                    <Text style={styles.zoneWeatherTemperature}>
                      {meteorologyQuery.data.temperatura != null
                        ? `${meteorologyQuery.data.temperatura} °C`
                        : "—"}
                    </Text>

                    <Text style={styles.zoneWeatherDescription}>
                      Temperatura actual
                    </Text>
                  </View>

                  <View style={styles.zoneWeatherGrid}>
                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>Viento</Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.velocidad_viento ?? "—"} km/h
                      </Text>
                      <Text style={styles.zoneWeatherDetail}>
                        {meteorologyQuery.data.direccion_viento ?? "Sin datos"}
                      </Text>
                    </View>

                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>Ráfagas</Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.rafaga ?? "—"} km/h
                      </Text>
                    </View>

                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>
                        Precipitaciones
                      </Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.precipitaciones ?? "—"} mm
                      </Text>
                    </View>

                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>Humedad</Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.humedad ?? "—"} %
                      </Text>
                    </View>

                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>Nieve fresca</Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.nieve_fresca ?? "—"} cm
                      </Text>
                    </View>

                    <View style={styles.zoneWeatherItem}>
                      <Text style={styles.zoneWeatherLabel}>
                        Espesor de nieve
                      </Text>
                      <Text style={styles.zoneWeatherValue}>
                        {meteorologyQuery.data.espesor_nieve ?? "—"} cm
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.zoneWeatherUpdated}>
                    Actualizado:{" "}
                    {new Date(meteorologyQuery.data.fecha_hora).toLocaleString(
                      "es-AR",
                    )}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </AppBottomSheet>
    </View>
  );
}

interface MapControlProps {
  label: string;
  icon: SymbolViewProps["name"];
  active?: boolean;
  onPress: () => void;
}

function MapControl({ label, icon, active, onPress }: MapControlProps) {
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
        active && { borderColor: theme.colors.primary },
        pressed && styles.pressed,
      ]}
    >
      <SymbolView
        name={icon}
        tintColor={active ? theme.colors.primary : theme.colors.textPrimary}
        size={21}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: "hidden" },
  overlay: {
    zIndex: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  topPanel: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 11,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 34,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 4,
  },
  accountButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  locationHeading: { gap: 1 },
  areaTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  areaMeta: { fontSize: 12 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  statusPill: {
    minHeight: 28,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
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
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  mapControls: { position: "absolute", right: 13, zIndex: 3, gap: 9 },
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
    shadowOffset: { width: 0, height: 3 },
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
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  locationNoticeText: { flex: 1, fontSize: 12, textAlign: "center" },
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
  legend: {
    maxWidth: "65%",
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 16,
    gap: 9,
    paddingHorizontal: 11,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, fontWeight: "600" },
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
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  reportButtonText: { fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
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
  noticeTitle: { fontSize: 21, fontWeight: "700" },
  noticeBody: { fontSize: 14, lineHeight: 21 },
  noticeAction: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  noticeActionText: { fontSize: 14, fontWeight: "700" },
  zoneDetails: {
    gap: 12,
  },

  zoneLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  zoneRiskBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  zoneRiskText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  zoneDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  zoneTrafficContainer: {
    gap: 8,
    marginTop: 8,
  },

  zoneTrafficLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  zoneTrafficValue: {
    fontSize: 28,
    fontWeight: "bold",
  },

  zoneTrafficDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  zoneRiskContainer: {
    gap: 10,
  },

zoneWeatherContainer: {
  gap: 12,
  marginTop: 12,
  paddingTop: 14,
  borderTopWidth: 1,
  borderTopColor: "#D1D5DB",
},

zoneWeatherTitle: {
  fontSize: 16,
  fontWeight: "700",
},

zoneWeatherMain: {
  gap: 2,
},

zoneWeatherTemperature: {
  fontSize: 30,
  fontWeight: "bold",
},

zoneWeatherDescription: {
  fontSize: 13,
  color: "#6B7280",
},

zoneWeatherGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
},

zoneWeatherItem: {
  width: "47%",
  gap: 3,
},

zoneWeatherLabel: {
  fontSize: 12,
  color: "#6B7280",
},

zoneWeatherValue: {
  fontSize: 15,
  fontWeight: "600",
},

zoneWeatherDetail: {
  fontSize: 12,
  color: "#6B7280",
},

zoneWeatherUpdated: {
  fontSize: 11,
  color: "#6B7280",
  marginTop: 4,
},

zoneWeatherError: {
  fontSize: 13,
  color: "#B91C1C",
  lineHeight: 19,
},

});
