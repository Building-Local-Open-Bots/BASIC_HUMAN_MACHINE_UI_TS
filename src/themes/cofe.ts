import type { Theme } from './types';

/**
 * Cofe — Warm and editorial.
 * Baskerville + Franklin, amber tones, soft shadows.
 */
export const cofe: Theme = {
  fonts: {
    human:   '"Libre Baskerville", serif',
    display: '"Libre Franklin", sans-serif',
    machine: '"Fira Code", monospace',
  },
  colors: {
    light: {
      primary:         '#92400e',
      onPrimary:       '#ffffff',
      secondary:       '#fbbf24',
      background:      '#fffbeb',
      surface:         '#fef3c7',
      surfaceElevated: '#ffffff',
      border:          '#fde68a',
      textPrimary:     '#1c1917',
      textDefault:     'rgba(28,25,23,0.85)',
      textSubtle:      'rgba(28,25,23,0.50)',
    },
    dark: {
      primary:         '#d97706',
      onPrimary:       '#000000',
      secondary:       '#fde047',
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
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 12px rgba(0,0,0,0.15)',
  },
};
