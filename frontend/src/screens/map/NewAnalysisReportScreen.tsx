import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppBottomSheet } from '../../components/dialogs/AppBottomSheet';
import { ConfirmationView } from '../../components/feedback/ConfirmationView';
import { AppSelect } from '../../components/forms/AppSelect';
import { AppStepper } from '../../components/forms/AppStepper';
import { AppTextArea } from '../../components/forms/AppTextArea';
import { WizardHeader } from '../../components/navigation/WizardHeader';
import { AppButton } from '../../components/ui/AppButton';
import { AppInput } from '../../components/ui/AppInput';
import { useCreateReport } from '../../queries/reports.queries';
import { useTheme } from '../../theme/useTheme';
import type { CreateReportDTO } from '../../types/report';

const orientationOptions = [
  { label: 'Norte (N)', value: 'N' },
  { label: 'Noreste (NE)', value: 'NE' },
  { label: 'Este (E)', value: 'E' },
  { label: 'Sureste (SE)', value: 'SE' },
  { label: 'Sur (S)', value: 'S' },
  { label: 'Suroeste (SO)', value: 'SO' },
  { label: 'Oeste (O)', value: 'O' },
  { label: 'Noroeste (NO)', value: 'NO' },
];

const terrainShapeOptions = [
  { label: 'Plano', value: 'Plano' },
  { label: 'Convexo', value: 'Convexo' },
  { label: 'Cóncavo', value: 'Cóncavo' },
  { label: 'Uniforme / Recto', value: 'Uniforme' },
  { label: 'Ondulado / Quebrado', value: 'Ondulado' },
];

const skyOptions = [
  { label: 'Despejado (0/8)', value: 'Despejado' },
  { label: 'Poco nuboso (1-2/8)', value: 'Poco nuboso' },
  { label: 'Parcialmente nuboso (3-4/8)', value: 'Parcialmente nuboso' },
  { label: 'Mayormente nublado (5-7/8)', value: 'Mayormente nublado' },
  { label: 'Cubierto (8/8)', value: 'Cubierto' },
  { label: 'Niebla / Visibilidad reducida', value: 'Niebla' },
];

const precipitationOptions = [
  { label: 'Ninguna', value: 'Ninguna' },
  { label: 'Nieve continua', value: 'Nieve continua' },
  { label: 'Chubascos de nieve', value: 'Chubascos de nieve' },
  { label: 'Lluvia / Aguanieve', value: 'Lluvia / Aguanieve' },
  { label: 'Granizo / Graupel', value: 'Graupel' },
];

const snowHardnessOptions = [
  { label: 'Puño (F)', value: 'F' },
  { label: '4 Dedos (4F)', value: '4F' },
  { label: '1 Dedo (1F)', value: '1F' },
  { label: 'Lápiz (P)', value: 'P' },
  { label: 'Cuchillo (K)', value: 'K' },
  { label: 'Hielo (I)', value: 'I' },
];

const grainTypeOptions = [
  { label: 'Nieve recién caída (PP)', value: 'PP' },
  { label: 'Nieve descompuesta (DF)', value: 'DF' },
  { label: 'Granos redondeados (RG)', value: 'RG' },
  { label: 'Facetas / Caras planas (FC)', value: 'FC' },
  { label: 'Cubiletes / Vaso (DH)', value: 'DH' },
  { label: 'Escarcha de superficie (SH)', value: 'SH' },
  { label: 'Costra de rehielo / fusión (MF)', value: 'MF' },
];

const ctOptions = [
  { label: 'Sin fractura (CTN)', value: 'CTN' },
  { label: 'Fácil CT 1-10 (CTE)', value: 'CTE' },
  { label: 'Moderado CT 11-20 (CTM)', value: 'CTM' },
  { label: 'Difícil CT 21-30 (CTH)', value: 'CTH' },
];

const ectOptions = [
  { label: 'Sin propagación (ECTX)', value: 'ECTX' },
  { label: 'Propagación al golpear (ECTP)', value: 'ECTP' },
  { label: 'Fractura sin propagación (ECTN)', value: 'ECTN' },
];

const shearQualityOptions = [
  { label: 'Q1 - Cizalla limpia / repentina', value: 'Q1' },
  { label: 'Q2 - Deslizamiento moderado', value: 'Q2' },
  { label: 'Q3 - Deslizamiento irregular / áspero', value: 'Q3' },
];

const dangerLevelOptions = [
  { label: '1 - Bajo', value: '1 - Bajo' },
  { label: '2 - Moderado', value: '2 - Moderado' },
  { label: '3 - Notable / Considerable', value: '3 - Notable' },
  { label: '4 - Fuerte / Alto', value: '4 - Fuerte' },
  { label: '5 - Muy Fuerte', value: '5 - Muy Fuerte' },
];

function toOptionalFloat(val: string): number | undefined {
  if (!val || !val.trim()) return undefined;
  const normalized = val.trim().replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? undefined : num;
}

function toOptionalInt(val: string): number | undefined {
  if (!val || !val.trim()) return undefined;
  const normalized = val.trim().replace(',', '.');
  const num = parseInt(normalized, 10);
  return Number.isNaN(num) ? undefined : num;
}

export function NewAnalysisReportScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    lat?: string;
    lon?: string;
    meteoId?: string;
    temp?: string;
    windSpeed?: string;
    windDir?: string;
    snowDepth?: string;
    freshSnow?: string;
  }>();

  const { mutateAsync: createReport } = useCreateReport();

  const latitude = params.lat ? parseFloat(params.lat) : -54.807;
  const longitude = params.lon ? parseFloat(params.lon) : -68.307;
  const meteoId = params.meteoId ? parseInt(params.meteoId, 10) : undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [showExit, setShowExit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paso 1: Terreno y Clima Local
  const [ubicacionGps, setUbicacionGps] = useState(
    `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
  );
  const [altitud, setAltitud] = useState('');
  const [orientacionLadera, setOrientacionLadera] = useState('');
  const [inclinacionPendiente, setInclinacionPendiente] = useState('');
  const [formaDelTerreno, setFormaDelTerreno] = useState('');

  const [temperaturaAmbiente, setTemperaturaAmbiente] = useState(
    params.temp ?? ''
  );
  const [temperaturaSuperficieNieve, setTemperaturaSuperficieNieve] =
    useState('');
  const [estadoDelCielo, setEstadoDelCielo] = useState('');
  const [fuerzaDelViento, setFuerzaDelViento] = useState(
    params.windSpeed ? `${params.windSpeed} km/h` : ''
  );
  const [direccionDelViento, setDireccionDelViento] = useState(
    params.windDir ?? ''
  );
  const [tipoDePrecipitacion, setTipoDePrecipitacion] = useState('');

  // Paso 2: Manto Nivoso y Capa Débil
  const [espesorTotalManto, setEspesorTotalManto] = useState(
    params.snowDepth ?? ''
  );
  const [nieveNueva24h, setNieveNueva24h] = useState(
    params.freshSnow ?? ''
  );
  const [hundimientoPie, setHundimientoPie] = useState('');
  const [hundimientoEsqui, setHundimientoEsqui] = useState('');

  const [profundidadCapaDebil, setProfundidadCapaDebil] = useState('');
  const [grosorCapaDebil, setGrosorCapaDebil] = useState('');
  const [durezaDeLaNieve, setDurezaDeLaNieve] = useState('');
  const [tipoDeGrano, setTipoDeGrano] = useState('');
  const [tamanoDeCristal, setTamanoDeCristal] = useState('');
  const [cantidadDeLimones, setCantidadDeLimones] = useState(0);

  // Paso 3: Pruebas de Estabilidad y Señales de Alarma
  const [testCompresionCt, setTestCompresionCt] = useState('');
  const [testColumnaExtendidaEct, setTestColumnaExtendidaEct] = useState('');
  const [testSierraPst, setTestSierraPst] = useState('');
  const [calidadDeDeslizamientoQ, setCalidadDeDeslizamientoQ] = useState('');

  const [whumpfs, setWhumpfs] = useState(false);
  const [grietas, setGrietas] = useState(false);
  const [avalanchasRecientes, setAvalanchasRecientes] = useState('');

  // Paso 4: Diagnóstico y Publicación
  const [nivelPeligro, setNivelPeligro] = useState('');
  const [diagnosticoResumen, setDiagnosticoResumen] = useState('');

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1);
    } else {
      setShowExit(true);
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const terreno = {
        ubicacion_gps: ubicacionGps.trim() || undefined,
        altitud: toOptionalInt(altitud),
        orientacion_ladera: orientacionLadera.trim() || undefined,
        inclinacion_pendiente: toOptionalInt(inclinacionPendiente),
        forma_del_terreno: formaDelTerreno.trim() || undefined,
      };

      const clima_local = {
        temperatura_ambiente: toOptionalFloat(temperaturaAmbiente),
        temperatura_superficie_nieve: toOptionalFloat(temperaturaSuperficieNieve),
        estado_del_cielo: estadoDelCielo.trim() || undefined,
        fuerza_del_viento: fuerzaDelViento.trim() || undefined,
        direccion_del_viento: direccionDelViento.trim() || undefined,
        tipo_de_precipitacion: tipoDePrecipitacion.trim() || undefined,
      };

      const estado_nieve = {
        espesor_total_manto: toOptionalFloat(espesorTotalManto),
        nieve_nueva_24h: toOptionalFloat(nieveNueva24h),
        hundimiento_pie: toOptionalFloat(hundimientoPie),
        hundimiento_esqui: toOptionalFloat(hundimientoEsqui),
      };

      const capa_debil = {
        profundidad_capa_debil: toOptionalFloat(profundidadCapaDebil),
        grosor_capa_debil: toOptionalFloat(grosorCapaDebil),
        dureza_de_la_nieve: durezaDeLaNieve.trim() || undefined,
        tipo_de_grano: tipoDeGrano.trim() || undefined,
        tamano_de_cristal: toOptionalFloat(tamanoDeCristal),
        cantidad_de_limones:
          cantidadDeLimones > 0 ? cantidadDeLimones : undefined,
      };

      const pruebas_estabilidad = {
        test_compresion_ct: testCompresionCt.trim() || undefined,
        test_columna_extendida_ect: testColumnaExtendidaEct.trim() || undefined,
        test_sierra_pst: testSierraPst.trim() || undefined,
        calidad_de_deslizamiento_q: calidadDeDeslizamientoQ.trim() || undefined,
      };

      const senales_alarma = {
        sonidos_de_colapso_whumpfs: whumpfs,
        grietas_en_superficie: grietas,
        avalanchas_recientes: avalanchasRecientes.trim() || undefined,
      };

      const payload: CreateReportDTO = {
        coordenadas: {
          latitude,
          longitude,
        },
        ...(meteoId ? { datos_meteorologicos: meteoId } : {}),
        nivel_peligro_estimado: nivelPeligro.trim() || undefined,
        diagnostico_resumen: diagnosticoResumen.trim() || undefined,
        datos_campo: {
          terreno,
          clima_local,
          estado_nieve,
          capa_debil,
          pruebas_estabilidad,
          senales_alarma,
        },
      };

      await createReport(payload);
      setIsConfirmed(true);
    } catch (error: unknown) {
      console.error('Error al crear reporte de análisis:', error);
      const apiError = error as {
        response?: {
          data?: {
            detail?: string;
            [key: string]: unknown;
          };
        };
      };
      const detail = apiError.response?.data?.detail;
      setErrorMessage(
        typeof detail === 'string'
          ? detail
          : 'No se pudo guardar el reporte. Verificá la conexión e intentá nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
    >
      {isConfirmed ? (
        <ConfirmationView
          title="¡Reporte de análisis guardado!"
          message="El reporte técnico fue publicado correctamente y ya se encuentra visible en el mapa."
          buttonLabel="Ver en Mapa"
          onAction={() => router.replace('/(tabs)/mapa' as never)}
        />
      ) : (
        <>
          <WizardHeader
            title="Análisis de campo"
            currentStep={currentStep}
            totalSteps={4}
            onBack={handleBack}
          />

          {/* Paso 1: Terreno y Clima Local */}
          {currentStep === 1 && (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bannerTitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Punto de relevamiento
                </Text>
                <Text
                  style={[
                    styles.bannerCoords,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Lat: {latitude.toFixed(5)} · Lon: {longitude.toFixed(5)}
                </Text>
                {params.temp && (
                  <Text
                    style={[
                      styles.bannerHint,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Datos meteorológicos sugeridos desde Open-Meteo
                  </Text>
                )}
              </View>

              <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                1. Terreno
              </Text>

              <AppInput
                label="Ubicación o referencia"
                value={ubicacionGps}
                onChangeText={setUbicacionGps}
                placeholder="Ej. Glaciar Martial ladera Este"
              />

              <AppInput
                label="Altitud (msnm)"
                value={altitud}
                onChangeText={setAltitud}
                keyboardType="numeric"
                placeholder="Ej. 850"
              />

              <AppSelect
                label="Orientación de ladera"
                options={orientationOptions}
                value={orientacionLadera}
                onChange={setOrientacionLadera}
                placeholder="Seleccioná la orientación"
              />

              <AppInput
                label="Inclinación de la pendiente (°)"
                value={inclinacionPendiente}
                onChangeText={setInclinacionPendiente}
                keyboardType="numeric"
                placeholder="Ej. 34"
              />

              <AppSelect
                label="Forma del terreno"
                options={terrainShapeOptions}
                value={formaDelTerreno}
                onChange={setFormaDelTerreno}
                placeholder="Seleccioná la forma"
              />

              <Text
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.primary, marginTop: 16 },
                ]}
              >
                2. Clima Local
              </Text>

              <AppInput
                label="Temperatura ambiente (°C)"
                value={temperaturaAmbiente}
                onChangeText={setTemperaturaAmbiente}
                keyboardType="numeric"
                placeholder="Ej. -2.5"
                helperText={params.temp ? 'Sugerencia de Open-Meteo' : undefined}
              />

              <AppInput
                label="Temperatura superficial de la nieve (°C)"
                value={temperaturaSuperficieNieve}
                onChangeText={setTemperaturaSuperficieNieve}
                keyboardType="numeric"
                placeholder="Ej. -4.0"
              />

              <AppSelect
                label="Estado del cielo"
                options={skyOptions}
                value={estadoDelCielo}
                onChange={setEstadoDelCielo}
                placeholder="Seleccioná cobertura nubosa"
              />

              <AppInput
                label="Fuerza del viento"
                value={fuerzaDelViento}
                onChangeText={setFuerzaDelViento}
                placeholder="Ej. 25 km/h o Moderado"
                helperText={
                  params.windSpeed ? 'Sugerencia de Open-Meteo' : undefined
                }
              />

              <AppSelect
                label="Dirección del viento"
                options={orientationOptions}
                value={direccionDelViento}
                onChange={setDireccionDelViento}
                placeholder="Seleccioná la dirección"
              />

              <AppSelect
                label="Tipo de precipitación"
                options={precipitationOptions}
                value={tipoDePrecipitacion}
                onChange={setTipoDePrecipitacion}
                placeholder="Seleccioná precipitación"
              />

              <View style={styles.actions}>
                <AppButton
                  title="Continuar al Paso 2"
                  onPress={() => setCurrentStep(2)}
                />
              </View>
            </ScrollView>
          )}

          {/* Paso 2: Manto Nivoso y Capa Débil */}
          {currentStep === 2 && (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                3. Estado de la Nieve
              </Text>

              <AppInput
                label="Espesor total del manto (cm)"
                value={espesorTotalManto}
                onChangeText={setEspesorTotalManto}
                keyboardType="numeric"
                placeholder="Ej. 120"
                helperText={
                  params.snowDepth ? 'Sugerencia de Open-Meteo' : undefined
                }
              />

              <AppInput
                label="Nieve nueva en 24h (cm)"
                value={nieveNueva24h}
                onChangeText={setNieveNueva24h}
                keyboardType="numeric"
                placeholder="Ej. 15"
                helperText={
                  params.freshSnow ? 'Sugerencia de Open-Meteo' : undefined
                }
              />

              <AppInput
                label="Hundimiento a pie (cm)"
                value={hundimientoPie}
                onChangeText={setHundimientoPie}
                keyboardType="numeric"
                placeholder="Ej. 35"
              />

              <AppInput
                label="Hundimiento en esquí (cm)"
                value={hundimientoEsqui}
                onChangeText={setHundimientoEsqui}
                keyboardType="numeric"
                placeholder="Ej. 12"
              />

              <Text
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.primary, marginTop: 16 },
                ]}
              >
                4. Capa Débil
              </Text>

              <AppInput
                label="Profundidad de la capa débil (cm desde sup.)"
                value={profundidadCapaDebil}
                onChangeText={setProfundidadCapaDebil}
                keyboardType="numeric"
                placeholder="Ej. 40"
              />

              <AppInput
                label="Grosor de la capa débil (cm)"
                value={grosorCapaDebil}
                onChangeText={setGrosorCapaDebil}
                keyboardType="numeric"
                placeholder="Ej. 2.5"
              />

              <AppSelect
                label="Dureza de la nieve"
                options={snowHardnessOptions}
                value={durezaDeLaNieve}
                onChange={setDurezaDeLaNieve}
                placeholder="Seleccioná la dureza"
              />

              <AppSelect
                label="Tipo de grano"
                options={grainTypeOptions}
                value={tipoDeGrano}
                onChange={setTipoDeGrano}
                placeholder="Seleccioná el tipo de grano"
              />

              <AppInput
                label="Tamaño de cristal (mm)"
                value={tamanoDeCristal}
                onChangeText={setTamanoDeCristal}
                keyboardType="numeric"
                placeholder="Ej. 1.5"
              />

              <AppStepper
                min={0}
                max={5}
                step={1}
                value={cantidadDeLimones}
                onChange={setCantidadDeLimones}
                label="Cantidad de limones de inestabilidad (0 a 5)"
              />

              <View style={styles.actionsRow}>
                <AppButton
                  title="Anterior"
                  variant="secondary"
                  onPress={() => setCurrentStep(1)}
                  style={styles.halfButton}
                />
                <AppButton
                  title="Continuar"
                  onPress={() => setCurrentStep(3)}
                  style={styles.halfButton}
                />
              </View>
            </ScrollView>
          )}

          {/* Paso 3: Pruebas de Estabilidad y Señales de Alarma */}
          {currentStep === 3 && (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                5. Pruebas de Estabilidad
              </Text>

              <AppSelect
                label="Test de compresión (CT)"
                options={ctOptions}
                value={testCompresionCt}
                onChange={setTestCompresionCt}
                placeholder="Seleccioná resultado CT"
              />

              <AppSelect
                label="Test columna extendida (ECT)"
                options={ectOptions}
                value={testColumnaExtendidaEct}
                onChange={setTestColumnaExtendidaEct}
                placeholder="Seleccioná resultado ECT"
              />

              <AppInput
                label="Test de sierra (PST)"
                value={testSierraPst}
                onChangeText={setTestSierraPst}
                placeholder="Ej. PST 35/100 End"
              />

              <AppSelect
                label="Calidad de deslizamiento (Q)"
                options={shearQualityOptions}
                value={calidadDeDeslizamientoQ}
                onChange={setCalidadDeDeslizamientoQ}
                placeholder="Seleccioná calidad Q"
              />

              <Text
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.primary, marginTop: 16 },
                ]}
              >
                6. Señales de Alarma
              </Text>

              <View
                style={[
                  styles.switchRow,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.switchTextContainer}>
                  <Text
                    style={[
                      styles.switchTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Sonidos de colapso (Whumpfs)
                  </Text>
                  <Text
                    style={[
                      styles.switchSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Indicador directo de colapso en la capa débil
                  </Text>
                </View>
                <Switch
                  value={whumpfs}
                  onValueChange={setWhumpfs}
                  trackColor={{ true: theme.colors.primary, false: undefined }}
                />
              </View>

              <View
                style={[
                  styles.switchRow,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.switchTextContainer}>
                  <Text
                    style={[
                      styles.switchTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Grietas en superficie
                  </Text>
                  <Text
                    style={[
                      styles.switchSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Propagación de fracturas al caminar o esquiar
                  </Text>
                </View>
                <Switch
                  value={grietas}
                  onValueChange={setGrietas}
                  trackColor={{ true: theme.colors.primary, false: undefined }}
                />
              </View>

              <AppTextArea
                label="Avalanchas recientes observadas"
                value={avalanchasRecientes}
                onChangeText={setAvalanchasRecientes}
                placeholder="Detalles sobre tipo de avalancha, ladera, tamaño y horario estimado..."
                numberOfLines={3}
              />

              <View style={styles.actionsRow}>
                <AppButton
                  title="Anterior"
                  variant="secondary"
                  onPress={() => setCurrentStep(2)}
                  style={styles.halfButton}
                />
                <AppButton
                  title="Continuar"
                  onPress={() => setCurrentStep(4)}
                  style={styles.halfButton}
                />
              </View>
            </ScrollView>
          )}

          {/* Paso 4: Diagnóstico, Resumen y Publicación */}
          {currentStep === 4 && (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.sectionHeader, { color: theme.colors.primary }]}>
                7. Diagnóstico General
              </Text>

              <AppSelect
                label="Nivel de peligro estimado"
                options={dangerLevelOptions}
                value={nivelPeligro}
                onChange={setNivelPeligro}
                placeholder="Seleccioná el nivel de peligro"
              />

              <AppTextArea
                label="Diagnóstico resumido del evaluador"
                value={diagnosticoResumen}
                onChangeText={setDiagnosticoResumen}
                placeholder="Conclusión profesional sobre la estabilidad del manto, problemas de avalancha dominantes y recomendaciones..."
                numberOfLines={4}
              />

              <Text
                style={[
                  styles.sectionHeader,
                  { color: theme.colors.primary, marginTop: 16 },
                ]}
              >
                Resumen del Relevamiento
              </Text>

              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryItem,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                    Ubicación:{' '}
                  </Text>
                  {ubicacionGps}
                </Text>
                {altitud ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                      Altitud:{' '}
                    </Text>
                    {altitud} msnm
                  </Text>
                ) : null}
                {orientacionLadera ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                      Ladera:{' '}
                    </Text>
                    {orientacionLadera}
                    {inclinacionPendiente ? ` · ${inclinacionPendiente}°` : ''}
                  </Text>
                ) : null}
                {temperaturaAmbiente ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                      Temp. Ambiente:{' '}
                    </Text>
                    {temperaturaAmbiente} °C
                  </Text>
                ) : null}
                {espesorTotalManto ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                      Espesor manto:{' '}
                    </Text>
                    {espesorTotalManto} cm
                  </Text>
                ) : null}
                {testCompresionCt || testColumnaExtendidaEct ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>
                      Pruebas:{' '}
                    </Text>
                    {[testCompresionCt, testColumnaExtendidaEct]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                ) : null}
                {whumpfs || grietas ? (
                  <Text
                    style={[
                      styles.summaryItem,
                      { color: theme.colors.danger, fontWeight: '600' },
                    ]}
                  >
                    ⚠️ Señales de alarma presentes:{' '}
                    {[whumpfs && 'Whumpfs', grietas && 'Grietas']
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                ) : null}
              </View>

              {errorMessage && (
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {errorMessage}
                </Text>
              )}

              <View style={styles.actionsRow}>
                <AppButton
                  title="Anterior"
                  variant="secondary"
                  onPress={() => setCurrentStep(3)}
                  style={styles.halfButton}
                  disabled={isSubmitting}
                />
                <AppButton
                  title={isSubmitting ? 'Publicando...' : 'Publicar reporte'}
                  onPress={handleConfirm}
                  style={styles.halfButton}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                />
              </View>
            </ScrollView>
          )}

          {/* Diálogo de salir sin guardar */}
          <AppBottomSheet
            visible={showExit}
            onClose={() => setShowExit(false)}
            title="¿Salir sin guardar?"
          >
            <View style={styles.exitModalContent}>
              <Text
                style={[
                  styles.exitModalText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Se perderán los datos ingresados en el formulario de análisis.
              </Text>
              <AppButton
                title="Continuar editando"
                variant="secondary"
                onPress={() => setShowExit(false)}
              />
              <AppButton
                title="Salir sin guardar"
                variant="danger"
                onPress={() => router.replace('/(tabs)/mapa' as never)}
              />
            </View>
          </AppBottomSheet>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  banner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bannerCoords: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  actions: {
    marginTop: 16,
    paddingTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 8,
  },
  halfButton: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  switchTextContainer: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 12,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  summaryItem: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 13,
    marginTop: 8,
  },
  exitModalContent: {
    gap: 12,
    paddingBottom: 16,
  },
  exitModalText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
