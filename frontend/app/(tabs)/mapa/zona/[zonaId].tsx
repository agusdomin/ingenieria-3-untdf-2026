import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RiskBadge } from '../../../../src/components/ui/RiskBadge';
import { zonesGeoJSON } from '../../../../src/mocks/zones.mock';
import { useTheme } from '../../../../src/theme/useTheme';

export default function ZoneDetailPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { zonaId } = useLocalSearchParams<{
    zonaId: string;
  }>();
  const zone = zonesGeoJSON.features.find((feature) => feature.properties.id === zonaId);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.colors.textPrimary} size={20} />
          <Text style={[styles.backText, { color: theme.colors.textPrimary }]}>Mapa</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>ZONA DE MONTAÑA</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{zone?.properties.name ?? 'Zona no encontrada'}</Text>
          {zone && <RiskBadge level={zone.properties.riskLevel as 'bajo' | 'moderado' | 'considerable' | 'alto' | 'extremo'} />}
        </View>

        <View style={[styles.disclaimer, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <SymbolView name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }} tintColor={theme.colors.warning} size={19} />
          <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
            Datos ilustrativos. Consultá los boletines oficiales antes de salir.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Información de la zona</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          {zone
            ? 'La descripción, el pronóstico y los reportes de esta zona estarán disponibles cuando se conecten con la API.'
            : `No hay información disponible para el identificador ${zonaId ?? ''}.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 20 },
  backButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontWeight: '600' },
  hero: { borderRadius: 22, borderWidth: 1, padding: 22, gap: 13 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5 },
  disclaimer: { borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: -10 },
  body: { fontSize: 14, lineHeight: 22 },
});
