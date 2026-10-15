import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function HomeScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plataforma de Avalanchas</Text>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Estado de Sesión:</Text>
        {isAuthenticated && user ? (
          <>
            <Text style={styles.text}>Conectado como: {user.firstName} {user.lastName}</Text>
            <Text style={styles.text}>Email: {user.email}</Text>
            <Text style={styles.badge}>Rol: {user.role}</Text>

            <Pressable style={[styles.button, styles.logoutButton]} onPress={logout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.text}>Modo Invitado (Solo lectura habilitada)</Text>
            <Pressable
              style={styles.button}
              onPress={() => router.push('/auth/login' as any)}
            >
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#0f172a' },
  card: { padding: 20, borderRadius: 12, backgroundColor: '#ffffff', elevation: 2, gap: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#334155' },
  text: { fontSize: 15, color: '#475569' },
  badge: { fontSize: 14, fontWeight: 'bold', color: '#0284c7', marginTop: 4 },
  button: { marginTop: 12, backgroundColor: '#0284c7', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutButton: { backgroundColor: '#dc2626' },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});