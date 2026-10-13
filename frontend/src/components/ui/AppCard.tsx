import {
  ReactNode,
} from 'react';

import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AppCard({
  children,
  style,
}: AppCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.base,

        {
          padding:
            theme.card.padding,

          borderRadius:
            theme.card
              .borderRadius,

          borderWidth:
            theme.card
              .borderWidth,

          borderColor:
            theme.colors.border,

          backgroundColor:
            theme.colors.surface,
        },

        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles =
  StyleSheet.create({
    base: {
      width: '100%',
    },
  });