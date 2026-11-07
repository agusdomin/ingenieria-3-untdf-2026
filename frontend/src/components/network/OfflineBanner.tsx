import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useNetwork } from '../../network/NetworkContext';
import { useTheme } from '../../theme/useTheme';

/** Ocupa espacio propio debajo del navegador, sin superponerse a sus controles. */
export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const { theme } = useTheme();
  if (!isOffline) return null;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.banner, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
      <View style={styles.content} accessibilityLiveRegion="polite" accessible accessibilityLabel="Sin conexión a internet">
        <SymbolView name={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }} size={17} tintColor={theme.colors.warning} />
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Sin conexión a internet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  banner: { borderTopWidth: 1 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 9 },
  label: { flexShrink: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
