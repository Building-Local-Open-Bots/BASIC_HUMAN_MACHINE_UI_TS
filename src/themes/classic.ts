import type { Theme } from './types';

/**
 * Classic — BLOB house style.
 * Neutral palette, Roboto family, soft rounded corners.
 */
export const classic: Theme = {
  fonts: {
    human:   '"Roboto Serif", serif',
    display: '"Roboto", sans-serif',
    machine: '"Roboto Mono", monospace',
  },
  colors: {
    light: {
      primary:         '#000000',
      onPrimary:       '#ffffff',
      secondary:       '#ffffff',
      background:      '#f5f5f5',
      surface:         '#ffffff',
      surfaceElevated: '#ffffff',
      border:          '#e5e5e5',
      textPrimary:     '#000000',
      textDefault:     'rgba(0,0,0,0.80)',
      textSubtle:      'rgba(0,0,0,0.50)',
    },
    dark: {
      primary:         '#ffffff',
      onPrimary:       '#000000',
      secondary:       '#000000',
      background:      '#44403c',
      surface:         '#292524',
      surfaceElevated: '#1c1917',
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
