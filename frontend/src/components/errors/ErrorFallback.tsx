import { useContext } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ThemeContext } from '../../theme/themeContext';
import { lightTheme } from '../../theme/lightTheme';

interface ErrorFallbackProps {
  onRetry: () => void;
}

export function ErrorFallback({
  onRetry,
}: ErrorFallbackProps) {
  // The root recovery screen renders outside AppProviders when they fail.
  const theme = useContext(ThemeContext)?.theme ?? lightTheme;

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
        Ocurrió un problema inesperado
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
        accessibilityRole="button"
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
