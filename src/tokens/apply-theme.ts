/**
 * BHMUI theme runtime — applies a theme as CSS custom properties.
 *
 * applyTheme()  — writes CSS vars for color, font-family, radius, and shadow
 *                 onto a target element (default: document.documentElement).
 *                 Passing a specific element scopes the vars to that subtree,
 *                 which is how the webbuilder isolates its own chrome from the
 *                 user's project canvas.
 *
 * detectMode()  — reads OS colour-scheme preference at call time.
 *
 * CSS custom properties written by applyTheme():
 *   --font-human, --font-display, --font-machine
 *   --color-primary, --color-on-primary
 *   --color-secondary, --color-background
 *   --color-surface, --color-surface-elevated
 *   --color-border
 *   --color-text-primary, --color-text-default, --color-text-subtle
 *   --radius-s, --radius-m, --radius-l, --radius-xl, --radius-full
 *   --shadow-sm, --shadow-md
 */

import { themes }  from '../themes';
import type { ThemeName, ThemeColorSet } from '../themes/types';

export type ColorMode = 'light' | 'dark';

/** Returns the OS colour-scheme preference. Re-evaluated on every call. */
export function detectMode(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply a BHMUI theme to a DOM element.
 *
 * @param themeName  — one of the 6 built-in theme names
 * @param mode       — 'light' | 'dark' (use detectMode() for OS preference)
 * @param target     — element to scope the CSS vars on (default: document.documentElement)
 * @param overrides  — project-level CSS var overrides, e.g. { '--color-primary': '#e63946' }
 */
export function applyTheme(
  themeName: ThemeName,
  mode: ColorMode = 'light',
  target: HTMLElement = document.documentElement,
  overrides: Record<string, string> = {},
): void {
  const theme = themes[themeName];
  if (!theme) {
    console.warn(`[BHMUI] Unknown theme: "${themeName}"`);
    return;
  }

  const colors: ThemeColorSet = theme.colors[mode];

  // Fonts
  target.style.setProperty('--font-human',   theme.fonts.human);
  target.style.setProperty('--font-display', theme.fonts.display);
  target.style.setProperty('--font-machine', theme.fonts.machine);

  // Colors
  target.style.setProperty('--color-primary',          colors.primary);
  target.style.setProperty('--color-on-primary',       colors.onPrimary);
  target.style.setProperty('--color-secondary',        colors.secondary);
  target.style.setProperty('--color-background',       colors.background);
  target.style.setProperty('--color-surface',          colors.surface);
  target.style.setProperty('--color-surface-elevated', colors.surfaceElevated);
  target.style.setProperty('--color-border',           colors.border);
  target.style.setProperty('--color-text-primary',     colors.textPrimary);
  target.style.setProperty('--color-text-default',     colors.textDefault);
  target.style.setProperty('--color-text-subtle',      colors.textSubtle);

  // Radius
  target.style.setProperty('--radius-s',    theme.radius.s);
  target.style.setProperty('--radius-m',    theme.radius.m);
  target.style.setProperty('--radius-l',    theme.radius.l);
  target.style.setProperty('--radius-xl',   theme.radius.xl);
  target.style.setProperty('--radius-full', theme.radius.full);

  // Shadow
  target.style.setProperty('--shadow-sm', theme.shadow.sm);
  target.style.setProperty('--shadow-md', theme.shadow.md);

  // Project-level overrides (user customisation via Token Editor)
  for (const [prop, value] of Object.entries(overrides)) {
    target.style.setProperty(prop, value);
  }
}
