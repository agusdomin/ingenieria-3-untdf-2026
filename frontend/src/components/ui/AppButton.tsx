import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger';

type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;

  variant?: ButtonVariant;
  size?: ButtonSize;

  disabled?: boolean;
  loading?: boolean;

  style?: ViewStyle;
}

export function AppButton({
  title,
  onPress,

  variant = 'primary',
  size = 'md',

  disabled = false,
  loading = false,

  style,
}: AppButtonProps) {
  const { theme } = useTheme();

  const buttonSize =
    theme.button[size];

  const getBackgroundColor = (
    pressed: boolean
  ) => {
    if (disabled) {
      return theme.colors.disabled;
    }

    if (variant === 'danger') {
      return theme.colors.danger;
    }

    if (variant === 'secondary') {
      return theme.colors.surfaceSecondary;
    }

    return pressed
      ? theme.colors.primaryPressed
      : theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.disabledText;
    }

    if (variant === 'secondary') {
      return theme.colors.textPrimary;
    }

    return theme.colors.textInverse;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={
        disabled ||
        loading
      }
      style={({ pressed }) => [
        styles.base,

        {
          height:
            buttonSize.height,

          borderRadius:
            buttonSize.borderRadius,

          backgroundColor:
            getBackgroundColor(
              pressed
            ),

          paddingHorizontal:
            theme.spacing.lg,

          borderWidth:
            variant ===
            'secondary'
              ? 1
              : 0,

          borderColor:
            theme.colors.border,
        },

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
        />
      ) : (
        <Text
          style={[
            theme.typography.button,
            {
              color:
                getTextColor(),
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent:
        'center',
    },
  });