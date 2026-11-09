export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  error?: string;
  disabled?: boolean;
}

export { DateRangePickerPanel as DateRangePicker } from './DateRangePickerPanel';
