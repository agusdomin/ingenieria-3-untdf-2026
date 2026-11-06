import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../../theme/useTheme';

interface ErrorFallbackProps {
  onRetry: () => void;
}

export function ErrorFallback({
  onRetry,
}: ErrorFallbackProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.heading,
          {
            color:
              theme.colors.textPrimary,
          },
        ]}
      >
        Ocurrió un error
      </Text>

      <Text
        style={[
          theme.typography.body,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        No pudimos cargar esta pantalla.
      </Text>

      <Pressable
        onPress={onRetry}
        style={[
          styles.button,
          {
            backgroundColor:
              theme.colors.primary,
            borderRadius:
              theme.button.md.borderRadius,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.button,
            {
              color:
                theme.colors.textInverse,
            },
          ]}
        >
          Reintentar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});