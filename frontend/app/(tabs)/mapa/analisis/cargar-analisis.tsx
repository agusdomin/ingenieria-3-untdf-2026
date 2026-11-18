import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';

import { NewAnalysisReportScreen } from '../../../../src/screens/map/NewAnalysisReportScreen';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { useTheme } from '../../../../src/theme/useTheme';

export default function NewAnalysisReportPage() {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
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

  if (!hasRole(['observador_experto', 'administrador'])) {
    return <Redirect href="/(tabs)/mapa" />;
  }

  return <NewAnalysisReportScreen />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
