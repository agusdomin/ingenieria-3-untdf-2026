import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useState } from 'react';

import { useTheme } from '../../theme/useTheme';

interface AppInputProps
  extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function AppInput({
  label,
  error,
  helperText,
  ...props
}: AppInputProps) {
  const { theme } = useTheme();

  const [
    focused,
    setFocused,
  ] = useState(false);

  return (
    <View
      style={{
        gap:
          theme.spacing.xs,
      }}
    >
      {label && (
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        onFocus={(event) => {
          setFocused(true);

          props.onFocus?.(
            event
          );
        }}
        onBlur={(event) => {
          setFocused(false);

          props.onBlur?.(
            event
          );
        }}
        placeholderTextColor={
          theme.colors
            .inputPlaceholder
        }
        style={[
          styles.input,

          {
            height:
              theme.input.height,

            borderRadius:
              theme.input
                .borderRadius,

            borderWidth:
              theme.input
                .borderWidth,

            paddingHorizontal:
              theme.input
                .paddingHorizontal,

            backgroundColor:
              theme.colors
                .inputBackground,

            borderColor: error
              ? theme.colors.danger
              : focused
              ? theme.colors.primary
              : theme.colors
                  .inputBorder,

            color:
              theme.colors
                .textPrimary,
          },

          props.style,
        ]}
      />

      {error ? (
        <Text
          style={[
            theme.typography.caption,
            {
              color:
                theme.colors
                  .danger,
            },
          ]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            theme.typography.caption,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    input: {
      width: '100%',
    },
  });