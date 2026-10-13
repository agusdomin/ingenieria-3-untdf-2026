import {
    QueryClientProvider,
  } from '@tanstack/react-query';
  
  import { ReactNode } from 'react';
  
  import { queryClient } from '../api/queryClient';
  
  import { ThemeProvider } from '../theme/themeContext';
  
  interface Props {
    children: ReactNode;
  }
  
  export function AppProviders({
    children,
  }: Props) {
    return (
      <QueryClientProvider
        client={queryClient}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );
  }