import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { queryClient } from '../api/queryClient';
import { ThemeProvider } from '../theme/themeContext';
import { AuthProvider } from '../contexts/AuthContext'; 

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}