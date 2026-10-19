import { tokens } from './tokens';
import {
  riskColors,
  riskTextColors,
} from './colors';

export const darkTheme = {
  mode: 'dark' as const,

  colors: {
    background: '#08111A',

    surface: '#101B26',
    surfaceSecondary: '#162330',
    surfaceElevated: '#1C2A38',

    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textInverse: '#0F172A',

    border: '#2B3A49',
    divider: '#223140',

    primary: '#22D3EE',
    primaryPressed: '#06B6D4',
    primarySoft: '#123A43',

    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',

    inputBackground: '#1B2A38',
    inputBorder: '#45596B',
    inputPlaceholder: '#A7B4C2',

    navbarBackground: '#101B26',
    navbarBorder: '#223140',
    navbarActive: '#22D3EE',
    navbarInactive: '#94A3B8',

    iconPrimary: '#F8FAFC',
    iconSecondary: '#94A3B8',

    disabled: '#475569',
    disabledText: '#94A3B8',

    overlay: 'rgba(0,0,0,0.55)',
  },

  risk: riskColors,
  riskText: riskTextColors,

  ...tokens,
};
