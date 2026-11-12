import { DateTimePickerField } from './DateTimePickerField';

export interface AppTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (time: Date) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Reloj personalizado de 24 h compartido por web, Android e iOS. */
export function AppTimePicker(props: AppTimePickerProps) {
  return <DateTimePickerField {...props} mode="time" />;
}
