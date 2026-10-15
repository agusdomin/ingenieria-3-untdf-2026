import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const router = useRouter();

  const [isRegistering, setIsRegistering] = useState(false);
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
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Error al autenticar. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {isRegistering && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={lastName}
              onChangeText={setLastName}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña (mín. 6 caracteres)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'Registrarse' : 'Entrar'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.link}>
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.guestLink}>Continuar como invitado (Solo lectura)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 12, gap: 12, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center', color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#0284c7', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  link: { color: '#0284c7', textAlign: 'center', marginTop: 12, fontWeight: '500' },
  guestLink: { color: '#64748b', textAlign: 'center', marginTop: 8, fontSize: 13 },
});