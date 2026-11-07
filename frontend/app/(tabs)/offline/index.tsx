import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useNetwork } from '../../../src/network/NetworkContext';
import { useTheme } from '../../../src/theme/useTheme';

export default function OfflineTab() {
  const { status, isConnected } = useNetwork();
  const { theme } = useTheme();
  const offline = status === 'offline';
  const label = offline ? 'Sin conexión a internet' : status === 'online' ? 'Conexión disponible' : 'Comprobando conexión';

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Offline</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.heading}>
            <SymbolView name={offline ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' } : { ios: 'wifi', android: 'wifi', web: 'wifi' }}
              size={22} tintColor={offline ? theme.colors.warning : theme.colors.primary} />
            <Text accessibilityLiveRegion="polite" style={[styles.subtitle, { color: theme.colors.textPrimary }]}>{label}</Text>
          </View>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            {offline
              ? (isConnected === false ? 'El dispositivo no tiene una red activa.' : 'Hay una red activa, pero no se detecta acceso a internet.')
              : status === 'online' ? 'El dispositivo tiene acceso a internet. El acceso a la API privada también requiere Tailscale.' : 'Esperando información de la red. El estado se actualiza automáticamente.'}
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>Disponibilidad offline</Text>
        <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
          La descarga de mapas, la cola local de observaciones y la sincronización todavía están en desarrollo. Este estado de conexión no indica que un reporte se haya guardado o enviado.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  card: { padding: 18, borderWidth: 1, borderRadius: 16, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subtitle: { flexShrink: 1, fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 21 },
});
