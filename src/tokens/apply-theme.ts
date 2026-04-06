/**
 * BHMUI token application helpers.
 *
 * applyTheme()  — resolves tokens for a given theme + mode and writes them as
 *                 CSS custom properties on a target element (default: :root).
 *                 Passing a specific element scopes the vars to that subtree,
 *                 which is how the webbuilder isolates browser chrome from the
 *                 opened project's canvas.
 *
 * detectMode()  — returns the OS colour-scheme preference at call time.
 *
 * CSS custom properties written by applyTheme():
 *   --font-human, --font-display, --font-machine
 *   --color-primary, --color-secondary, --color-background
 *   --color-surface-default, --color-surface-elevated
 *   --color-surface-hover, --color-surface-selected, --color-surface-active
 *   --color-border-default
 *   --color-text-primary, --color-text-default, --color-text-subtle
 *   --radius-s, --radius-m, --radius-l
 *   --shadow-strength, --shadow-color
 */

import { themetokens, type themename } from './theme-tokens';
import { colorvariables, type colormode } from './color-variables';

// ---------------------------------------------------------------------------
// Tailwind color name → CSS value
// A minimal but complete subset covering all values used in themetokens.
// ---------------------------------------------------------------------------
const TAILWIND_COLORS: Record<string, string> = {
  'black':        '#000000',
  'white':        '#ffffff',
  'transparent':  'transparent',
  'neutral-50':   '#fafafa',
  'neutral-100':  '#f5f5f5',
  'neutral-200':  '#e5e5e5',
  'neutral-300':  '#d4d4d4',
  'neutral-400':  '#a3a3a3',
  'neutral-500':  '#737373',
  'neutral-600':  '#525252',
  'neutral-700':  '#404040',
  'neutral-800':  '#262626',
  'neutral-900':  '#171717',
  'stone-50':     '#fafaf9',
  'stone-100':    '#f5f4f2',
  'stone-200':    '#e7e5e4',
  'stone-300':    '#d6d3d1',
  'stone-400':    '#a8a29e',
  'stone-500':    '#78716c',
  'stone-600':    '#57534e',
  'stone-700':    '#44403c',
  'stone-800':    '#292524',
  'stone-900':    '#1c1917',
  'cyan-500':     '#06b6d4',
  'cyan-600':     '#0891b2',
  'amber-500':    '#f59e0b',
  'amber-600':    '#d97706',
  'teal-500':     '#14b8a6',
  'teal-600':     '#0d9488',
  'fuchsia-500':  '#d946ef',
  'fuchsia-600':  '#c026d3',
  'blue-500':     '#3b82f6',
  'blue-600':     '#2563eb',
  'indigo-500':   '#6366f1',
  'indigo-600':   '#4f46e5',
  'slate-500':    '#64748b',
  'slate-600':    '#475569',
  'slate-700':    '#334155',
  'orange-500':   '#f97316',
  'orange-600':   '#ea580c',
  'yellow-500':   '#eab308',
  'yellow-600':   '#ca8a04',
  'gray-100':     '#f3f4f6',
  'gray-200':     '#e5e7eb',
  'gray-500':     '#6b7280',
  'gray-700':     '#374151',
  'gray-900':     '#111827',
  'red-500':      '#ef4444',
  'red-600':      '#dc2626',
};

const RADIUS_MAP: Record<string, string> = {
  'rounded-none': '0px',
  'rounded-sm':   '2px',
  'rounded':      '4px',
  'rounded-md':   '6px',
  'rounded-lg':   '8px',
  'rounded-xl':   '12px',
  'rounded-2xl':  '16px',
  'rounded-full': '9999px',
};

function resolveColor(value: string): string {
  return TAILWIND_COLORS[value] ?? value;
}

function resolveRadius(value: string): string {
  return RADIUS_MAP[value] ?? value;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns the OS colour-scheme preference. Re-evaluated on every call. */
export function detectMode(): colormode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply a BHMUI theme to a DOM element.
 *
 * @param themeName  — one of the 6 built-in theme names
 * @param mode       — 'light' | 'dark' (use detectMode() for OS preference)
 * @param target     — element to scope the CSS vars on (default: :root)
 * @param overrides  — project-level token value overrides merged on top of the theme
 */
export function applyTheme(
  themeName: themename,
  mode: colormode = 'light',
  target: HTMLElement = document.documentElement,
  overrides: Partial<Record<string, string | number>> = {}
): void {
  const baseTokens = themetokens[themeName];
  if (!baseTokens) {
    console.warn(`[BHMUI] Unknown theme: "${themeName}"`);
    return;
  }

  // Merge project overrides on top of theme defaults.
  const tokens = { ...baseTokens, ...overrides };

  const modeMap = colorvariables[mode];
  const isDark  = mode === 'dark';

  // Fonts
  target.style.setProperty('--font-human',   String(tokens['human']   ?? 'sans-serif'));
  target.style.setProperty('--font-display', String(tokens['display'] ?? 'sans-serif'));
  target.style.setProperty('--font-machine', String(tokens['machine'] ?? 'monospace'));

  // Named colours (primary, secondary, background) from theme + mode
  for (const [cssName, tokenKey] of Object.entries(modeMap)) {
    const raw = String(tokens[tokenKey] ?? '');
    target.style.setProperty(`--color-${cssName}`, resolveColor(raw));
  }

  // Surface variables — derived from background
  const bgRaw   = String(tokens[modeMap['background']] ?? 'white');
  const bgColor = resolveColor(bgRaw);
  target.style.setProperty('--color-surface-default',  bgColor);
  target.style.setProperty('--color-surface-elevated', bgColor);
  target.style.setProperty('--color-surface-hover',    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)');
  target.style.setProperty('--color-surface-selected', isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)');
  target.style.setProperty('--color-surface-active',   isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.06)');
  target.style.setProperty('--color-border-default',   isDark ? 'rgba(255,255,255,0.12)' : '#e5e7eb');

  // Text colours — derived from primary + mode
  const primaryRaw   = String(tokens[modeMap['primary']] ?? (isDark ? 'white' : 'black'));
  const primaryColor = resolveColor(primaryRaw);
  target.style.setProperty('--color-text-primary', primaryColor);
  target.style.setProperty('--color-text-default', isDark ? 'rgba(255,255,255,0.87)' : 'rgba(0,0,0,0.80)');
  target.style.setProperty('--color-text-subtle',  isDark ? 'rgba(255,255,255,0.54)' : 'rgba(0,0,0,0.50)');

  // Border radius (desktop values)
  const rs = String(tokens['s - border - radius - desktop'] ?? 'rounded-sm');
  const rm = String(tokens['m - border - radius - desktop'] ?? 'rounded-md');
  const rl = String(tokens['l - border - radius - desktop'] ?? 'rounded-lg');
  target.style.setProperty('--radius-s', resolveRadius(rs));
  target.style.setProperty('--radius-m', resolveRadius(rm));
  target.style.setProperty('--radius-l', resolveRadius(rl));

  // Shadow
  target.style.setProperty('--shadow-strength', String(tokens['drop shadow - strength'] ?? 0));
  target.style.setProperty('--shadow-color',    resolveColor(String(tokens['drop shadow - color'] ?? 'transparent')));
}
