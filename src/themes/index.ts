/**
 * BHMUI Themes
 *
 * Import the theme object you need, or use resolveThemePreset() to get
 * a Tailwind config preset for a given theme.
 *
 * Usage in tailwind.config.ts:
 *   import { resolveThemePreset } from './BASIC_HUMAN_MACHINE_UI_TS/src/themes';
 *   export default { theme: { extend: resolveThemePreset('classic') } }
 */

export { classic }       from './classic';
export { international } from './international';
export { cofe }          from './cofe';
export { funky }         from './funky';
export { tech }          from './tech';
export { edgy }          from './edgy';
export type { Theme, ThemeName, ThemeFonts, ThemeColorSet, ThemeRadius, TailwindThemePreset } from './types';

import { classic }       from './classic';
import { international } from './international';
import { cofe }          from './cofe';
import { funky }         from './funky';
import { tech }          from './tech';
import { edgy }          from './edgy';
import type { Theme, ThemeName, TailwindThemePreset } from './types';

export const themes: Record<ThemeName, Theme> = {
  classic,
  international,
  cofe,
  funky,
  tech,
  edgy,
};

/**
 * Returns a Tailwind theme.extend preset for a given BHMUI theme.
 * Adds font-human, font-display, font-machine as Tailwind font-family utilities.
 *
 * @example
 * // tailwind.config.ts
 * import { resolveThemePreset } from './BASIC_HUMAN_MACHINE_UI_TS/src/themes';
 * export default {
 *   content: ['./src/**\/*.{ts,html}', './index.html'],
 *   darkMode: 'media',
 *   theme: { extend: resolveThemePreset('classic') },
 * }
 */
export function resolveThemePreset(name: ThemeName): TailwindThemePreset {
  const theme = themes[name];
  return {
    fontFamily: {
      human:   [theme.fonts.human],
      display: [theme.fonts.display],
      machine: [theme.fonts.machine],
    },
  };
}
