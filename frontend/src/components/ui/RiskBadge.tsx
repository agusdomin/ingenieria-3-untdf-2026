import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  RiskLevel,
} from '../../theme/types';

import { useTheme } from '../../theme/useTheme';

interface RiskBadgeProps {
  level: RiskLevel;
}

const labels: Record<
  RiskLevel,
  string
> = {
  extremo: 'Extremo',
  alto: 'Alto',
  considerable:
    'Considerable',
  moderado: 'Moderado',
  bajo: 'Bajo',
};

export function RiskBadge({
  level,
}: RiskBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,

        {
          backgroundColor:
            theme.risk[level],

          borderRadius:
            theme.badge
              .borderRadius,

          paddingHorizontal:
            theme.badge
              .paddingHorizontal,

          paddingVertical:
            theme.badge
              .paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.caption,
          {
            color:
              theme.riskText[
                level
              ],

            fontWeight:
              '600',
          },
        ]}
      >
        {labels[level]}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      alignSelf:
        'flex-start',
    },
  });