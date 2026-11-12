import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { DateRangePickerProps } from './DateRangePicker';
import { CalendarPanel } from './DateTimePickerPanels';
import { useTheme } from '../../theme/useTheme';

const pad = (n: number) => String(n).padStart(2, '0');
const key = (date: Date | null) => date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '';
const display = (date: string) => date ? date.split('-').reverse().join('/') : 'Seleccionar';
function localDate(value: string, previous: Date | null) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(previous ?? new Date());
  date.setFullYear(year, month - 1, day);
  return date;
}

export function DateRangePickerPanel({ startDate, endDate, onStartDateChange, onEndDateChange, error, disabled = false }: DateRangePickerProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [part, setPart] = useState<'start' | 'end'>('start');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [focusTransition] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(focusTransition, { toValue: part === 'end' ? 1 : 0, duration: reduceMotion ? 0 : 240, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [part, reduceMotion, focusTransition]);
  const valid = Boolean(start && end && end >= start);

  function open(nextPart: 'start' | 'end') {
    setStart(key(startDate)); setEnd(key(endDate));
    setPart(startDate ? nextPart : 'start'); setVisible(true);
  }
  function select(date: string) {
    if (part === 'start') {
      setStart(date);
      setEnd('');
      setPart('end');
    } else {
      setEnd(date);
    }
  }
  const textColor = { color: theme.colors.textPrimary };
  return (
    <View style={styles.field}>
      <View style={styles.row}>
        {(['start', 'end'] as const).map((item) => <View key={item} style={styles.column}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>{item === 'start' ? 'Fecha desde' : 'Fecha hasta'}</Text>
          <Pressable accessibilityRole="button" disabled={disabled} onPress={() => open(item)} accessibilityLabel={`${item === 'start' ? 'Fecha desde' : 'Fecha hasta'}: ${display(key(item === 'start' ? startDate : endDate))}`}
            style={({ pressed }) => [styles.button, styles.row, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
            <Text style={[theme.typography.bodySmall, textColor]}>{display(key(item === 'start' ? startDate : endDate))}</Text>
            <SymbolView name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }} size={18} tintColor={theme.colors.primary} />
          </Pressable>
        </View>)}
      </View>
      {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{error}</Text> : null}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.scrim}>
          <ScrollView style={[styles.dialog, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={[styles.title, textColor]}>Fechas de la salida</Text>
            <View style={styles.row}>
              {(['start', 'end'] as const).map((item) => <Animated.View key={item} style={[styles.column, styles.dateTab, {
                backgroundColor: focusTransition.interpolate({ inputRange: [0, 1], outputRange: item === 'start' ? [theme.colors.primarySoft, theme.colors.inputBackground] : [theme.colors.inputBackground, theme.colors.primarySoft] }),
                borderColor: focusTransition.interpolate({ inputRange: [0, 1], outputRange: item === 'start' ? [theme.colors.primary, theme.colors.border] : [theme.colors.border, theme.colors.primary] }),
              }]}>
                <Pressable accessibilityRole="button" accessibilityLabel={`${item === 'start' ? 'Desde' : 'Hasta'}: ${display(item === 'start' ? start : end)}`} accessibilityState={{ selected: item === part }} disabled={item === 'end' && !start} onPress={() => setPart(item)}
                  style={({ pressed }) => [styles.button, { borderWidth: 0, gap: 8, opacity: pressed ? 0.7 : 1 }]}>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{item === 'start' ? 'Desde' : 'Hasta'}</Text>
                <Text style={[theme.typography.bodySmall, textColor]}>{display(item === 'start' ? start : end)}</Text>
                </Pressable>
              </Animated.View>)}
            </View>
            {visible ? <CalendarPanel value={(part === 'start' ? start : end || start) || key(new Date())} onChange={select} min={part === 'end' ? start : undefined} rangeStart={start} rangeEnd={end} /> : null}
            <View style={styles.row}>
              <Pressable accessibilityRole="button" onPress={() => setVisible(false)} style={[styles.column, styles.button, { borderColor: theme.colors.border }]}><Text style={textColor}>Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={!valid} onPress={() => {
                onStartDateChange(localDate(start, startDate));
                onEndDateChange(localDate(end, endDate));
                setVisible(false);
              }} style={[styles.column, styles.button, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, opacity: valid ? 1 : 0.45 }]}><Text style={{ color: theme.colors.textInverse, fontWeight: '600' }}>Confirmar rango</Text></Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  column: { flexGrow: 1, flexBasis: 130, gap: 8, minWidth: 0 },
  button: { minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', padding: 20, alignItems: 'center', justifyContent: 'center' },
  dialog: { width: '100%', maxWidth: 440, maxHeight: '95%', flexGrow: 0, borderWidth: 1, borderRadius: 20 },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  dateTab: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
});
