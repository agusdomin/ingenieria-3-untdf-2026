import { useState } from 'react';

import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '../../theme/useTheme';

interface AppTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (time: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function AppTimePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Seleccioná un horario',
  disabled = false,
}: AppTimePickerProps) {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);
  const [temporaryTime, setTemporaryTime] = useState(
    value ?? new Date(),
  );

  const openPicker = () => {
    if (disabled) return;

    setTemporaryTime(value ?? new Date());
    setVisible(true);
  };

  const closePicker = () => {
    setVisible(false);
  };

  const confirmTime = () => {
    onChange(temporaryTime);
    closePicker();
  };

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text
        style={[
          theme.typography.bodySmall,
          { color: theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre el selector de horario"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.timeField,
          {
            height: theme.input.height,
            borderRadius: theme.input.borderRadius,
            borderWidth: theme.input.borderWidth,
            paddingHorizontal: theme.input.paddingHorizontal,
            backgroundColor: theme.colors.inputBackground,
            borderColor: error
              ? theme.colors.danger
              : pressed
                ? theme.colors.primary
                : theme.colors.inputBorder,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.body,
            {
              flex: 1,
              color: value
                ? theme.colors.textPrimary
                : theme.colors.inputPlaceholder,
            },
          ]}
        >
          {value ? formatTime(value) : placeholder}
        </Text>

        <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>
          ◷
        </Text>
      </Pressable>

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

      {Platform.OS === 'android' && visible ? (
        <DateTimePicker
          value={temporaryTime}
          mode="time"
          display="clock"
          is24Hour
          onValueChange={(_, selectedTime) => {
            if (selectedTime) {
              onChange(selectedTime);
              setVisible(false);
            }
          }}
          onDismiss={() => setVisible(false)}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={closePicker}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={[
                styles.overlay,
                { backgroundColor: theme.colors.overlay },
              ]}
              onPress={closePicker}
              accessibilityLabel="Cerrar selector de horario"
            />

            <View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: theme.colors.surface,
                  borderTopLeftRadius:
                    theme.bottomSheet.borderTopLeftRadius,
                  borderTopRightRadius:
                    theme.bottomSheet.borderTopRightRadius,
                  padding: theme.bottomSheet.padding,
                },
              ]}
            >
              <View style={styles.header}>
                <Text
                  style={[
                    theme.typography.subheading,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  {label}
                </Text>

                <Pressable
                  onPress={closePicker}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                >
                  <Text style={{ color: theme.colors.textSecondary }}>
                    ✕
                  </Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={temporaryTime}
                mode="time"
                display="spinner"
                is24Hour
                onValueChange={(_, selectedTime) => {
                  if (selectedTime) {
                    setTemporaryTime(selectedTime);
                  }
                }}
                themeVariant={theme.mode}
              />

              <Pressable
                onPress={confirmTime}
                style={[
                  styles.confirmButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    theme.typography.button,
                    { color: theme.colors.textInverse },
                  ]}
                >
                  Confirmar horario
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  timeField: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  bottomSheet: {
    width: '100%',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});