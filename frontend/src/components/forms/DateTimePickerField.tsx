import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { SymbolView } from 'expo-symbols';
import { CalendarPanel, ClockPanel } from './DateTimePickerPanels';

const pad = (value: number) => String(value).padStart(2, '0');
function inputValue(date: Date, mode: 'date' | 'time') {
  return mode === 'date'
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface Props {
  mode: 'date' | 'time';
  label: string;
  value: Date | null;
  onChange: (value: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DateTimePickerField({ mode, label, value, onChange, error, placeholder, disabled, minimumDate, maximumDate }: Props) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [timePart, setTimePart] = useState(0);
  const formatted = value ? mode === 'date'
    ? `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`
    : inputValue(value, 'time') : placeholder ?? (mode === 'date' ? 'DD/MM/AAAA' : 'HH:MM');
  const min = minimumDate ? inputValue(minimumDate, 'date') : undefined;
  const max = maximumDate ? inputValue(maximumDate, 'date') : undefined;
  const valid = Boolean(draft) && (mode === 'time' || ((!min || draft >= min) && (!max || draft <= max)));

  function confirm() {
    if (!valid) return;
    const next = new Date(value ?? new Date());
    if (mode === 'date') {
      const [year, month, day] = draft.split('-').map(Number);
      next.setFullYear(year, month - 1, day);
    } else {
      const [hour, minute] = draft.split(':').map(Number);
      next.setHours(hour, minute, 0, 0);
    }
    onChange(next);
    setVisible(false);
  }

  return (
    <View style={styles.field}>
      <Text style={{ color: theme.colors.textSecondary }}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${formatted}`} disabled={disabled}
        onPress={() => { setDraft(inputValue(value ?? new Date(), mode)); setTimePart(0); setVisible(true); }}
        style={({ pressed }) => [styles.button, styles.trigger, { backgroundColor: theme.colors.inputBackground, borderColor: error ? theme.colors.danger : theme.colors.inputBorder, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
        <Text style={{ color: theme.colors.textPrimary, flex: 1 }}>{formatted}</Text>
        <SymbolView name={mode === 'date' ? { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' } : { ios: 'clock', android: 'schedule', web: 'schedule' }} size={19} tintColor={theme.colors.primary} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.scrim}>
          <ScrollView style={[styles.dialog, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} contentContainerStyle={styles.dialogContent}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.textPrimary }]}>{label}</Text>
            {mode === 'date' ? (visible ? <CalendarPanel value={draft} onChange={setDraft} min={min} max={max} /> : null) : <View style={styles.timePicker}>
              <View style={styles.timeColumns}>
              {(['Hora', 'Minutos'] as const).map((title, index) => (
                <Pressable key={title} accessibilityRole="button" accessibilityState={{ selected: timePart === index }}
                  accessibilityLabel={`Elegir ${title.toLowerCase()}`} onPress={() => setTimePart(index)}
                  style={[styles.timeColumn, { backgroundColor: theme.colors.inputBackground, borderColor: timePart === index ? theme.colors.primary : theme.colors.border }]}>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{title}</Text>
                  <Text style={[styles.timeValue, { color: timePart === index ? theme.colors.primary : theme.colors.textPrimary }]}>{draft.split(':')[index] ?? '00'}</Text>
                </Pressable>
              ))}
              </View>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{timePart === 0 ? 'Elegí una hora · anillo interior de 12 a 23 h' : 'Elegí los minutos en el reloj'}</Text>
              <ClockPanel value={draft} part={timePart} onChange={setDraft} onPartChange={setTimePart} />
            </View>}
            {mode === 'time' && draft ? <Text style={{ color: theme.colors.textSecondary }}>Hora seleccionada: {draft}</Text> : null}
            {!valid ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>Seleccioná un valor válido dentro del rango permitido.</Text> : null}
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={[styles.button, styles.action, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.textPrimary }}>Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={!valid} onPress={confirm} style={[styles.button, styles.action, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, opacity: valid ? 1 : 0.5 }]}><Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>Confirmar</Text></Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8, minWidth: 0 },
  trigger: { flexDirection: 'row', gap: 8 },
  timeColumns: { flexDirection: 'row', gap: 16 },
  timePicker: { gap: 12 },
  timeColumn: { flex: 1, gap: 4, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  timeValue: { fontSize: 28, fontWeight: '600', fontVariant: ['tabular-nums'] },
  button: { minHeight: 48, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 420, maxHeight: '95%', flexGrow: 0, borderWidth: 1, borderRadius: 20 },
  dialogContent: { padding: 20, gap: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  action: { flex: 1, minWidth: 110 },
});
