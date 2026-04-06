import type { Theme } from './types';

/**
 * Funky — Bold and playful.
 * PT family, teal + fuchsia, warm amber background.
 */
export const funky: Theme = {
  fonts: {
    human:   '"PT Serif", serif',
    display: '"PT Sans", sans-serif',
    machine: '"PT Mono", monospace',
  },
  colors: {
    light: {
      primary:         '#14b8a6',
      onPrimary:       '#ffffff',
      secondary:       '#f0abfc',
      background:      '#fffbeb',
      surface:         '#ffffff',
      surfaceElevated: '#ffffff',
      border:          '#e7e5e4',
      textPrimary:     '#1c1917',
      textDefault:     'rgba(28,25,23,0.85)',
      textSubtle:      'rgba(28,25,23,0.50)',
    },
    dark: {
      primary:         '#99f6e4',
      onPrimary:       '#000000',
      secondary:       '#f5d0fe',
      background:      '#431407',
      surface:         '#292524',
      surfaceElevated: '#1c1917',
      border:          'rgba(255,255,255,0.12)',
      textPrimary:     '#ffffff',
      textDefault:     'rgba(255,255,255,0.87)',
      textSubtle:      'rgba(255,255,255,0.54)',
    },
  },
  radius: {
    s:    '4px',
    m:    '10px',
    l:    '16px',
    xl:   '24px',
    full: '9999px',
  },
  shadow: {
    sm: 'none',
    md: 'none',
  },
};
