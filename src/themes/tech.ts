import type { Theme } from './types';

/**
 * Tech — Clean and professional.
 * Source family (Adobe), blue accent, slate palette.
 */
export const tech: Theme = {
  fonts: {
    human:   '"Source Serif Pro", serif',
    display: '"Source Sans Pro", sans-serif',
    machine: '"Source Code Pro", monospace',
  },
  colors: {
    light: {
      primary:         '#1d4ed8',
      onPrimary:       '#ffffff',
      secondary:       '#e2e8f0',
      background:      '#f8fafc',
      surface:         '#ffffff',
      surfaceElevated: '#ffffff',
      border:          '#e2e8f0',
      textPrimary:     '#0f172a',
      textDefault:     'rgba(15,23,42,0.80)',
      textSubtle:      'rgba(15,23,42,0.50)',
    },
    dark: {
      primary:         '#3b82f6',
      onPrimary:       '#000000',
      secondary:       '#64748b',
      background:      '#1e293b',
      surface:         '#0f172a',
      surfaceElevated: '#1e293b',
      border:          'rgba(255,255,255,0.10)',
      textPrimary:     '#f8fafc',
      textDefault:     'rgba(248,250,252,0.87)',
      textSubtle:      'rgba(248,250,252,0.50)',
    },
  },
  radius: {
    s:    '2px',
    m:    '4px',
    l:    '8px',
    xl:   '12px',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
  },
};
