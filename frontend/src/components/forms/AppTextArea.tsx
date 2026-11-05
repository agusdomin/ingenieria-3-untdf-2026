import { useState } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface AppTextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCounter?: boolean;
  numberOfLines?: number;
}

export function AppTextArea({
  label,
  error,
  helperText,
  maxLength = 500,
  showCounter = true,
  numberOfLines = 4,
  value,
  onChangeText,
  onFocus,
  onBlur,
  multiline = true,
  ...props
}: AppTextAreaProps) {
  const { theme } = useTheme();

  const [focused, setFocused] = useState(false);

  const currentLength = value?.length ?? 0;

  const handleChangeText = (text: string) => {
    const limitedText =
      maxLength !== undefined
        ? text.slice(0, maxLength)
        : text;

    onChangeText?.(limitedText);
  };

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label && (
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        value={value}
        onChangeText={handleChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        scrollEnabled
        maxLength={maxLength}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        placeholderTextColor={theme.colors.inputPlaceholder}
        style={[
          styles.input,
          {
            minHeight: theme.input.height * numberOfLines,
            borderRadius: theme.input.borderRadius,
            borderWidth: theme.input.borderWidth,
            paddingHorizontal: theme.input.paddingHorizontal,
            paddingVertical: theme.spacing.md,
            backgroundColor: theme.colors.inputBackground,
            borderColor: error
              ? theme.colors.danger
              : focused
                ? theme.colors.primary
                : theme.colors.inputBorder,
            color: theme.colors.textPrimary,
          },
          props.style,
        ]}
      />

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          {error ? (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.danger },
              ]}
            >
              {error}
            </Text>
          ) : helperText ? (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              {helperText}
            </Text>
          ) : null}
        </View>

        {showCounter && (
          <Text
            style={[
              theme.typography.caption,
              {
                color:
                  currentLength >= maxLength
                    ? theme.colors.danger
                    : theme.colors.textMuted,
              },
            ]}
          >
            {currentLength}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
});