# BHMUI Conventions

_Last updated: 2026-03-21_

This document defines the rules every component in BHMUI must follow. All blob-tool UIs must adhere to these conventions for visual and behavioral consistency.

---

## 1. Component Architecture

BHMUI is **framework-agnostic vanilla TypeScript**. Components are classes that produce and manage DOM elements directly. This means:
- No React, Vue, or Svelte dependency
- Tools can wrap BHMUI components in their own framework layer if needed
- Components are portable and run in any browser environment

### Required shape of every component

```typescript
export interface MyComponentOptions {
  // All props optional with sensible defaults
}

export class MyComponent {
  readonly element: HTMLElement;       // The root DOM node — always public

  constructor(options?: MyComponentOptions) {}

  // Lifecycle
  destroy(): void {}                   // Remove DOM, detach listeners

  // State mutations return `this` for chaining
  setContent(html: string): this {}
}
```

---

## 2. Props Naming

| Rule | Example |
|---|---|
| `camelCase` for all option keys | `backgroundColor`, `collapsedWidth` |
| Boolean props use positive framing | `disabled`, `collapsed`, `visible` — not `notDisabled` |
| Size props accept CSS strings | `width: '280px'`, `maxHeight: '100vh'` |
| Color props accept any CSS color | `'#fff'`, `'rgb(0,0,0)'`, `'var(--my-color)'` |
| Callback props are prefixed `on` | `onToggle`, `onChange`, `onClose` |

---

## 3. Events

Components use **callback registration methods**, not DOM events. This avoids framework binding conflicts.

```typescript
// Register
sidebar.onToggle((collapsed) => console.log(collapsed));

// Deregister (always return a cleanup function)
const cleanup = sidebar.onToggle(handler);
cleanup(); // removes that specific listener
```

- Multiple callbacks can be registered for the same event.
- Callbacks receive strongly-typed arguments — no raw `Event` objects.
- Components must not throw if a callback throws — wrap in try/catch and log.

---

## 4. Token Usage in Components

Components must consume tokens, never hardcode colors, fonts, or sizes.

### Resolution order (most specific wins)

```
1. options passed at construction (direct override)
2. themeTokens[theme][tokenKey]   — resolves color/font/radius per theme
3. deviceTokens[device][role]     — resolves role to device-sized key
4. scalingTokens[scale][key]      — resolves sizes per accessibility scale
```

### Accessing tokens inside a component

```typescript
import { themeTokens, deviceTokens, scalingTokens, colorVariables } from '../tokens';

// Get the primary color for the current theme + color mode:
const themeName = options.theme ?? 'classic';
const mode = options.colorMode ?? 'light';
const primaryColorKey = colorVariables[mode]['primary'];   // e.g. "primary - light"
const primaryValue = themeTokens[themeName][primaryColorKey]; // e.g. "black"
```

> ⚠️ **Note on current token values**: The token system currently stores Tailwind CSS class names (e.g. `"text-5xl"`, `"rounded-md"`) rather than raw CSS values. Components rendering in a Tailwind environment should apply these as class names. Components in non-Tailwind environments should define an explicit mapping. This will be resolved in UI-004 (theming system overhaul).

---

## 5. Token Key Naming Convention

Current convention (in use throughout `themeTokens`, `scalingTokens`, `deviceTokens`):

```
"{role} - {qualifier} - {context}"
```

Examples:
- `"primary - light"` — primary color in light mode
- `"h1 - font - desktop"` — h1 font size on desktop
- `"s - border - radius - mobile"` — small border radius on mobile

**Planned migration**: `token-system.md` proposes dot-notation (`color.primary.light`). This migration will happen in UI-004 and will be a **breaking change**. Until then, use the space-dash-space convention for all new tokens.

---

## 6. Component File Structure

Each component lives in its own file under `src/components/`:

```
src/components/
├── Button/
│   ├── Button.ts          # Component class
│   ├── Button.test.ts     # Unit tests (when applicable)
│   └── index.ts           # re-exports Button + ButtonOptions
├── Sidebar/
│   └── ... (same pattern)
└── index.ts               # re-exports everything
```

Single-file components (like the current `Sidebar.ts`) are acceptable for simple components. Move to subfolder when a component needs tests or sub-parts.

---

## 7. Exports

Every public symbol must be exported from `src/index.ts` — the package entry point.

```typescript
// ✅ Correct — consumers can do:
import { Sidebar, type SidebarOptions } from 'bhmui';
import { themeTokens } from 'bhmui';
import { themeTokens } from 'bhmui/tokens';   // sub-path import

// ❌ Never require consumers to import from internal paths:
import { Sidebar } from 'bhmui/src/components/Sidebar';
```

---

## 8. Accessibility

- All interactive elements must have an `aria-label` or visible label.
- Toggle buttons must use `aria-expanded`.
- Color contrast: text must meet WCAG AA minimum (4.5:1 normal, 3:1 large text).
- Components must not trap focus unexpectedly.

---

## 9. What Not to Do

- ❌ Don't import from `bhmui` inside BHMUI itself (circular).
- ❌ Don't hardcode pixel values — use spacer/size tokens.
- ❌ Don't use `innerHTML` with untrusted user content (XSS risk) — sanitize or use `textContent`.
- ❌ Don't attach global event listeners without cleaning them up in `destroy()`.
- ❌ Don't `console.log` in production code — components must be silent by default.
