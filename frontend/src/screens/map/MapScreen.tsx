import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useTrafficByZone } from "../../queries/outings.queries";
import { LoginGateModal } from "../../components/auth/LoginGateModal";
import { zonesGeoJSON } from "../../mocks/zones.mock";
import { useNetwork } from "../../network/NetworkContext";
import { useTheme } from "../../theme/useTheme";
import { MapContainer } from "../../components/map/MapContainer";
import { useLocation } from "../../hooks/useLocation";
import { getZoneColor, getZoneCenter, type ZoneFeature } from "./zoneMap.types";

export function MapScreen() {
  const { theme } = useTheme();
  const { status: networkStatus } = useNetwork();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showLogin, setShowLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(null); //selecciona la zona para que aparezca en el modal

  const trafficCoordinates = useMemo(() => {
    return selectedZone ? getZoneCenter(selectedZone) : null;
  }, [selectedZone]);

  const trafficQuery = useTrafficByZone(
    trafficCoordinates
      ? {
          latitude: trafficCoordinates.latitude,
          longitude: trafficCoordinates.longitude,
          radiusKm: 5,
        }
      : null,
  );

  const features = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return zonesGeoJSON.features.filter((feature) =>
      feature.properties.name.toLocaleLowerCase().includes(query),
    );
  }, [search]);

  function selectSearchResult(feature: ZoneFeature) {
    const coordinates = feature.geometry.coordinates.flat();
    const longitudes = coordinates.map(([longitude]) => longitude);
    const latitudes = coordinates.map(([, latitude]) => latitude);
    setFocusBounds([
      Math.min(...longitudes),
      Math.min(...latitudes),
      Math.max(...longitudes),
      Math.max(...latitudes),
    ]);
    setSearch(feature.properties.name);
    setSearchOpen(false);
    Keyboard.dismiss();
  }

  const handleZonePress = useCallback((zonaId: string) => {
    console.log("ZONA SELECCIONADA:", zonaId);
    Keyboard.dismiss();

    const zone = zonesGeoJSON.features.find(
      (feature) => feature.properties.id === zonaId,
    );

    if (zone) {
      setSelectedZone(zone);
    }
    //router.push({ pathname: '/mapa/zona/[zonaId]', params: { zonaId } });
  }, []); //[router]

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
      <LoginGateModal
        visible
        onDismiss={() => setShowLogin(false)}
      />
    ) : null}
      <View style={StyleSheet.absoluteFill}>
        <MapContainer
          key={mapResetVersion}
          features={zonesGeoJSON.features}
          focusBounds={focusBounds}
          mapStyle={mapStyle}
          onZonePress={handleZonePress}
          userLocation={userLocation}
          zoomControlTop={insets.top + 169}
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
          <View style={styles.searchRow}>
            <SymbolView
              name={{
                ios: "magnifyingglass",
                android: "search",
                web: "search",
              }}
              tintColor={theme.colors.textMuted}
              size={20}
            />
            <TextInput
              accessibilityLabel="Buscar zona"
              value={search}
              onChangeText={(value) => {
                setSearch(value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onSubmitEditing={() => {
                if (features.length === 1) selectSearchResult(features[0]);
              }}
              placeholder="Buscar zona"
              placeholderTextColor={theme.colors.inputPlaceholder}
              returnKeyType="search"
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            />
            {search.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Borrar búsqueda"
                hitSlop={8}
                onPress={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
              >
                <Text style={{ color: theme.colors.textPrimary, fontSize: 24 }}>
                  ×
                </Text>
              </Pressable>
            )}
            <Pressable
              accessibilityLabel="Iniciar sesión"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                Keyboard.dismiss();
                setShowLogin(true);
              }}
              style={styles.accountButton}
            >
              <SymbolView
                name={{
                  ios: "person.crop.circle",
                  android: "account_circle",
                  web: "account_circle",
                }}
                tintColor={theme.colors.textSecondary}
                size={23}
              />
            </Pressable>
          </View>
          {searchOpen && search.trim().length > 0 && (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
            >
              {features.length === 0 ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: theme.colors.textSecondary,
                    paddingVertical: 12,
                  }}
                >
                  No se encontraron zonas
                </Text>
              ) : (
                features.map((feature) => (
                  <Pressable
                    key={feature.properties.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Centrar ${feature.properties.name}`}
                    onPress={() => selectSearchResult(feature)}
                    style={{ paddingVertical: 12, minHeight: 48 }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontWeight: "600",
                      }}
                    >
                      {feature.properties.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: getZoneColor(
                              feature.properties.riskLevel,
                              theme,
                            ),
                          },
                        ]}
                      />
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          textTransform: "capitalize",
                        }}
                      >
                        Riesgo {feature.properties.riskLevel}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}
          <View style={styles.locationHeading}>
            <Text
              numberOfLines={1}
              style={[styles.areaTitle, { color: theme.colors.textPrimary }]}
            >
              Zonas de Ushuaia
            </Text>
            <Text style={[styles.areaMeta, { color: theme.colors.textMuted }]}>
              {features.length} {features.length === 1 ? "zona" : "zonas"} · ©
              OpenStreetMap contributors
              {mapStyle === "terrain" ? " · © OpenTopoMap" : ""}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: theme.colors.warning },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Datos de ejemplo
              </Text>
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
              Este mapa contiene zonas y niveles de peligro ilustrativos. No es
              un pronóstico oficial ni debe usarse para tomar decisiones en
              terreno.
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
      {/* Panel inferior con información de la zona */}

      {/* Panel inferior con información de la zona */}
      <AppBottomSheet
        visible={selectedZone !== null}
        onClose={() => setSelectedZone(null)}
        title={selectedZone?.properties.name ?? "Información de la zona"}
      >
        {selectedZone && (
          <View style={styles.zoneDetails}>
            {/* Nivel de riesgo */}
            <View style={styles.zoneRiskContainer}>
              <Text
                style={[
                  styles.zoneLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Nivel de riesgo
              </Text>

              <View
                style={[
                  styles.zoneRiskBadge,
                  {
                    backgroundColor: getZoneColor(
                      selectedZone.properties.riskLevel,
                      theme,
                    ),
                  },
                ]}
              >
                <Text style={styles.zoneRiskText}>
                  {selectedZone.properties.riskLevel.toUpperCase()}
                </Text>
              </View>

              <Text
                style={[
                  styles.zoneDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Información ilustrativa de esta zona. Los niveles de riesgo
                mostrados corresponden a datos de ejemplo y no representan un
                pronóstico oficial.
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
});
