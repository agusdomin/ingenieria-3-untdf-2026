import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppImagePicker } from '../../components/forms/AppImagePicker';
import { useTheme } from '../../theme/useTheme';

export function NewObservationScreen() {
  const { theme } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Reporte rápido recreativo</Text>
        <AppImagePicker value={imageUri} onChange={setImageUri} />
        <Text style={{ color: theme.colors.textSecondary }}>
          {imageUri ? 'Foto adjunta. ' : ''}El reporte está en preparación. La foto se conserva solo mientras esta pantalla está abierta; todavía no se envía ni se guarda offline.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 20, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
