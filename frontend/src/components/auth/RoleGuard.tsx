import React, { ReactNode } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/auth';

interface Props {
  children: ReactNode;
  allowedRoles?: User['role'][];
}

export function RoleGuard({ children, allowedRoles }: Props) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Si intenta cargar datos o modificar sin estar logueado, lo envía a /login
  if (!isAuthenticated) {
    return <Redirect href={"/login" as any} />;
  }

  // Si la pantalla exige un rol específico (ej. 'observador_experto' para Reporte Técnico)
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Acceso Restringido</Text>
        <Text style={styles.text}>No tienes el rol necesario para realizar esta acción.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#dc2626' },
  text: { fontSize: 15, color: '#475569', textAlign: 'center' },
  button: { marginTop: 8, backgroundColor: '#0284c7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});