import {
  ReactNode,
} from 'react';

import {
  Text,
  TextStyle,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

type TextVariant =
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodySmall'
  | 'caption';

type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'danger'
  | 'success';

interface AppTextProps {
  children: ReactNode;

  variant?: TextVariant;
  color?: TextColor;

  style?: TextStyle;
}

export function AppText({
  children,

  variant = 'body',
  color = 'primary',

  style,
}: AppTextProps) {
  const { theme } = useTheme();

  const colors = {
    primary:
      theme.colors
        .textPrimary,

    secondary:
      theme.colors
        .textSecondary,

    muted:
      theme.colors
        .textMuted,

    danger:
      theme.colors.danger,

    success:
      theme.colors.success,
  };

  return (
    <Text
      style={[
        theme.typography[
          variant
        ],

        {
          color:
            colors[color],
        },

        style,
      ]}
    >
      {children}
    </Text>
  );
}