import type { Theme } from './types';

/**
 * Edgy — Sharp and architectural.
 * IBM Plex family, indigo accent, zero border radius.
 */
export const edgy: Theme = {
  fonts: {
    human:   '"IBM Plex Serif", serif',
    display: '"IBM Plex Sans", sans-serif',
    machine: '"IBM Plex Mono", monospace',
  },
  colors: {
    light: {
      primary:         '#4f46e5',
      onPrimary:       '#ffffff',
      secondary:       '#d6d3d1',
      background:      '#fafaf9',
      surface:         '#ffffff',
      surfaceElevated: '#ffffff',
      border:          '#d6d3d1',
      textPrimary:     '#1c1917',
      textDefault:     'rgba(28,25,23,0.80)',
      textSubtle:      'rgba(28,25,23,0.50)',
    },
    dark: {
      primary:         '#6366f1',
      onPrimary:       '#ffffff',
      secondary:       '#a8a29e',
      background:      '#292524',
      surface:         '#1c1917',
      surfaceElevated: '#292524',
      border:          'rgba(255,255,255,0.12)',
      textPrimary:     '#fafaf9',
      textDefault:     'rgba(250,250,249,0.87)',
      textSubtle:      'rgba(250,250,249,0.50)',
    },
  },
  radius: {
    s:    '0px',
    m:    '0px',
    l:    '0px',
    xl:   '0px',
    full: '0px',
  },
  shadow: {
    sm: 'none',
    md: 'none',
  },
};
