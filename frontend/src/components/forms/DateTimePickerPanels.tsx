import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

const pad = (n: number) => String(n).padStart(2, '0');

export function CalendarPanel({ value, onChange, min, max, rangeStart, rangeEnd }: { value: string; onChange: (value: string) => void; min?: string; max?: string; rangeStart?: string; rangeEnd?: string }) {
  const { theme } = useTheme();
  const [month, setMonth] = useState(() => {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1);
  });
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <View style={styles.panel}>
      <View style={styles.heading}>
        <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={[styles.nav, { borderColor: theme.colors.border }]}><Text style={[styles.arrow, { color: theme.colors.primary }]}>‹</Text></Pressable>
        <Text accessibilityLiveRegion="polite" style={[theme.typography.body, styles.month, { color: theme.colors.textPrimary }]}>{month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={[styles.nav, { borderColor: theme.colors.border }]}><Text style={[styles.arrow, { color: theme.colors.primary }]}>›</Text></Pressable>
      </View>
      <View style={[styles.calendar, { borderColor: theme.colors.border }]}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <View key={`heading-${index}`} style={styles.day}><Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{day}</Text></View>)}
        {Array.from({ length: offset }, (_, i) => <View key={`blank-${i}`} style={styles.day} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month.getFullYear()}-${pad(month.getMonth() + 1)}-${pad(i + 1)}`;
          const disabled = Boolean((min && date < min) || (max && date > max));
          const selected = rangeStart ? date === rangeStart || date === rangeEnd : value === date;
          const inRange = Boolean(rangeStart && rangeEnd && date > rangeStart && date < rangeEnd);
          const hasRange = Boolean(rangeStart && rangeEnd && rangeEnd > rangeStart);
          return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${i + 1} de ${month.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`} accessibilityState={{ selected, disabled }} disabled={disabled}
            onPress={() => onChange(date)} style={({ pressed }) => [styles.day, {
              borderTopLeftRadius: selected && (!hasRange || date === rangeStart) ? 10 : 0,
              borderBottomLeftRadius: selected && (!hasRange || date === rangeStart) ? 10 : 0,
              borderTopRightRadius: selected && (!hasRange || date === rangeEnd) ? 10 : 0,
              borderBottomRightRadius: selected && (!hasRange || date === rangeEnd) ? 10 : 0,
              backgroundColor: selected ? theme.colors.primary : inRange ? theme.colors.primarySoft : pressed ? theme.colors.surfaceSecondary : 'transparent', opacity: disabled ? 0.3 : 1,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            }]}>
            <Text style={[theme.typography.body, { color: selected ? theme.colors.textInverse : theme.colors.textPrimary, fontVariant: ['tabular-nums'] }]}>{i + 1}</Text>
          </Pressable>;
        })}
      </View>
    </View>
  );
}

export function ClockPanel({ value, part, onChange, onPartChange }: { value: string; part: number; onChange: (value: string) => void; onPartChange: (part: number) => void }) {
  const { theme } = useTheme();
  const [transition] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    transition.stopAnimation();
    if (reduceMotion) { transition.setValue(1); return; }
    transition.setValue(0);
    const animation = Animated.timing(transition, { toValue: 1, duration: 180, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [part, reduceMotion, transition]);
  const current = Number(value.split(':')[part]);
  const hour = part === 0;
  const radius = hour && current >= 12 ? 70 : 112;
  const angle = (hour ? current % 12 : current / 5) * Math.PI / 6;
  function select(number: number, advance = false) {
    const parts = value.split(':');
    parts[part] = pad(number);
    onChange(parts.join(':'));
    if (hour && advance) onPartChange(1);
  }
  return (
    <View style={styles.panel}>
      <Animated.View style={[styles.clock, { backgroundColor: theme.colors.surfaceSecondary, opacity: transition.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ scale: transition.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${angle}rad` }] }]}>
          <View style={{ position: 'absolute', bottom: '50%', left: '50%', width: 2, marginLeft: -1, height: `${radius / 280 * 100}%`, backgroundColor: theme.colors.primary }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', width: 8, height: 8, marginLeft: -4, marginTop: -4, borderRadius: 4, backgroundColor: theme.colors.primary }} />
        {Array.from({ length: hour ? 24 : 12 }, (_, index) => {
          const number = hour ? index : index * 5;
          const angle = (index % 12) * Math.PI / 6;
          const radius = hour && index >= 12 ? 25 : 40;
          const selected = current === number;
          return <Pressable key={number} accessibilityRole="button" accessibilityLabel={`${pad(number)} ${hour ? 'horas' : 'minutos'}`} accessibilityState={{ selected }} onPress={() => select(number, true)}
            style={({ pressed }) => [styles.clockNumber, { left: `${50 + Math.sin(angle) * radius}%`, top: `${50 - Math.cos(angle) * radius}%`, backgroundColor: selected ? theme.colors.primary : 'transparent', opacity: pressed ? 0.65 : 1 }]}>
            <Text style={[styles.number, { color: selected ? theme.colors.textInverse : hour && index >= 12 ? theme.colors.textSecondary : theme.colors.textPrimary }]}>{pad(number)}</Text>
          </Pressable>;
        })}
      </Animated.View>
      {!hour ? <View style={styles.precision}>
        <Pressable accessibilityRole="button" accessibilityLabel="Restar un minuto" onPress={() => select((current + 59) % 60)} style={[styles.nav, { borderColor: theme.colors.border }]}><Text style={[styles.arrow, { color: theme.colors.primary }]}>−</Text></Pressable>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>Ajuste de 1 minuto</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sumar un minuto" onPress={() => select((current + 1) % 60)} style={[styles.nav, { borderColor: theme.colors.border }]}><Text style={[styles.arrow, { color: theme.colors.primary }]}>+</Text></Pressable>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  month: { flex: 1, textAlign: 'center', textTransform: 'capitalize', fontWeight: '600' },
  nav: { minWidth: 44, minHeight: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 26 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 12, padding: 6, overflow: 'hidden' },
  day: { width: '14.285714%', minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  clock: { width: '100%', maxWidth: 280, aspectRatio: 1, borderRadius: 140, alignSelf: 'center' },
  clockNumber: { position: 'absolute', width: 36, height: 36, marginLeft: -18, marginTop: -18, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  precision: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
});
