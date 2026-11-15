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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const submitDisabled = loading || !email.trim() || !password;
  const inputStyle = (name: string) => [styles.input, fieldStyle(theme), {
    borderColor: focusedField === name ? theme.colors.primary : theme.colors.inputBorder,
    borderWidth: focusedField === name ? 2 : 1,
  }];

  const handleSubmit = async () => {
    if (submitDisabled) return;
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
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Nombre</Text>
          <TextInput
            accessibilityLabel="Nombre"
            autoComplete="given-name"
            placeholder="Nombre"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('firstName')}
          />
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Apellido</Text>
          <TextInput
            accessibilityLabel="Apellido"
            autoComplete="family-name"
            placeholder="Apellido"
            placeholderTextColor={theme.colors.inputPlaceholder}
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('lastName')}
          />
        </>
      )}

      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Correo electrónico</Text>
      <TextInput
        accessibilityLabel="Correo electrónico"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="nombre@correo.com"
        placeholderTextColor={theme.colors.inputPlaceholder}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField(null)}
        style={inputStyle('email')}
      />
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Contraseña</Text>
      <TextInput
        accessibilityLabel="Contraseña"
        autoComplete={isRegistering ? 'new-password' : 'current-password'}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.inputPlaceholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        autoCapitalize="none"
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField(null)}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        style={inputStyle('password')}
      />

      {error && (
        <Text accessibilityRole="alert" style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={submitDisabled}
        accessibilityState={{ disabled: submitDisabled, busy: loading }}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            opacity: submitDisabled ? 0.55 : pressed ? 0.82 : 1,
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
        disabled={loading}
        onPress={() => {
          setError(null);
          setIsRegistering((value) => !value);
        }}
        style={({ pressed }) => [styles.linkButton, {
          borderColor: theme.colors.primary,
          backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface,
          opacity: loading ? 0.55 : 1,
        }]}
      >
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>
          {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </Text>
      </Pressable>

      {onGuest && (
        <View style={[styles.guestSection, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.guestHint, { color: theme.colors.textMuted }]}>¿Solo querés consultar el mapa?</Text>
        <Pressable accessibilityRole="button" disabled={loading} onPress={onGuest} style={({ pressed }) => [styles.guestButton, {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceSecondary,
          opacity: loading ? 0.55 : pressed ? 0.7 : 1,
        }]}>
          <Text style={[styles.guestText, { color: theme.colors.textPrimary }]}>
            Explorar como invitado
          </Text>
        </Pressable>
        </View>
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
  label: { fontSize: 13, fontWeight: '600', marginBottom: -6 },
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  linkButton: { minHeight: 50, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontSize: 14, fontWeight: '600' },
  guestSection: { marginTop: 7, paddingTop: 18, borderTopWidth: 1, gap: 10 },
  guestHint: { fontSize: 12, textAlign: 'center' },
  guestButton: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  guestText: { fontSize: 14, fontWeight: '600' },
});
