import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/useTheme';
import { AppBottomSheet } from '../dialogs/AppBottomSheet';
import { LoginGateModal } from './LoginGateModal';

const roles = {
  observador_recreativo: 'Observador recreativo',
  observador_experto: 'Observador experto',
  administrador: 'Administrador',
};

export function MapAccountModal({ onDismiss }: { onDismiss: () => void }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await logout();
      onDismiss();
    } catch {
      setError('No se pudo cerrar la sesión. Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  if (!isLoading && !isAuthenticated) return <LoginGateModal visible onDismiss={onDismiss} />;

  return (
    <AppBottomSheet visible title="Mi cuenta" onClose={onDismiss}>
      <View style={styles.content}>
        {isLoading ? <ActivityIndicator color={theme.colors.primary} /> : user ? <>
          <Text style={[theme.typography.subheading, { color: theme.colors.textPrimary }]}>{user.firstName} {user.lastName}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{user.email}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>{roles[user.role]}</Text>
          {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{error}</Text> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" disabled={busy} onPress={handleLogout}
            style={({ pressed }) => [styles.button, { borderColor: theme.colors.danger, backgroundColor: theme.colors.surfaceSecondary, opacity: pressed || busy ? 0.6 : 1 }]}>
            {busy ? <ActivityIndicator color={theme.colors.danger} /> : <Text style={[theme.typography.body, { color: theme.colors.danger }]}>Cerrar sesión</Text>}
          </Pressable>
        </> : null}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 8 },
  button: { minHeight: 48, marginTop: 10, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center', justifyContent: 'center' },
});
