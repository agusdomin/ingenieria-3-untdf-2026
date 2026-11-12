
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppImagePicker, AppSelect, AppTextArea } from '../../components/forms';
import { AppBottomSheet } from '../../components/dialogs/AppBottomSheet';
import { WizardHeader } from '../../components/navigation/WizardHeader';
import { MapContainer } from '../../components/map/MapContainer';
import { zonesGeoJSON } from '../../mocks/zones.mock';
import { useTheme } from '../../theme/useTheme';
import { useRouter } from 'expo-router';
import { ConfirmationView } from '../../components/feedback/ConfirmationView';

type Coordinate = [number, number];


const observationTypes = [
  { label: 'Condiciones de nieve', value: 'condiciones_nieve' },
  { label: 'Indicios de avalanchas', value: 'indicios_avalancha' },
  { label: 'Condiciones del terreno', value: 'condiciones_terreno' },
  { label: 'Otro', value: 'otro' },
];

const relevanceOptions = [
  {
    label: 'Informativa',
    value: 'informativa',
    description: 'Información general sobre el entorno.',
  },
  {
    label: 'Precaución',
    value: 'precaucion',
    description: 'Situación que merece atención.',
  },
  {
    label: 'Peligrosa',
    value: 'peligrosa',
    description: 'Situación que puede representar un peligro.',
  },
];

export function NewObservationScreen() {
  const { theme } = useTheme();
 const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relevance, setRelevance] = useState<string | null>('informativa');

  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleMapPress = useCallback((coordinates: Coordinate) => {
    setCoordinate(coordinates);
  }, []);

  const handleZonePress = useCallback((_zoneId: string) => {
    // La selección de zonas no forma parte de este formulario.
  }, []);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    } else {
      setShowExit(true);
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const canContinueFromStepOne = type.trim().length > 0;
  const canContinueFromStepTwo = coordinate !== null;

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {isConfirmed ? (
      <ConfirmationView
        title="Observación revisada"
        message="Revisaste los datos de tu observación. El envío todavía no está integrado: no se guardó ni se publicó."
        buttonLabel="Ver en Mapa"
        onAction={() => router.replace('/(tabs)/mapa' as never)}
      />
    ) : (
      <>
      <WizardHeader
        title="Nueva observación"
        currentStep={currentStep}
        totalSteps={3}
        onBack={handleBack}
      />

      {currentStep === 1 && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
            Información de la observación
          </Text>

          <AppSelect
            label="Tipo de observación"
            options={observationTypes}
            value={type}
            onChange={setType}
            placeholder="Seleccioná un tipo"
          />

          <AppSelect
            label="Nivel de relevancia"
            options={relevanceOptions.map(({ label, value }) => ({
              label,
              value,
            }))}
            value={relevance ?? ''}
            onChange={setRelevance}
            placeholder="Seleccioná la relevancia"
          />

          <AppTextArea
            label="Título"
            value={title}
            onChangeText={setTitle}
            placeholder="Ej. Acumulación de nieve en la ladera"
            maxLength={200}
            numberOfLines={2}
          />

          <AppTextArea
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            placeholder="Describí lo que observaste..."
            maxLength={500}
            numberOfLines={5}
          />

          <ActionButton
            label="Continuar"
            disabled={!canContinueFromStepOne}
            onPress={() => setCurrentStep(2)}
          />
        </ScrollView>
      )}

      {currentStep === 2 && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
            Ubicación y evidencia
          </Text>

          <Text style={{ color: theme.colors.textSecondary }}>
            Tocá el mapa para indicar dónde realizaste la observación.
          </Text>

          <View style={styles.mapContainer}>
            <MapContainer
              features={zonesGeoJSON.features}
              mapStyle="terrain"
              onZonePress={handleZonePress}
              userLocation={null}
              zoomControlTop={16}
              onMapPress={handleMapPress}
            />
          </View>

          <View
            style={[
              styles.coordinateBox,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={{ color: theme.colors.textSecondary }}>
              Ubicación seleccionada
            </Text>

            <Text style={{ color: theme.colors.textPrimary }}>
              {coordinate
                ? `Longitud: ${coordinate[0].toFixed(6)}\nLatitud: ${coordinate[1].toFixed(6)}`
                : 'Todavía no seleccionaste una ubicación.'}
            </Text>
          </View>

          <AppImagePicker
            label="Fotografía (opcional)"
            value={imageUri}
            onChange={setImageUri}
          />

          <ActionButton
            label="Continuar"
            disabled={!canContinueFromStepTwo}
            onPress={() => setCurrentStep(3)}
          />
        </ScrollView>
      )}

      {currentStep === 3 && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
            Revisar observación
          </Text>

          <SummaryRow label="Tipo" value={type} />
          <SummaryRow label="Título" value={title || 'Sin título'} />
          <SummaryRow
            label="Descripción"
            value={description || 'Sin descripción'}
          />
          <SummaryRow
            label="Relevancia"
            value={relevance ?? 'No especificada'}
          />
          <SummaryRow
            label="Coordenadas"
            value={
              coordinate
                ? `${coordinate[0].toFixed(6)}, ${coordinate[1].toFixed(6)}`
                : 'Sin ubicación'
            }
          />
          <SummaryRow
            label="Fotografía"
            value={imageUri ? 'Fotografía adjunta' : 'Sin fotografía'}
          />

          <ActionButton
            label="Confirmar observación"
            onPress={handleConfirm}
          />
        </ScrollView>
      )}

       </>
       )}
      <AppBottomSheet visible={showExit} onClose={() => setShowExit(false)} title="¿Salir de la observación?">
        <View style={styles.exitContent}>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Los datos de este formulario todavía no están guardados.</Text>
          <ActionButton label="Seguir editando" onPress={() => setShowExit(false)} />
          <Pressable accessibilityRole="button" onPress={() => {
            setShowExit(false);
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/mapa' as never);
          }} style={({ pressed }) => [styles.actionButton, { borderColor: theme.colors.danger, backgroundColor: theme.colors.surface, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[theme.typography.button, { color: theme.colors.danger }]}>Salir sin guardar</Text>
          </Pressable>
        </View>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.primary,
        },
      ]}
    >
      <Text style={[theme.typography.button, { color: theme.colors.textInverse }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.summaryRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.textSecondary, fontWeight: '600' }}>
        {label}
      </Text>
      <Text style={{ color: theme.colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
  },
  mapContainer: {
    height: 360,
    overflow: 'hidden',
    borderRadius: 14,
  },
  coordinateBox: {
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  summaryRow: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  exitContent: { gap: 14 },
});






















// import { useState } from 'react';
// import { ScrollView, StyleSheet, Text } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AppImagePicker } from '../../components/forms/AppImagePicker';
// import { useTheme } from '../../theme/useTheme';

// export function NewObservationScreen() {
//   const { theme } = useTheme();
//   const [imageUri, setImageUri] = useState<string | null>(null);
//   return (
//     <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
//       <ScrollView contentContainerStyle={styles.content}>
//         <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Reporte rápido recreativo</Text>
//         <AppImagePicker value={imageUri} onChange={setImageUri} />
//         <Text style={{ color: theme.colors.textSecondary }}>
//           {imageUri ? 'Foto adjunta. ' : ''}El reporte está en preparación. La foto se conserva solo mientras esta pantalla está abierta; todavía no se envía ni se guarda offline.
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1 },
//   content: { padding: 20, gap: 20, width: '100%', maxWidth: 560, alignSelf: 'center' },
//   title: { fontSize: 20, fontWeight: '700' },
// });
