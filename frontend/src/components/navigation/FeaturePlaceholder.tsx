import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/useTheme';

interface FeaturePlaceholderProps {
  icon: SymbolViewProps['name'];
  eyebrow: string;
  title: string;
  description: string;
}

export function FeaturePlaceholder({ icon, eyebrow, title, description }: FeaturePlaceholderProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconTile, { backgroundColor: theme.colors.primarySoft }]}>
          <SymbolView name={icon} tintColor={theme.colors.primary} size={29} />
        </View>
        <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
        <View style={[styles.note, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.noteDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>Esta sección todavía está en desarrollo.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/(tabs)/mapa' as never)}
          style={({ pressed }) => [styles.action, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.82 : 1 }]}
        >
          <SymbolView name={{ ios: 'map.fill', android: 'map', web: 'map' }} tintColor={theme.colors.textInverse} size={18} />
          <Text style={[styles.actionText, { color: theme.colors.textInverse }]}>Volver al mapa</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  iconTile: { width: 62, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.7, textAlign: 'center', maxWidth: 360 },
  description: { fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 360, marginTop: 12 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 26 },
  noteDot: { width: 8, height: 8, borderRadius: 4 },
  noteText: { fontSize: 12, fontWeight: '600' },
  action: { minHeight: 48, paddingHorizontal: 18, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  actionText: { fontSize: 14, fontWeight: '700' },
});
