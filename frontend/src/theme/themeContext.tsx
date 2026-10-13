import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import AsyncStorage from
  '@react-native-async-storage/async-storage';

import {
  darkTheme,
} from './darkTheme';

import {
  lightTheme,
} from './lightTheme';

import {
  AppTheme,
  ThemeMode,
} from './types';

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (
    mode: ThemeMode
  ) => void;
}

export const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined
  );

const THEME_STORAGE_KEY =
  'app_theme_mode';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: Props) {
  const systemTheme =
    useColorScheme();

  const [
    mode,
    setModeState,
  ] = useState<ThemeMode>(
    'system'
  );

  useEffect(() => {
    AsyncStorage
      .getItem(
        THEME_STORAGE_KEY
      )
      .then((saved) => {
        if (
          saved === 'light' ||
          saved === 'dark' ||
          saved === 'system'
        ) {
          setModeState(saved);
        }
      });
  }, []);

  const setMode = (
    newMode: ThemeMode
  ) => {
    setModeState(newMode);

    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      newMode
    );
  };

  const resolvedMode =
    mode === 'system'
      ? systemTheme === 'light'
        ? 'light'
        : 'dark'
      : mode;

  const theme =
    resolvedMode === 'light'
      ? lightTheme
      : darkTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode,
    }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}