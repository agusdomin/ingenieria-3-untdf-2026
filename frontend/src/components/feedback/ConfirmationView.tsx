
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppButton } from '../ui/AppButton';
import { AppText } from '../ui/AppText';
import { useTheme } from '../../theme/useTheme';

interface ConfirmationViewProps {
  title: string;
  message?: string;
  buttonLabel: string;
  onAction: () => void;
}

export function ConfirmationView({
  title,
  message,
  buttonLabel,
  onAction,
}: ConfirmationViewProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* Ícono de confirmación */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.colors.success,
          },
        ]}
        accessibilityRole="image"
        accessibilityLabel="Operación completada correctamente"
      >
        <Text style={styles.checkmark}>✓</Text>
      </View>

      {/* Título */}
      <AppText
        variant="heading"
        color="primary"
        style={styles.title}
      >
        {title.toLocaleUpperCase()}
      </AppText>

      {/* Mensaje opcional */}
      {message ? (
        <AppText
          variant="body"
          color="secondary"
          style={styles.message}
        >
          {message}
        </AppText>
      ) : null}

      {/* Acción principal */}
      <AppButton
        title={buttonLabel}
        onPress={onAction}
        variant="primary"
        size="lg"
        style={styles.actionButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },

  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 60,
  },

  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  message: {
    textAlign: 'center',
    maxWidth: 400,
  },

  actionButton: {
    width: '100%',
    maxWidth: 400,
  },
});
