import { StyleSheet, View } from 'react-native';

import { AuthForm } from '../../src/components/auth/AuthForm';
import { useTheme } from '../../src/theme/useTheme';

export default function RegisterScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <AuthForm initialMode="register" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 430, alignSelf: 'center', padding: 24, borderRadius: 26, borderWidth: 1 },
});
