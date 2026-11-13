
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { NewObservationScreen } from '../../../../src/screens/map/NewObservationScreen';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useTheme } from '../../../../src/theme/useTheme';

export default function NewObservationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(tabs)/usuario" />;
  }

  return <NewObservationScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
