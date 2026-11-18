import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { DateRangePicker, AppTimePicker } from "../../components/forms";
import { MoreOptionsButton } from "../../components/navigation/MoreOptionsButton";
import { MapContainer } from "../../components/map/MapContainer";
import { useCreateOuting } from "../../queries/outings.queries";
import { useTheme } from "../../theme/useTheme";

const dateLabel = (date: Date) =>
  date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
const timeLabel = (date: Date) =>
  date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
function initialTime(hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, minute, 0, 0);
  return date;
}
function mergeDate(date: Date, time: Date) {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

export function PlanningScreen() {
  const { theme } = useTheme();
  const createOutingMutation = useCreateOuting();

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [departure, setDeparture] = useState(() => initialTime(8));
  const [returnDate, setReturnDate] = useState(() => initialTime(16, 30));
  const [companions, setCompanions] = useState(0);
  const [editor, setEditor] = useState<
    "location" | "schedule" | "group" | "review" | null
  >(null);
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveConfirmation, setSaveConfirmation] = useState<string | null>(null);

  const invalidDates = returnDate <= departure;
  const primaryText = { color: theme.colors.textPrimary };
  const secondaryText = { color: theme.colors.textSecondary };
  const surface = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  };

  function handleCreateOuting() {
    if (createOutingMutation.isPending) return;
    setSaveError(null);
    setSaveConfirmation(null);
    if (!coordinates) {
      setSaveError('Seleccioná una ubicación para planificar la salida.');
      return;
    }
    if (invalidDates) {
      setSaveError('El regreso debe ser posterior a la salida.');
      return;
    }

    createOutingMutation.mutate(
      {
        coordenadas: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },

        fecha_hora_inicio: departure.toISOString(),
        fecha_hora_retorno: returnDate.toISOString(),
        cantidad_acompanantes: companions,

        itinerario_descripcion:
          "Salida planificada desde la ubicación seleccionada.",
      },

      {
        onSuccess: () => {
          setSaveConfirmation(`Salida registrada: ${companions + 1} personas. Se contabiliza en el mapa durante el horario de la salida, dentro de un radio de 500 m de la ubicación seleccionada.`);

          reset();
        },

        onError: () => {
          setSaveError('No se pudo registrar. Verificá tu conexión y que hayas iniciado sesión para registrar una salida.');
        },
      },
    );
  }

  function reset() {
    setCoordinates(null);
    setDeparture(initialTime(8));
    setReturnDate(initialTime(16, 30));
    setCompanions(0);
    setShowErrors(false);
    setEditor(null);
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerTitle}>
          <SymbolView
            name={{
              ios: "point.topleft.down.to.point.bottomright.curvepath",
              android: "route",
              web: "route",
            }}
            size={23}
            tintColor={theme.colors.primary}
          />
          <Text accessibilityRole="header" style={[styles.title, primaryText]}>
            Planificar salida
          </Text>
        </View>

        <MoreOptionsButton />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {saveConfirmation && <View style={[styles.card, surface]}>
          <Text accessibilityRole="alert" style={primaryText}>{saveConfirmation}</Text>
          <Pressable accessibilityRole="button" onPress={() => setSaveConfirmation(null)} style={{ paddingVertical: 10 }}>
            <Text style={{ color: theme.colors.primary }}>Entendido</Text>
          </Pressable>
        </View>}
        <View style={[styles.card, surface]}>
          <Text style={[styles.sectionTitle, primaryText]}>
            Declaración de itinerario
          </Text>
          <PlanningRow
            label="Ubicación"
            value={
              coordinates
                ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                : "Seleccionar ubicación"
            }
            icon={{
              ios: "mappin.and.ellipse",
              android: "location_on",
              web: "location_on",
            }}
            onPress={() => setEditor("location")}
          />

          {showErrors && !coordinates ? (
            <Text style={{ color: theme.colors.danger }}>
              Seleccioná una ubicación.
            </Text>
          ) : null}
          <PlanningRow
            label="Salida / regreso"
            value={`${timeLabel(departure)} – ${timeLabel(returnDate)}`}
            detail={`${dateLabel(departure)} → ${dateLabel(returnDate)}`}
            icon={{ ios: "clock", android: "schedule", web: "schedule" }}
            onPress={() => setEditor("schedule")}
          />
          {showErrors && invalidDates ? (
            <Text style={{ color: theme.colors.danger }}>
              El regreso debe ser posterior a la salida.
            </Text>
          ) : null}
          <PlanningRow
            label="Compañeros"
            value={
              companions === 0
                ? "Voy solo/a"
                : `${companions} ${companions === 1 ? "acompañante" : "acompañantes"}`
            }
            detail={`${companions + 1} ${companions === 0 ? "persona" : "personas"} en total`}
            icon={{ ios: "person.2", android: "group", web: "group" }}
            onPress={() => setEditor("group")}
          />
        </View>

        <View
          style={[
            styles.notice,
            {
              borderColor: theme.colors.warning,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: "exclamationmark.circle",
              android: "info",
              web: "info",
            }}
            size={20}
            tintColor={theme.colors.warning}
          />
          <Text style={[styles.noticeText, primaryText]}>
            Consultá el boletín y las condiciones del manto antes de salir. El
            peligro del área seleccionada aún no está disponible en esta vista.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setShowErrors(true);
            if (coordinates && !invalidDates) setEditor("review");
          }}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <SymbolView
            name={{
              ios: "checklist",
              android: "fact_check",
              web: "fact_check",
            }}
            size={20}
            tintColor={theme.colors.textInverse}
          />
          <Text
            style={[styles.buttonText, { color: theme.colors.textInverse }]}
          >
            Revisar salida
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={reset}
          style={({ pressed }) => [
            styles.cancel,
            surface,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <SymbolView
            name={{ ios: "xmark", android: "close", web: "close" }}
            size={18}
            tintColor={theme.colors.textSecondary}
          />
          <Text style={[styles.buttonText, secondaryText]}>
            Cancelar planificación
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={editor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditor(null)}
      >
        <View style={styles.scrim}>
          <SafeAreaView edges={["bottom"]} style={[styles.sheet, surface]}>
            <View style={styles.sheetHeader}>
              <Text
                accessibilityRole="header"
                style={[styles.sheetTitle, primaryText]}
              >
                {editor === "location"
                  ? "Elegir ubicación"
                  : editor === "schedule"
                    ? "Salida y regreso"
                    : editor === "group"
                      ? "Tu grupo"
                      : "Revisar itinerario"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setEditor(null)}
                style={[styles.close, surface]}
              >
                <SymbolView
                  name={{ ios: "xmark", android: "close", web: "close" }}
                  size={20}
                  tintColor={theme.colors.textPrimary}
                />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.editorContent}>
              {editor === "location" ? (
                <>
                  <Text style={[theme.typography.bodySmall, secondaryText]}>
                    Seleccioná la ubicación de la salida.
                  </Text>

                  <View
                    style={[
                      styles.locationCard,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {coordinates ? (
                      <>
                        <Text style={[styles.sectionTitle, primaryText]}>
                          {" "}
                          Ubicación seleccionada
                        </Text>

                        <Text style={secondaryText}>
                          Latitud: {coordinates.latitude.toFixed(5)}
                        </Text>

                        <Text style={secondaryText}>
                          Longitud: {coordinates.longitude.toFixed(5)}
                        </Text>
                      </>
                    ) : (
                      <Text style={secondaryText}>
                        Todavía no seleccionaste una ubicación.
                      </Text>
                    )}
                  </View>

                  {/* <Text style={[styles.prototypeNote, secondaryText]}> */}
                    <View
                      style={{
                        height: 360,
                        borderRadius: 16,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <MapContainer
                        mapStyle="terrain"
                        userLocation={null}
                        zoomControlTop={16}
                        showRiskZones={false}
                        selectedLocation={coordinates}
                        onMapPress={(coordinate) =>
                          setCoordinates({
                            latitude: coordinate[1],
                            longitude: coordinate[0],
                          })
                        }
                      />
                    </View>

                    <Text style={[theme.typography.bodySmall, secondaryText]}>
                      Tocá el mapa para marcar el punto de partida. Podés mover
                      el marcador seleccionando otra ubicación.
                    </Text>
                  {/* </Text> */}
                </>
              ) : null}
              {editor === "schedule" ? (
                <>
                  <DateRangePicker
                    startDate={departure}
                    endDate={returnDate}
                    onStartDateChange={(date) =>
                      setDeparture(mergeDate(date, departure))
                    }
                    onEndDateChange={(date) =>
                      setReturnDate(mergeDate(date, returnDate))
                    }
                  />
                  <AppTimePicker
                    label="Hora de salida"
                    value={departure}
                    onChange={(time) =>
                      setDeparture(mergeDate(departure, time))
                    }
                  />
                  <AppTimePicker
                    label="Hora de regreso"
                    value={returnDate}
                    onChange={(time) =>
                      setReturnDate(mergeDate(returnDate, time))
                    }
                    error={
                      invalidDates
                        ? "El regreso debe ser posterior a la salida."
                        : undefined
                    }
                  />
                </>
              ) : null}
              {editor === "group" ? (
                <>
                  <View
                    style={[
                      styles.groupCard,
                      {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={styles.groupHeading}>
                      <SymbolView
                        name={{
                          ios: "person.2",
                          android: "group",
                          web: "group",
                        }}
                        size={22}
                        tintColor={theme.colors.primary}
                      />
                      <Text style={[styles.sectionTitle, primaryText]}>
                        Acompañantes
                      </Text>
                    </View>
                    <View style={styles.counter}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quitar acompañante"
                        accessibilityState={{ disabled: companions === 0 }}
                        disabled={companions === 0}
                        onPress={() => setCompanions((count) => count - 1)}
                        style={({ pressed }) => [
                          styles.counterButton,
                          surface,
                          {
                            opacity:
                              companions === 0 ? 0.35 : pressed ? 0.65 : 1,
                          },
                        ]}
                      >
                        <SymbolView
                          name={{
                            ios: "minus",
                            android: "remove",
                            web: "remove",
                          }}
                          size={23}
                          tintColor={theme.colors.textPrimary}
                        />
                      </Pressable>
                      <View style={styles.counterValue}>
                        <Text
                          accessibilityLiveRegion="polite"
                          style={[styles.counterNumber, primaryText]}
                        >
                          {companions}
                        </Text>
                        <Text style={[styles.detail, secondaryText]}>
                          {companions === 1 ? "acompañante" : "acompañantes"}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Agregar acompañante"
                        onPress={() => setCompanions((count) => count + 1)}
                        style={({ pressed }) => [
                          styles.counterButton,
                          {
                            backgroundColor: theme.colors.primarySoft,
                            borderColor: theme.colors.primary,
                            opacity: pressed ? 0.65 : 1,
                          },
                        ]}
                      >
                        <SymbolView
                          name={{ ios: "plus", android: "add", web: "add" }}
                          size={23}
                          tintColor={theme.colors.primary}
                        />
                      </Pressable>
                    </View>
                    <View
                      style={[
                        styles.groupSummary,
                        { borderTopColor: theme.colors.border },
                      ]}
                    >
                      <Text style={secondaryText}>Total del grupo</Text>
                      <Text style={[styles.value, primaryText]}>
                        {companions + 1}{" "}
                        {companions === 0 ? "persona" : "personas"}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
              {editor === "review" ? (
                <>
                  <Text style={[styles.sectionTitle, primaryText]}>
                    Ubicación seleccionada
                  </Text>

                  <Text style={secondaryText}>
                    {coordinates
                      ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
                      : "Sin ubicación"}
                  </Text>
                  <Text style={secondaryText}>
                    Salida: {dateLabel(departure)} · {timeLabel(departure)}
                  </Text>
                  <Text style={secondaryText}>
                    Regreso: {dateLabel(returnDate)} · {timeLabel(returnDate)}
                  </Text>
                  <Text style={secondaryText}>
                    {companions + 1} personas en total (vos + {companions})
                  </Text>
                  <Text style={[styles.noticeText, secondaryText]}>
                    Las salidas se registran en el sistema. Solo se contabilizan
                    en el mapa cuando se encuentran en curso.
                  </Text>
                  {saveError && <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{saveError}</Text>}

                  <Pressable
                    accessibilityRole="button"
                    disabled={createOutingMutation.isPending}
                    onPress={handleCreateOuting}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                        opacity: createOutingMutation.isPending
                          ? 0.6
                          : pressed
                            ? 0.75
                            : 1,
                      },
                    ]}
                  >
                    {createOutingMutation.isPending ? (
                      <ActivityIndicator color={theme.colors.textInverse} />
                    ) : (
                      <SymbolView
                        name={{
                          ios: "checkmark.circle",
                          android: "check_circle",
                          web: "check_circle",
                        }}
                        size={20}
                        tintColor={theme.colors.textInverse}
                      />
                    )}

                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.colors.textInverse },
                      ]}
                    >
                      {createOutingMutation.isPending
                        ? "Registrando..."
                        : "Confirmar y registrar salida"}
                    </Text>
                  </Pressable>
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={editor === "location" && !coordinates}
                onPress={() => setEditor(null)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                    opacity:
                      editor === "location" && !coordinates
                        ? 0.45
                        : pressed
                          ? 0.75
                          : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.textInverse },
                  ]}
                >
                  {editor === "review"
                    ? "Volver a editar"
                    : editor === "location"
                      ? "Usar esta ubicación"
                      : "Listo"}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PlanningRow({
  label,
  value,
  detail,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: SymbolViewProps["name"];
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}${detail ? `, ${detail}` : ""}. Editar`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <SymbolView name={icon} size={19} tintColor={theme.colors.primary} />
      <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={styles.rowValue}>
        <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
          {value}
        </Text>
        {detail ? (
          <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>
            {detail}
          </Text>
        ) : null}
      </View>
      <SymbolView
        name={{
          ios: "chevron.right",
          android: "chevron_right",
          web: "chevron_right",
        }}
        size={14}
        tintColor={theme.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "700" },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 13,
    minHeight: 56,
  },
  rowLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    flexShrink: 1,
    letterSpacing: 0.3,
  },
  rowValue: { flex: 1, alignItems: "flex-end", gap: 3 },
  value: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  detail: { fontSize: 11, textAlign: "right" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    gap: 10,
  },
  noticeText: { flexShrink: 1, fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 14, fontWeight: "700" },
  cancel: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  prototypeNote: { fontSize: 12, lineHeight: 18, textAlign: "center" },
  scrim: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 12,
  },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: "700" },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editorContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  groupCard: { padding: 18, borderWidth: 1, borderRadius: 18, gap: 20 },
  groupHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  groupSummary: {
    borderTopWidth: 1,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  locationCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 8,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  counterValue: { flex: 1, alignItems: "center", gap: 4 },
  counterButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  counterNumber: {
    fontSize: 36,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  center: { textAlign: "center" },
});
