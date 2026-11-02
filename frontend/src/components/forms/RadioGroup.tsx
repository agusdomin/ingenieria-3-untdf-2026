import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: RadioGroupProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {label ? (
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View style={{ gap: theme.spacing.sm }}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{
                checked: selected,
                disabled,
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: error
                    ? theme.colors.danger
                    : selected
                      ? theme.colors.primary
                      : theme.colors.inputBorder,
                  backgroundColor: selected
                    ? theme.colors.primarySoft
                    : theme.colors.surface,
                  opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.inputBorder,
                  },
                ]}
              >
                {selected ? (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                ) : null}
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    theme.typography.body,
                    {
                      color: theme.colors.textPrimary,
                      fontWeight: selected ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>

                {option.description ? (
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: theme.colors.textMuted },
                    ]}
                  >
                    {option.description}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.danger },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
});