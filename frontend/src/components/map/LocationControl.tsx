import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { MapContainerProps } from './MapContainer.types';

export function LocationControl({ onLocate, locating, zoomControlTop }: Pick<MapContainerProps, 'onLocate' | 'locating' | 'zoomControlTop'>) {
  const { theme } = useTheme();
  if (!onLocate) return null;
  return (
    <Pressable
      accessibilityLabel="Mostrar mi ubicación"
      accessibilityRole="button"
      disabled={locating}
      onPress={onLocate}
      style={[styles.button, { top: zoomControlTop + 108, backgroundColor: theme.colors.surface }]}
    >
      {locating ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={{ color: theme.colors.textPrimary, fontSize: 24 }}>⌖</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { position: 'absolute', left: 12, width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
