import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/useTheme';

interface AuthFormProps {
  onSuccess?: () => void;
  onGuest?: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthForm({ onSuccess, onGuest, initialMode = 'login' }: AuthFormProps) {
  const { login, register } = useAuth();
  const { theme } = useTheme();
  const [isRegistering, setIsRegistering] = useState(initialMode === 'register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await register({ firstName, lastName, email, password });
      } else {
        await login({ email, password });
      }
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          'No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>
        {isRegistering ? 'Crear cuenta' : 'Ingresar a la cuenta'}
      </Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {isRegistering
          ? 'Registrate para participar de la comunidad.'
          : 'Guardá observaciones y planificá tus salidas.'}
      </Text>

      {isRegistering && (
        <>
          <TextInput
            accessibilityLabel="Nombre"
            autoComplete="given-name"
            placeholder="Nombre"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, fieldStyle(theme)]}
          />
          <TextInput
            accessibilityLabel="Apellido"
            autoComplete="family-name"
            placeholder="Apellido"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, fieldStyle(theme)]}
          />
        </>
      )}

      <TextInput
        accessibilityLabel="Correo electrónico"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="Correo electrónico"
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, fieldStyle(theme)]}
      />
      <TextInput
        accessibilityLabel="Contraseña"
        autoComplete={isRegistering ? 'new-password' : 'current-password'}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.inputPlaceholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[styles.input, fieldStyle(theme)]}
      />

      {error && (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={loading || !email.trim() || !password}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: theme.colors.primary,
            opacity: loading || !email.trim() || !password ? 0.55 : pressed ? 0.82 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.textInverse} />
        ) : (
          <Text style={[styles.primaryButtonText, { color: theme.colors.textInverse }]}>
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </Text>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setError(null);
          setIsRegistering((value) => !value);
        }}
        style={styles.linkButton}
      >
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </Text>
      </Pressable>

      {onGuest && (
        <Pressable accessibilityRole="button" onPress={onGuest} style={styles.guestButton}>
          <Text style={[styles.guestText, { color: theme.colors.textSecondary }]}>
            Explorar como invitado
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function fieldStyle(theme: ReturnType<typeof useTheme>['theme']) {
  return {
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.inputBackground,
    borderColor: theme.colors.inputBorder,
  };
}

const styles = StyleSheet.create({
  form: { gap: 13 },
  heading: { fontSize: 23, fontWeight: '700', letterSpacing: -0.4 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  error: { fontSize: 13, lineHeight: 18 },
  primaryButton: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  linkButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 14, fontWeight: '600' },
  guestButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  guestText: { fontSize: 14, fontWeight: '600' },
});
