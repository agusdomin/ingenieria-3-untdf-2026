import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AppBottomSheet } from '../dialogs/AppBottomSheet';
import { useTheme } from '../../theme/useTheme';
import type { MapContainerProps } from './MapContainer.types';

interface Props {
  visible: boolean;
  onClose: () => void;
  mapStyle: MapContainerProps['mapStyle'];
  onMapStyleChange: (style: MapContainerProps['mapStyle']) => void;
  showRiskZones?: boolean;
  onRiskZonesChange?: (visible: boolean) => void;
  layers?: { id: string; label: string; detail: string; visible: boolean; onChange: (value: boolean) => void }[];
}

const bases = [
  { value: 'terrain', label: 'Topográfico / Relieve', detail: 'Curvas de nivel y relieve · OpenTopoMap' },
  { value: 'street', label: 'Estándar / Callejero', detail: 'Calles y caminos · OpenStreetMap' },
] as const;

export function MapLayersSheet({ visible, onClose, mapStyle, onMapStyleChange, showRiskZones, onRiskZonesChange, layers = [] }: Props) {
  const { theme } = useTheme();
  return (
    <AppBottomSheet visible={visible} onClose={onClose} title="Capas del mapa">
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[theme.typography.body, styles.heading, { color: theme.colors.textPrimary }]}>Mapa base</Text>
          {bases.map((base) => {
            const selected = mapStyle === base.value;
            return (
              <Pressable
                key={base.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={base.label}
                onPress={() => {
                  onMapStyleChange(base.value);
                  onClose();
                }}
                style={({ pressed }) => [styles.option, { borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.surfaceSecondary : theme.colors.surface, opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{base.label}</Text>
                  <Text style={[styles.detail, { color: theme.colors.textSecondary }]}>{base.detail}</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.textMuted }]}>
                  {selected ? <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        {layers.length > 0 && <View style={styles.section}>
          <Text style={[styles.heading, { color: theme.colors.textPrimary }]}>Información del mapa</Text>
          {layers.map((layer) => <View key={layer.id} style={[styles.option, { borderColor: theme.colors.border }]}>
            <View style={styles.copy}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{layer.label}</Text>
              <Text accessibilityLiveRegion="polite" style={[styles.detail, { color: theme.colors.textSecondary }]}>
                {layer.visible ? 'Visible' : 'Oculta'} · {layer.detail}
              </Text>
            </View>
            <Switch accessibilityLabel={layer.label} value={layer.visible} onValueChange={layer.onChange}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
          </View>)}
        </View>}
        {onRiskZonesChange ? <View style={styles.section}>
          <Text style={[theme.typography.body, styles.heading, { color: theme.colors.textPrimary }]}>Información del mapa</Text>
          <View style={[styles.option, { borderColor: theme.colors.border }]}>
            <View style={styles.copy}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Zonas de riesgo</Text>
              <Text accessibilityLiveRegion="polite" style={[styles.detail, { color: theme.colors.textSecondary }]}>
                {showRiskZones ? 'Visible' : 'Oculta'} · Datos de ejemplo
              </Text>
            </View>
            <Switch accessibilityLabel="Mostrar zonas de riesgo" value={showRiskZones} onValueChange={(value) => {
              onRiskZonesChange(value);
              onClose();
            }} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} />
          </View>
        </View> : null}
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: 24, paddingBottom: 4 },
  section: { gap: 10 },
  heading: { fontWeight: '600' },
  option: { minHeight: 76, borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  copy: { flex: 1, gap: 5 },
  label: { fontSize: 15, fontWeight: '600' },
  detail: { fontSize: 13, lineHeight: 19 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
