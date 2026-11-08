
import { useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface AppStepperProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export function AppStepper({
  min,
  max,
  step,
  value,
  onChange,
  suffix,
  label,
  disabled = false,
  error,
}: AppStepperProps) {
  const { theme } = useTheme();

  // Estado temporal para permitir escribir en el campo.
  const [inputValue, setInputValue] = useState(String(value));

  
    const [isEditing, setIsEditing] = useState(false);
  const safeStep = step > 0 ? step : 1;
  const lowerLimit = Math.min(min, max);
  const upperLimit = Math.max(min, max);

  const normalize = (number: number) => {
    const clamped = Math.min(
      upperLimit,
      Math.max(lowerLimit, number),
    );

    return Number(clamped.toFixed(6));
  };

  const handleIncrement = () => {
    const nextValue = normalize(value + safeStep);

    onChange(nextValue);
    setInputValue(String(nextValue));
  };

  const handleDecrement = () => {
    const nextValue = normalize(value - safeStep);

    onChange(nextValue);
    setInputValue(String(nextValue));
  };

  const handleChangeText = (text: string) => {
    setInputValue(text);
  };

  const handleBlur = () => {
    const parsedValue = Number(inputValue.replace(',', '.'));

    // Si el campo está vacío o contiene un valor inválido,
    // recuperamos el último valor válido.
    if (inputValue.trim() === '' || !Number.isFinite(parsedValue)) {
      setInputValue(String(value));
      return;
    }

    // Limitamos el valor al rango permitido.
    const nextValue = normalize(parsedValue);

    onChange(nextValue);
    setInputValue(String(nextValue));
  };

  const decrementDisabled = disabled || value <= lowerLimit;
  const incrementDisabled = disabled || value >= upperLimit;

  return (
    <View style={{ gap: theme.spacing.xs }}>
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

      <View style={styles.container}>
        <Pressable
          onPress={handleDecrement}
          disabled={decrementDisabled}
          accessibilityRole="button"
          accessibilityLabel="Disminuir valor"
          accessibilityState={{ disabled: decrementDisabled }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: theme.input.borderRadius,
              opacity: decrementDisabled ? 0.4 : pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.colors.textPrimary },
            ]}
          >
            −
          </Text>
        </Pressable>

        <View
          style={[
            styles.inputContainer,
            {
              height: theme.input.height,
              borderRadius: theme.input.borderRadius,
              borderWidth: theme.input.borderWidth,
              backgroundColor: theme.colors.inputBackground,
              borderColor: error
                ? theme.colors.danger
                : theme.colors.inputBorder,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
        >
          <TextInput
  value={isEditing ? inputValue : String(value)}
  onFocus={() => {
    setInputValue(String(value));
    setIsEditing(true);
  }}
  onChangeText={setInputValue}
  onBlur={() => {
    handleBlur();
    setIsEditing(false);
  }}
  editable={!disabled}
  keyboardType="decimal-pad"
  selectTextOnFocus
  accessibilityLabel={label ?? 'Valor numérico'}
  style={[
    styles.input,
    theme.typography.body,
    { color: theme.colors.textPrimary },
  ]}
/>

          {suffix ? (
            <Text
              style={[
                theme.typography.bodySmall,
                { color: theme.colors.textSecondary },
              ]}
            >
              {suffix}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleIncrement}
          disabled={incrementDisabled}
          accessibilityRole="button"
          accessibilityLabel="Aumentar valor"
          accessibilityState={{ disabled: incrementDisabled }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: theme.input.borderRadius,
              opacity: incrementDisabled ? 0.4 : pressed ? 0.6 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.colors.textPrimary },
            ]}
          >
            +
          </Text>
        </Pressable>
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    textAlign: 'center',
    padding: 0,
  },
});
