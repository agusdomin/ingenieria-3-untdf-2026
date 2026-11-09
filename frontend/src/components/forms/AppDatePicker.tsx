import { DateTimePickerField } from './DateTimePickerField';

export interface AppDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

/** Calendario personalizado compartido por web, Android e iOS. */
export function AppDatePicker(props: AppDatePickerProps) {
  return <DateTimePickerField {...props} mode="date" />;
}
