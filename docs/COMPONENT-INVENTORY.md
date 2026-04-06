# BHMUI Component Inventory

_Last updated: 2026-03-21_

This document is the authoritative record of what exists in BHMUI, what is gaps, and what blob-webbuilder specifically needs to build on.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Implemented and exported |
| 🚧 | Stub / partial / draft |
| ❌ | Needed, not yet built |

---

## Design Tokens

All tokens live in `src/tokens/` and are exported from `src/tokens/index.ts`.

| Token file | Export | What it defines | Status |
|---|---|---|---|
| `themeTokens.ts` | `themeTokens`, `ThemeName`, `ThemeTokenSet` | Per-theme typography, color references, border radius, shadow | ✅ |
| `colorVariables.ts` | `colorVariables`, `ColorMode` | Semantic color slots → theme token values (light/dark) | ✅ |
| `fontVariables.ts` | `fontVariables` | Font role names (`human`, `display`, `machine`) | ✅ |
| `scalingTokens.ts` | `scalingTokens`, `ScaleName` | Font sizes and spacers per scale (default/large/small/extra large) | ✅ |
| `deviceTokens.ts` | `deviceTokens`, `DeviceName` | Maps generic tokens → device-specific values (desktop/tablet/mobile) | ✅ |

### Available Themes (`ThemeName`)

| Slug | Fonts | Character |
|---|---|---|
| `classic` | Roboto Serif / Roboto / Roboto Mono | Clean, neutral |
| `international` | Noto Serif / Noto Sans / Noto Sans Mono | Multi-script, accessible |
| `cofe` | Libre Baskerville / Libre Franklin / Fira Code | Warm, editorial |
| `funky` | — | Expressive |
| `tech` | — | Technical/developer |
| `edgy` | — | Bold |

### Token Resolution Chain

```
themeTokens[theme]          → raw values (fonts, color references, radii)
     ↓
colorVariables[colorMode]   → semantic slots → theme token keys
     ↓
deviceTokens[device]        → maps generic roles to device-specific keys
     ↓
scalingTokens[scale]        → font sizes + spacers
```

---

## Components

All components live in `src/components/` and are exported from `src/components/index.ts`.

### ✅ Sidebar

**File**: `src/components/Sidebar.ts`  
**Type**: Vanilla TypeScript class (no framework dependency)

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `'left' \| 'right'` | `'left'` | Which edge the sidebar attaches to |
| `collapsed` | `boolean` | `false` | Initial collapsed state |
| `width` | `string` | `'280px'` | Expanded width (CSS value) |
| `collapsedWidth` | `string` | `'48px'` | Collapsed width (CSS value) |
| `backgroundColor` | `string` | `'#ffffff'` | Background color |
| `borderColor` | `string` | `'#e5e7eb'` | Border color |

**Events**: callback-based via `onToggle(callback: (collapsed: boolean) => void)`  
**Usage**: imperative — `sidebar.setContent(html)`, `sidebar.toggle()`, `sidebar.collapse()`, `sidebar.expand()`

---

## Gaps — What blob-webbuilder Needs

These are the minimum components blob-webbuilder (Sprint 3) requires. Ordered by dependency. 

### Tier 1 — Must exist before WB-001 (site builder canvas)

| Component | Slug | Purpose in webbuilder |
|---|---|---|
| Button | `Button` | Toolbar actions, save/publish, modals | ❌ |
| Icon | `Icon` | Button icons, toolbar, tree indicators | ❌ |
| Input | `Input` | Text/URL/settings fields | ❌ |
| Select | `Select` | Dropdown selectors (font, theme, breakpoint) | ❌ |

### Tier 2 — Needed for canvas and sidebar panels

| Component | Slug | Purpose in webbuilder |
|---|---|---|
| Card | `Card` | Component palette items, properties panel sections | ❌ |
| Tabs | `Tabs` | Properties panel (content / style / layout tabs) | ❌ |
| Toggle | `Toggle` | Boolean settings (show/hide, locked) | ❌ |
| Divider | `Divider` | Panel sections | ❌ |

### Tier 3 — Needed for full flows

| Component | Slug | Purpose in webbuilder |
|---|---|---|
| Modal | `Modal` | Publish flow, unsaved changes warning | ❌ |
| Toast | `Toast` | Save confirmation, error feedback | ❌ |
| Tooltip | `Tooltip` | Toolbar icon labels | ❌ |
| ColorPicker | `ColorPicker` | Style panel background/text color | ❌ |

---

## Token Gaps

| Gap | Notes |
|---|---|
| Actual color values missing | `themeTokens` stores Tailwind class names as strings, not hex/hsl. Components can't use them directly without a Tailwind CSS environment. |
| Spacer tokens are named references | `deviceTokens` maps `"m - spacer"` → `"space-1.25"` — these are Tailwind class names, not raw values. |
| Shadow tokens incomplete | `funky`, `tech`, `edgy` themes have no content yet — only `classic`, `international`, `cofe` are populated. |
| No animation/motion tokens | `token-system.md` proposes them but none exist yet. |
