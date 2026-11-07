import {
  Stack,
  type ErrorBoundaryProps,
} from 'expo-router';

import { AppProviders } from '../src/providers/AppProviders';
import { View } from 'react-native';
import { OfflineBanner } from '../src/components/network/OfflineBanner';
import { ErrorFallback } from '../src/components/errors/ErrorFallback';

// Expo Router wraps the root layout, including AppProviders, with this boundary.
export function ErrorBoundary({
  retry,
}: ErrorBoundaryProps) {
  return (
    <ErrorFallback
      onRetry={() => {
        void retry();
      }}
    />
  );
}

export const unstable_settings = {
  screenErrorBoundary: ErrorBoundary,
};

export default function RootLayout() {
  return (
    <AppProviders>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
        <OfflineBanner />
      </View>
    </AppProviders>
  );
}
