import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useTheme } from '../../theme/useTheme';

interface WizardHeaderProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export function WizardHeader({
  title,
  currentStep,
  totalSteps,
  onBack,
}: WizardHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Volver desde ${title}`}
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.65 : 1 },
        ]}
      >
        <SymbolView
          name={{
            ios: 'chevron.left',
            android: 'arrow_back',
            web: 'arrow_back',
          }}
          size={22}
          tintColor={theme.colors.textPrimary}
        />

        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          {title}
        </Text>
      </Pressable>

      <Text
        style={[
          styles.step,
          { color: theme.colors.textSecondary },
        ]}
      >
        Paso {currentStep} de {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  step: {
    fontSize: 13,
    fontWeight: '600',
  },
});