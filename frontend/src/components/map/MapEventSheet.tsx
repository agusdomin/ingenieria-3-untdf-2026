import { useState } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { AppBottomSheet } from '../dialogs/AppBottomSheet';
import { useTheme } from '../../theme/useTheme';
import type { MapEvent } from './mapEvents';

export function MapEventSheet({ event, onClose }: { event: MapEvent | null; onClose: () => void }) {
  const { theme } = useTheme();
  return <AppBottomSheet visible={!!event} title={event?.title ?? ''} onClose={onClose}>
    {event && <ScrollView style={styles.scroll}><View style={styles.content}>
      <Text style={{ color: event.color }}>{event.kind === 'report' ? 'R · Reporte técnico' : 'Observación de campo'}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>{event.author || 'Autor no informado'} · {new Date(event.date).toLocaleString('es-AR')}</Text>
      <Text style={{ color: theme.colors.textPrimary }}>{event.kind === 'report' ? 'Peligro estimado' : 'Relevancia'}: {event.level || 'Sin informar'}</Text>
      <Text style={[styles.summary, { color: theme.colors.textPrimary }]}>{event.summary}</Text>
      {event.image ? <ObservationImage key={event.image} uri={event.image} /> : null}
      <Text style={{ color: theme.colors.textSecondary }}>Lat. {event.coordinate[1].toFixed(5)} · Long. {event.coordinate[0].toFixed(5)}</Text>
    </View></ScrollView>}
  </AppBottomSheet>;
}

function ObservationImage({ uri }: { uri: string }) {
  const [failed, setFailed] = useState(false);
  const { theme } = useTheme();
  return failed ? <Text style={{ color: theme.colors.textSecondary }}>No se pudo cargar la imagen.</Text>
    : <Image source={{ uri }} accessibilityLabel="Imagen de la observación" contentFit="contain" style={styles.image} onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({ scroll: { maxHeight: 420 }, content: { gap: 12, paddingBottom: 16 }, summary: { fontSize: 15, lineHeight: 22 }, image: { width: '100%', height: 220, borderRadius: 12 } });
