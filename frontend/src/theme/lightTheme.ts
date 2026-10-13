import { tokens } from './tokens';
import {
  riskColors,
  riskTextColors,
} from './colors';

export const lightTheme = {
  mode: 'light' as const,

  colors: {
    background: '#F4F7FA',

    surface: '#FFFFFF',
    surfaceSecondary: '#EAF0F5',
    surfaceElevated: '#F8FAFC',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',

    border: '#D7E0E8',
    divider: '#E2E8F0',

    primary: '#16C7E8',
    primaryPressed: '#0EA5C6',
    primarySoft: '#DDF8FD',

    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#0EA5E9',

    inputBackground: '#F1F5F9',
    inputBorder: '#CBD5E1',
    inputPlaceholder: '#94A3B8',

    navbarBackground: '#FFFFFF',
    navbarBorder: '#E2E8F0',
    navbarActive: '#16C7E8',
    navbarInactive: '#64748B',

    iconPrimary: '#0F172A',
    iconSecondary: '#64748B',

    disabled: '#CBD5E1',
    disabledText: '#94A3B8',

    overlay: 'rgba(15,23,42,0.35)',
  },

  risk: riskColors,
  riskText: riskTextColors,

  ...tokens,
};