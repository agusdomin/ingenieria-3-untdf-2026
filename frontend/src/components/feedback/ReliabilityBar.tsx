
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface ReliabilityBarProps {
  reliable: number;
  medium: number;
  inaccurate: number;
  total: number;
}

export function ReliabilityBar({
  reliable,
  medium,
  inaccurate,
  total,
}: ReliabilityBarProps) {
  const { theme } = useTheme();

  // Calculamos el porcentaje de valoraciones confiables.
  const percentage =
    total > 0
      ? Math.round((reliable / total) * 100)
      : 0;

  // Evitamos que el porcentaje salga del rango 0-100.
  const safePercentage = Math.min(
    100,
    Math.max(0, percentage),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.percentage,
            { color: theme.colors.success },
          ]}
        >
          {safePercentage}%
        </Text>

        <Text
          style={[
            styles.label,
            { color: theme.colors.textPrimary },
          ]}
        >
          Valoraciones confiables
        </Text>
      </View>

      <View
        style={[
          styles.progressBackground,
          { backgroundColor: theme.colors.surfaceSecondary },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: safePercentage,
        }}
        accessibilityLabel="Porcentaje de valoraciones confiables"
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${safePercentage}%`,
              backgroundColor: theme.colors.success,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.total,
          { color: theme.colors.textSecondary },
        ]}
      >
        {total} {total === 1 ? 'valoración' : 'valoraciones'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentage: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  total: {
    fontSize: 12,
  },
});
