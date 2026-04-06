# Token System

_Last updated: 2026-04-06 | Owner: BHMUI maintainer_

This document is the authoritative spec for the BHMUI token system. Update this file when adding or removing token keys.

---

## Purpose

The token system is the **single source of truth** for all visual styling in the BLOB ecosystem. Every component reads tokens via CSS custom properties (`var(--token-key)`). No hardcoded values are allowed.

---

## Authoring format

Tokens are authored as TypeScript objects. Each logical group lives in its own file under `src/tokens/`. The `applyTheme()` function reads these objects and writes them as CSS custom properties to a target DOM element (defaulting to `:root`). No other mechanism exists for applying tokens.

---

## Token files

| File | What it contains |
|------|-----------------|
| `theme-tokens.ts` | Per-theme values: fonts (3 roles), colors (primary/secondary/background in light+dark), border-radius (S/M/L per device), border strength, drop-shadow |
| `theme-table.csv` | Human-readable table of all theme token keys and their values per theme. Source of truth for **which keys exist**. |
| `color-variables-table.csv` | Maps CSS property names to theme token keys per mode (light/dark) |
| `color-variables.ts` | TypeScript version of the color-variables table |
| `font-variables.ts` | Font role definitions (human / display / machine) |
| `scaling-tokens.ts` | Type scale (h1–h3, L/M/S) and spacing scale (xxxl–xs) per scale name |
| `device-tokens.ts` | Responsive overrides per device (desktop / tablet / mobile) |
| `apply-theme.ts` | **The write function** — resolves tokens → CSS vars, writes to target element |

---

## Token categories

### Theme tokens (per theme × per mode)

Defined in `theme-tokens.ts` and `theme-table.csv`. These are the tokens end users can override for their projects.

| Category | Token key format | Example |
|----------|-----------------|---------|
| Fonts | `human`, `display`, `machine` | `"Roboto Serif"` |
| Color — light | `primary - light`, `secondary - light`, `background - light` | `"black"`, Tailwind color name, or hex |
| Color — dark | `primary - dark`, `secondary - dark`, `background - dark` | `"white"` |
| Border radius (desktop) | `s/m/l - border - radius - desktop` | `"rounded-md"` |
| Border radius (tablet) | `s/m/l - border - radius - tablet` | `"rounded-md"` |
| Border radius (mobile) | `s/m/l - border - radius - mobile` | `"rounded-md"` |
| Border strength | `border - strength` | `1` |
| Drop shadow | `drop shadow - strength`, `drop shadow - color` | `0`, `"transparent"` |

### Scaling tokens

Defined in `scaling-tokens.ts`. Reference the Tailwind text scale. **Not yet wired to CSS vars** — planned for a future iteration.

| Category | Keys |
|----------|------|
| Type scale | `h1/h2/h3 - font - desktop/tablet/mobile`, `l/m/s - font - desktop/tablet/mobile` |
| Spacing | `xl/l/m/s/xs - spacer` (per scale name) |

### Device tokens

Defined in `device-tokens.ts`. Per-device overrides for spacing and font sizes. **Not yet wired to CSS vars** — planned for a future iteration.

---

## CSS custom properties written by `applyTheme()`

These are the variables that components must reference. All other styling is composed from these.

| CSS variable | Source |
|---|---|
| `--font-human` | `tokens['human']` |
| `--font-display` | `tokens['display']` |
| `--font-machine` | `tokens['machine']` |
| `--color-primary` | `tokens['primary - {mode}']` |
| `--color-secondary` | `tokens['secondary - {mode}']` |
| `--color-background` | `tokens['background - {mode}']` |
| `--color-surface-elevated` | Derived from background |
| `--color-surface-active` | `rgba(0,0,0,0.06)` (fixed for now) |
| `--color-border-default` | `#e5e7eb` (fixed for now) |
| `--radius-s` | `tokens['s - border - radius - desktop']` |
| `--radius-m` | `tokens['m - border - radius - desktop']` |
| `--radius-l` | `tokens['l - border - radius - desktop']` |
| `--shadow-strength` | `tokens['drop shadow - strength']` |
| `--shadow-color` | `tokens['drop shadow - color']` |

**Gaps to fill in a future iteration:**
- `--color-text-default/subtle/primary` (text colors are not written yet)
- `--color-surface-default/hover/selected` (only `elevated` and `active` exist)
- `--color-state-hover/focus/disabled` (no state colors yet)
- `--spacing-*` (scaling-tokens not wired)
- `--scale-*` (font scale not wired)

---

## `applyTheme()` signature

```typescript
applyTheme(
  themeName: themename,
  mode: colormode,
  target?: HTMLElement,           // default: document.documentElement (:root)
  overrides?: Record<string, string | number>   // project-level token overrides
): void
```

**Current state:** `target` and `overrides` parameters are **not yet implemented**. The function always writes to `:root`. Adding these is required before the webbuilder canvas token isolation can work.

---

## Themes

Six built-in themes. All must exist in `theme-tokens.ts` and `theme-table.csv`.

| Theme | Character | Fonts |
|-------|-----------|-------|
| `classic` | BLOB house style — high contrast black/white, serif | Roboto Serif / Roboto / Roboto Mono |
| `international` | Global-friendly — Noto fonts, cyan accent | Noto Serif / Noto Sans / Noto Sans Mono |
| `cofe` | Warm + craft feel — amber palette | Libre Baskerville / Libre Franklin / Fira Code |
| `funky` | Expressive — teal/fuchsia | PT Serif / PT Sans / PT Mono |
| `tech` | Minimal + precise — blue/slate | Source Serif Pro / Source Sans Pro / Source Code Pro |
| `edgy` | Sharp, no radius — indigo/stone | IBM Plex Serif / IBM Plex Sans / IBM Plex Mono |

---

## Rules

- **No new token keys without updating `theme-table.csv`** — that CSV is the canonical list.
- **All six themes must have a value for every key** — no sparse themes.
- **Tailwind color names are valid** — `applyTheme()` resolves them to hex via a built-in map. Hex is also valid.
- **Font values are passed verbatim** — use the exact Google Fonts / system font name.
- **Components use only `var(--token-key)`** — never read from `themetokens` directly in component code.

---

## Adding a new token key

1. Add the key to `theme-table.csv` with a value for all 6 themes.
2. Add to `theme-tokens.ts` for all 6 theme objects.
3. Add the CSS var write to `applyTheme()`.
4. Update the "CSS custom properties" table in this document.
5. Any component that uses the new var: add a `var(--new-key, fallback)` reference.
