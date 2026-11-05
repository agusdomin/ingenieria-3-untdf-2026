import { ReactElement } from 'react';

import {
  Controller,
  Control,
  FieldValues,
  FieldPath,
  ControllerRenderProps,
} from 'react-hook-form';

interface ControlledFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  render: (
    field: ControllerRenderProps<TFieldValues, TName>,
    error?: string,
  ) => ReactElement;
}

export function ControlledField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  render,
}: ControlledFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        render(field, fieldState.error?.message)
      }
    />
  );
}