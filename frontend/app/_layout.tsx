import {
  Stack,
  type ErrorBoundaryProps,
} from 'expo-router';

import { AppProviders } from '../src/providers/AppProviders';
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
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
