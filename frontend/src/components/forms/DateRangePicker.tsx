
import { View, Text } from 'react-native';

import { AppDatePicker } from './AppDatePicker';
import { useTheme } from '../../theme/useTheme';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  error?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
  disabled = false,
}: DateRangePickerProps) {
  const { theme } = useTheme();

  const invalidRange =
    startDate !== null &&
    endDate !== null &&
     new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
    ).getTime() <
        new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        ).getTime();

  const rangeError = invalidRange
    ? 'La fecha hasta debe ser posterior o igual a la fecha desde.'
    : error;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppDatePicker
            label="Fecha desde"
            value={startDate}
            onChange={onStartDateChange}
            maximumDate={endDate ?? undefined}
            disabled={disabled}
          />
        </View>

        <View style={{ flex: 1 }}>
          <AppDatePicker
            label="Fecha hasta"
            value={endDate}
            onChange={onEndDateChange}
            minimumDate={startDate ?? undefined}
            disabled={disabled}
          />
        </View>
      </View>

      {rangeError ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.danger },
          ]}
        >
          {rangeError}
        </Text>
      ) : null}
    </View>
  );
}
