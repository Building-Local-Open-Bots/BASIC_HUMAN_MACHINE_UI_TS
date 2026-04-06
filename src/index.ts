/**
 * BASIC HUMAN MACHINE UI
 *
 * White-label component library for the BLOB ecosystem.
 * Three layers:
 *   1. themes/  — CSS var definitions (colors, fonts, radius, shadow) per theme
 *   2. tokens/  — applyTheme() runtime that writes CSS vars to the DOM
 *   3. components/ — .bhmui-* CSS classes + TypeScript component classes
 */

// Theme definitions + Tailwind preset helper
export * from './themes';

// Runtime: applyTheme, detectMode
export * from './tokens';

// UI Components
export * from './components';
