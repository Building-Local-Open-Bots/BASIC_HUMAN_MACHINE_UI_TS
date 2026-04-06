/**
 * BHMUI Theme Types
 *
 * A theme defines exactly three axes:
 *   1. Font families (one per role: human, display, machine)
 *   2. Colors (light + dark variants for primary, secondary, background, accent)
 *   3. Border radius scale (s, m, l, xl, full — pixel values)
 *
 * Everything else (padding, margin, font-size, layout) is Tailwind's job.
 * applyTheme() writes these as CSS custom properties on a target element.
 */

export type ThemeName = 'classic' | 'international' | 'cofe' | 'funky' | 'tech' | 'edgy';

export interface ThemeFonts {
  /** Body text — readable, warm. e.g. Roboto Serif */
  human: string;
  /** Headings and display text — clean, impactful. e.g. Roboto */
  display: string;
  /** Code, numbers, data. e.g. Roboto Mono */
  machine: string;
}

export interface ThemeColorSet {
  /** Main brand color — buttons, links, accents */
  primary: string;
  /** Text/icon color that sits on top of primary background */
  onPrimary: string;
  /** Secondary brand color — subtle accents, highlights */
  secondary: string;
  /** Page/canvas background */
  background: string;
  /** Default surface (cards, panels) — slightly elevated from background */
  surface: string;
  /** Elevated surface (dropdowns, modals) */
  surfaceElevated: string;
  /** Default border color */
  border: string;
  /** Primary text */
  textPrimary: string;
  /** Default body text */
  textDefault: string;
  /** Muted / helper text */
  textSubtle: string;
}

export interface ThemeRadius {
  /** e.g. 2px — very subtle */
  s: string;
  /** e.g. 6px — default buttons, inputs */
  m: string;
  /** e.g. 10px — cards, modals */
  l: string;
  /** e.g. 16px — large cards, hero sections */
  xl: string;
  /** 9999px — pills, avatars */
  full: string;
}

export interface ThemeShadow {
  sm: string;
  md: string;
}

export interface Theme {
  fonts: ThemeFonts;
  colors: {
    light: ThemeColorSet;
    dark: ThemeColorSet;
  };
  radius: ThemeRadius;
  shadow: ThemeShadow;
}

/**
 * Tailwind config preset shape — returned by resolveThemePreset().
 * Used in tailwind.config.ts under theme.extend.
 */
export interface TailwindThemePreset {
  fontFamily: {
    human: string[];
    display: string[];
    machine: string[];
  };
}
