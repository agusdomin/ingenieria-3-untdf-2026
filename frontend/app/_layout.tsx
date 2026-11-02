import {
  Stack,
  type ErrorBoundaryProps,
} from 'expo-router';

import { AppProviders } from '../src/providers/AppProviders';
import { ErrorFallback } from '../src/components/errors/ErrorFallback';

function ScreenErrorBoundary({
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
  screenErrorBoundary: ScreenErrorBoundary,
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
