
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '../../components/auth/AuthForm';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/useTheme';
import type { User } from '../../types/auth';

const roleLabels: Record<User['role'], string> = {
  observador_recreativo: 'Observador recreativo',
  observador_experto: 'Observador experto',
  administrador: 'Administrador',
};

export function UserScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Mi cuenta
            </Text>

            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
              {user.firstName} {user.lastName}
            </Text>

            <Text style={{ color: theme.colors.textSecondary }}>
              {user.email}
            </Text>

            <View
              style={[
                styles.roleBadge,
                { backgroundColor: theme.colors.inputBackground },
              ]}
            >
              <Text style={{ color: theme.colors.textPrimary }}>
                {roleLabels[user.role]}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isLoggingOut}
              onPress={handleLogout}
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.danger,
                  opacity: isLoggingOut ? 0.6 : 1,
                },
              ]}
            >
              {isLoggingOut ? (
                <ActivityIndicator color={theme.colors.textInverse} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.colors.textInverse },
                  ]}
                >
                  Cerrar sesión
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <AuthForm />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 26,
    borderWidth: 1,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 18,
    marginBottom: 24,
  },
  button: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
