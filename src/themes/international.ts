import type { Theme } from './types';

/**
 * International — Universal readability.
 * Noto family covers all scripts. Cyan accent.
 */
export const international: Theme = {
  fonts: {
    human:   '"Noto Serif", serif',
    display: '"Noto Sans", sans-serif',
    machine: '"Noto Sans Mono", monospace',
  },
  colors: {
    light: {
      primary:         '#0891b2',
      onPrimary:       '#ffffff',
      secondary:       '#f2f0ef',
      background:      '#ffffff',
      surface:         '#f5f4f2',
      surfaceElevated: '#ffffff',
      border:          '#e7e5e4',
      textPrimary:     '#000000',
      textDefault:     'rgba(0,0,0,0.80)',
      textSubtle:      'rgba(0,0,0,0.50)',
    },
    dark: {
      primary:         '#06b6d4',
      onPrimary:       '#000000',
      secondary:       '#57534e',
      background:      '#000000',
      surface:         '#1c1917',
      surfaceElevated: '#292524',
      border:          'rgba(255,255,255,0.12)',
      textPrimary:     '#ffffff',
      textDefault:     'rgba(255,255,255,0.87)',
      textSubtle:      'rgba(255,255,255,0.54)',
    },
  },
  radius: {
    s:    '2px',
    m:    '6px',
    l:    '10px',
    xl:   '16px',
    full: '9999px',
  },
  shadow: {
    sm: 'none',
    md: 'none',
  },
};
