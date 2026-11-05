
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

interface AppDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function AppDatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Seleccioná una fecha',
  disabled = false,
  minimumDate,
  maximumDate,
}: AppDatePickerProps) {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);
  const [temporaryDate, setTemporaryDate] = useState(
    value ?? new Date()
  );

  const openPicker = () => {
    if (disabled) return;

    setTemporaryDate(value ?? new Date());
    setVisible(true);
  };

  const closePicker = () => {
    setVisible(false);
  };


  const confirmDate = () => {
    onChange(temporaryDate);
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
        accessibilityHint="Abre el selector de fecha"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.dateField,
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
          {value ? formatDate(value) : placeholder}
        </Text>

        <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>
          ▦
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
            value={temporaryDate}
            mode="date"
            display="default"
            onValueChange={(_, selectedDate) => {
            if (selectedDate) {
                onChange(selectedDate);
                setVisible(false);
            }
            }}
            onDismiss={() => setVisible(false)}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
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
              accessibilityLabel="Cerrar selector de fecha"
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
                value={temporaryDate}
                mode="date"
                display="spinner"
                onValueChange={(_, selectedDate) => {
                    if (selectedDate) {
                    setTemporaryDate(selectedDate);
                    }
                }}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant={theme.mode}
            />

              <Pressable
                onPress={confirmDate}
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
                  Confirmar fecha
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
  dateField: {
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
