import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export type AppTheme =
  | typeof darkTheme
  | typeof lightTheme;

export type ThemeMode =
  | 'light'
  | 'dark'
  | 'system';

export type RiskLevel =
  | 'extremo'
  | 'alto'
  | 'considerable'
  | 'moderado'
  | 'bajo';

