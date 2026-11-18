import { Pressable, Text, View } from 'react-native';
import { AppBottomSheet } from '../dialogs/AppBottomSheet';
import { useTheme } from '../../theme/useTheme';
import { AREA_COLORS, type ObservationArea } from './observationAreas';

export function ObservationAreaSheet({ area, onClose, onEventPress }: { area: ObservationArea | null; onClose: () => void; onEventPress: (id: string) => void }) {
  const { theme } = useTheme();
  return <AppBottomSheet visible={!!area} title="Área con observaciones" onClose={onClose}>
    {area && <View style={{ gap: 14 }}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>{area.members.length} observaciones · Sin filtro de antigüedad</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Agrupación por proximidad (máximo 2 km entre puntos). El color resume las observaciones; no delimita una zona de peligro validada.</Text>
      {(['informativa', 'precaucion', 'peligrosa', 'desconocida'] as const).map((level) => <View key={level} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: AREA_COLORS[level] }} />
        <Text style={{ color: theme.colors.textPrimary }}>{level === 'desconocida' ? 'Sin relevancia' : level === 'precaucion' ? 'Precaución' : level === 'peligrosa' ? 'Peligrosas' : 'Informativas'}: {area.counts[level]}</Text>
      </View>)}
      <Text style={{ color: theme.colors.textSecondary }}>Mayoría entre relevancias informadas; en empate prevalece la más alta.</Text>
      {area.counts.peligrosa > 0 && <Text style={{ color: theme.colors.danger, fontWeight: '700' }}>Este grupo incluye {area.counts.peligrosa} observaciones peligrosas.</Text>}
      {area.members.map((event) => <Pressable key={event.id} accessibilityRole="button" onPress={() => onEventPress(event.id)} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: theme.colors.border, gap: 4 }}>
        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600' }}>{event.title}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{new Date(event.date).toLocaleString('es-AR')} · {event.level || 'Sin relevancia'}</Text>
      </Pressable>)}
    </View>}
  </AppBottomSheet>;
}
