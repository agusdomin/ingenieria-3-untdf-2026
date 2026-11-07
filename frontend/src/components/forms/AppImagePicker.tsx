import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';

export interface AppImagePickerProps {
  value: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function AppImagePicker({ value, onChange, label = 'Adjuntar foto del manto', disabled = false, error }: AppImagePickerProps) {
  const { theme } = useTheme();
  const [, requestPermission, getPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'closed' | 'choose' | 'camera'>('closed');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const camera = useRef<CameraView>(null);
  const generation = useRef(0);
  const locked = useRef(false);

  function close() {
    generation.current += 1;
    locked.current = false;
    setBusy(false);
    setReady(false);
    setMode('closed');
  }

  useEffect(() => () => { generation.current += 1; }, []);
  useEffect(() => {
    if (mode !== 'camera') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') close();
    });
    return () => subscription.remove();
  }, [mode]);

  async function openCamera() {
    if (locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    setMessage(null);
    const id = ++generation.current;
    try {
      let permission = await getPermission();
      if (!permission.granted && permission.canAskAgain) permission = await requestPermission();
      if (id !== generation.current) return;
      if (!permission.granted) {
        setMessage(permission.canAskAgain
          ? 'Necesitamos permiso de cámara para tomar la foto. Podés volver a intentarlo.'
          : 'Habilitá el permiso de cámara en los ajustes de la app o del navegador.');
        return;
      }
      setReady(false);
      setMode('camera');
    } catch {
      if (id === generation.current) setMessage('No se pudo abrir la cámara. Podés elegir una foto de la galería.');
    } finally {
      if (id === generation.current) { locked.current = false; setBusy(false); }
    }
  }

  async function chooseImage() {
    if (locked.current || disabled) return;
    const id = ++generation.current;
    setMessage(null);
    // En web debe abrirse directamente desde el gesto; algunos navegadores no
    // resuelven la promesa al cancelar, por eso no bloqueamos el formulario allí.
    if (Platform.OS !== 'web') { locked.current = true; setBusy(true); }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
      if (id !== generation.current) return;
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
        setMode('closed');
      }
    } catch {
      if (id === generation.current) setMessage('No se pudo abrir la foto. Volvé a elegirla desde la galería.');
    } finally {
      if (id === generation.current) { locked.current = false; setBusy(false); }
    }
  }

  async function capture() {
    if (!ready || !camera.current || locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    const id = ++generation.current;
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.85 });
      if (id !== generation.current) return;
      onChange(photo.uri);
      close();
    } catch {
      if (id === generation.current) setMessage('No se pudo tomar la foto. Intentá nuevamente.');
    } finally {
      if (id === generation.current) { locked.current = false; setBusy(false); }
    }
  }

  const actionStyle = { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border };
  const textStyle = { color: theme.colors.textPrimary };
  const feedback = message || error;

  return (
    <View style={styles.field}>
      {value ? (
        <View style={[styles.previewFrame, actionStyle]}>
          <Image source={{ uri: value }} style={styles.preview} contentFit="contain" accessibilityLabel="Foto adjunta al reporte" />
          <View style={[styles.actions, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <PickerButton label="Cambiar foto" compact disabled={disabled || busy}
              icon={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }}
              onPress={() => { setMessage(null); setMode('choose'); }} />
            <PickerButton label="Eliminar foto" compact destructive disabled={disabled || busy}
              icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
              onPress={() => { close(); setMessage(null); onChange(null); }} />
          </View>
        </View>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || busy }} disabled={disabled || busy}
          onPress={() => { setMessage(null); setMode('choose'); }}
          style={({ pressed }) => [styles.empty, actionStyle, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
          <SymbolView name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }} size={25} tintColor={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
        </Pressable>
      )}
      {feedback && mode === 'closed' ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{feedback}</Text> : null}

      <Modal visible={mode !== 'closed'} transparent={mode !== 'camera'} animationType="fade" onRequestClose={close}>
        {mode === 'camera' ? (
          <SafeAreaView style={styles.cameraScreen}>
            <View style={styles.cameraPreview}>
              <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" mode="picture"
                onCameraReady={() => setReady(true)}
                onMountError={() => { setMode('choose'); setMessage('La cámara no está disponible. Podés usar la galería.'); }} />
            </View>
            {message ? <Text accessibilityRole="alert" style={styles.cameraText}>{message}</Text> : null}
            <View style={styles.cameraActions}>
              <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [styles.action, styles.cameraCancel, { opacity: pressed ? 0.65 : 1 }]}><Text style={styles.cameraText}>Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Tomar foto" disabled={!ready || busy || disabled} onPress={capture}
                style={[styles.shutter, { opacity: !ready || busy ? 0.5 : 1 }]}>
                {busy ? <ActivityIndicator color="#111" /> : <SymbolView name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }} size={28} tintColor="#111" />}
              </Pressable>
            </View>
          </SafeAreaView>
        ) : (
          <View style={styles.scrim}>
            <SafeAreaView style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
              <Text accessibilityRole="header" style={[styles.title, textStyle]}>Adjuntar foto</Text>
              <Text style={{ color: theme.colors.textSecondary }}>Tomá una foto o elegí una imagen de tu galería.</Text>
              {feedback ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{feedback}</Text> : null}
              {busy ? <ActivityIndicator color={theme.colors.primary} /> : null}
              <View style={styles.sourceActions}>
                <PickerButton label="Tomar foto" disabled={busy || disabled} onPress={openCamera}
                  icon={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }} />
                <PickerButton label="Elegir de galería" disabled={busy || disabled} onPress={chooseImage}
                  icon={{ ios: 'photo', android: 'photo_library', web: 'photo_library' }} />
              </View>
              <PickerButton label="Cancelar" onPress={close} />
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </View>
  );
}

function PickerButton({ label, onPress, disabled = false, destructive = false, compact = false, icon }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  compact?: boolean;
  icon?: SymbolViewProps['name'];
}) {
  const { theme } = useTheme();
  const color = destructive ? theme.colors.danger : theme.colors.textPrimary;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.action, compact && styles.compactAction, {
        backgroundColor: pressed ? theme.colors.surfaceSecondary : theme.colors.surface,
        borderColor: destructive ? theme.colors.danger : theme.colors.border,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
      }]}>
      {icon ? <SymbolView name={icon} size={19} tintColor={destructive ? color : theme.colors.primary} /> : null}
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  empty: { minHeight: 100, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10 },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  previewFrame: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  preview: { width: '100%', height: 200 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1 },
  action: { minHeight: 48, flexDirection: 'row', gap: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  compactAction: { flexGrow: 1, flexBasis: 140, maxWidth: 220 },
  buttonLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  sourceActions: { gap: 12, paddingVertical: 4 },
  cameraCancel: { borderColor: '#666', backgroundColor: '#1A1A1A' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 520, padding: 20, gap: 12, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { fontSize: 18, fontWeight: '700' },
  cameraScreen: { flex: 1, backgroundColor: '#000' },
  cameraPreview: { flex: 1 },
  cameraText: { color: '#fff', textAlign: 'center', padding: 8 },
  cameraActions: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: 20 },
  shutter: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
});
