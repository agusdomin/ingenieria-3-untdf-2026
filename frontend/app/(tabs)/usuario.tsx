
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthForm } from '../../src/components/auth/AuthForm';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/theme/useTheme';

export default function UsuarioScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {isAuthenticated && user ? (
          <>
            <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
              Mi cuenta
            </Text>

            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              Información de tu perfil.
            </Text>

            <View style={styles.userInfo}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Nombre
              </Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {user.firstName} {user.lastName}
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Correo electrónico
              </Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {user.email}
              </Text>

              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Rol
              </Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {user.role.replaceAll('_', ' ')}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                {
                  backgroundColor: theme.colors.danger,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>
                Cerrar sesión
              </Text>
            </Pressable>
          </>
        ) : (
          <AuthForm
            onSuccess={() => router.replace('/(tabs)/mapa' as never)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  center: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 26,
    borderWidth: 1,
  },
  heading: {
    fontSize: 23,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },
  userInfo: {
    gap: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
