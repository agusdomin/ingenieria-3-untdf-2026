import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/useTheme';

export function AreaDetailScreen() {
  const { theme } = useTheme();

  const { latitude, longitude, radius } =
    useLocalSearchParams<{
      latitude?: string;
      longitude?: string;
      radius?: string;
    }>();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.colors.textPrimary },
        ]}
      >
        Detalle del área
      </Text>

      <Text style={{ color: theme.colors.textSecondary }}>
        Latitud: {latitude ?? 'Sin definir'}
      </Text>

      <Text style={{ color: theme.colors.textSecondary }}>
        Longitud: {longitude ?? 'Sin definir'}
      </Text>

      <Text style={{ color: theme.colors.textSecondary }}>
        Radio: {radius ?? '500'} m
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});