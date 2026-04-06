# BHMUI Components

White-label UI components for the BLOB ecosystem. 44 components across three tiers, themed via CSS custom properties.

## Architecture

Every component follows the same pattern:

- **TypeScript class** — instantiate with an options object, access `.element` to mount
- **CSS class** — `blob-{name}` owns all visual properties entirely via `var(--token)` references
- **`injectStyles()`** — called once at module load to register the component's CSS; safe to call multiple times
- **Callbacks in options** — all events are `onXxx: (payload) => void` passed at construction; no separate event registration

No React, no Vue, no Tailwind. Zero runtime dependencies beyond vanilla TypeScript.

## Token system

Tokens are CSS custom properties injected by `applyTheme(theme, colorMode)` from `src/themes/index.ts`.

```typescript
import { applyTheme } from '@ui/themes';
applyTheme('classic', 'dark'); // writes all vars to :root
```

Components never reference raw colour values — only `var(--color-primary, fallback)` etc. inside their `injectStyles()` string.

## Naming convention

| Thing | Pattern | Example |
|---|---|---|
| CSS base class | `blob-{component}` | `blob-button` |
| CSS variant modifier | `blob-{component}--{variant}` | `blob-button--outline` |
| TypeScript export | `PascalCase` (no prefix) | `Button` |

## Folder structure

```
src/components/
├── atoms/       — 19 single-purpose primitives (no BHMUI deps)
├── molecules/   — 20 composed components + data visualisations
├── widgets/     — 5 full standalone feature components
└── index.ts     — re-exports all three tiers
```

Import tier-agnostic (recommended):

```typescript
import { Button, Card, Sidebar } from '@ui/components';
```

Or from a specific tier when you need to be explicit:

```typescript
import { Button }  from '@ui/components/atoms';
import { Card }    from '@ui/components/molecules';
import { Sidebar } from '@ui/components/widgets';
```

## Complete component list

### Atoms

`Button` · `Input` · `ChatInput` · `Tag` · `Switch` · `Spinner` · `Divider` · `Badge` · `Avatar` · `Progress` · `Toggle` · `Checkbox` · `Radio` · `Slider` · `Textarea` · `Tooltip` · `Text` · `Counter` · `TableCell`

### Molecules

`ListItem` · `Tabs` · `Dropdown` · `Card` · `Modal` · `Alert` · `Toast` · `Select` · `Accordion` · `Breadcrumb` · `Pagination` · `EmptyState` · `SearchBar` · `Table` · `TopBar` · `ActionBar` · `Sparkline` · `DonutChart` · `LineChart` · `BarChart`

### Widgets

`Sidebar` · `TopNav` · `FileTree` · `TokenEditor` · `WidgetMeta`

## Adding a new component

1. Decide its tier: **atom** (no BHMUI deps), **molecule** (uses atoms or DOM), **widget** (full feature)
2. Create `src/components/{tier}/{my-component}.ts`, export a PascalCase class
3. Call `injectStyles()` at module level — returns early if already called
4. CSS uses `var(--color-*)`, `var(--radius-*)` etc. only — no hardcoded values
5. Export from `src/components/{tier}/index.ts`
6. The root `src/components/index.ts` will re-export it automatically via `export * from './{tier}'`

### Minimal example

```typescript
let _stylesInjected = false;
function injectStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .blob-my-component {
      background: var(--color-surface, #fff);
      border-radius: var(--radius-md, 6px);
      color: var(--color-text, #111);
      padding: 0.5rem 1rem;
    }
  `;
  document.head.appendChild(style);
}

export interface MyComponentOptions {
  label: string;
  onClick?: () => void;
}

export class MyComponent {
  element: HTMLElement;
  private _opts: MyComponentOptions;

  constructor(opts: MyComponentOptions) {
    injectStyles();
    this._opts = opts;
    this.element = document.createElement('div');
    this.element.className = 'blob-my-component';
    this.element.textContent = opts.label;
    this.element.addEventListener('click', () => opts.onClick?.());
  }

  setLabel(label: string) {
    this._opts = { ...this._opts, label };
    this.element.textContent = label;
  }
}
```

See [COMPONENT-INVENTORY.md](../../docs/COMPONENT-INVENTORY.md) for the full status of every component.
