# BHMUI Components

White-label UI components for the BLOB ecosystem. A quickstart — not a constraint.
Users can override any component, build on top of BHMUI, or create their own library from scratch.

## Architecture

Components follow the **hybrid styling** model:

- **`.bhmui-*` CSS class** — owns all themed properties via CSS vars (`background-color`, `border-radius`, `font-family`, `color`). Never defines padding or font-size.
- **Tailwind utilities** — owns all spatial properties (`px-4 py-2 text-sm`). Set as defaults in `ComponentDefinition`, editable per-instance in the webbuilder.
- **Result**: changing `--radius-m` in the Token Editor updates every `.bhmui-btn`, `.bhmui-card`, etc. instantly. No rebuild required.

## CSS var reference

All components read from these CSS custom properties (written by `applyTheme()`):

| Variable | Used for |
|---|---|
| `--color-primary` | Button backgrounds, links, accents |
| `--color-on-primary` | Text/icon on primary background |
| `--color-secondary` | Secondary accents |
| `--color-background` | Page/canvas background |
| `--color-surface` | Cards, panels |
| `--color-surface-elevated` | Dropdowns, modals |
| `--color-border` | Borders, dividers |
| `--color-text-primary` | High-emphasis text |
| `--color-text-default` | Body text |
| `--color-text-subtle` | Muted/helper text |
| `--radius-s / m / l / xl / full` | Border radius scale |
| `--shadow-sm / md` | Box shadows |
| `--font-human` | Body text font family |
| `--font-display` | Heading font family |
| `--font-machine` | Code/number font family |

## Naming convention

| Thing | Pattern | Example |
|---|---|---|
| CSS base class | `blob-{component}` | `blob-button` |
| CSS variant modifier | `blob-{component}--{variant}` | `blob-button--primary` |
| TypeScript class | `PascalCase` (no prefix) | `Button` |

The `blob-` prefix is readable in generated HTML output and self-identifying to non-coders. TypeScript class names have no prefix because they are scoped by import path.

## Component catalogue

**Layout**: `blob-navbar`, `blob-sidebar`, `blob-card`, `blob-modal`, `blob-tabs`

**Form**: `blob-button`, `blob-input`, `blob-textarea`, `blob-select`, `blob-switch`, `blob-checkbox`, `blob-radio`

**Feedback**: `blob-badge`, `blob-toast`, `blob-spinner`, `blob-progress`

**Content**: `blob-carousel`, `blob-table`

**Typography**: `blob-h1`–`blob-h4`, `blob-body`, `blob-code`, `blob-label`, `blob-caption`

## Adding a new component

1. Create `src/components/my-component.ts` — export a TypeScript class with `.element: HTMLElement`
2. Call the module-level `injectStyles()` helper to register the `blob-my-component` CSS rules once
3. CSS rules use CSS vars only — no hardcoded colors, no padding, no font-size
4. Export from `src/components/index.ts`
5. Add a `ComponentDefinition` in the webbuilder with `defaultClasses` including the Tailwind layout defaults



```typescript
import { Sidebar } from '@ui/components';

// Create a sidebar
const sidebar = new Sidebar({
  side: 'left',           // 'left' or 'right'
  collapsed: false,        // Initial collapsed state
  width: '280px',         // Expanded width
  collapsedWidth: '48px', // Collapsed width
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb'
});

// Set content
sidebar.setContent('<h1>My Sidebar Content</h1>');

// Mount to DOM
document.body.appendChild(sidebar.element);
```

### Configuration Options

```typescript
interface SidebarOptions {
  side?: 'left' | 'right';        // Default: 'left'
  collapsed?: boolean;             // Default: false
  width?: string;                  // Default: '280px'
  collapsedWidth?: string;         // Default: '48px'
  backgroundColor?: string;        // Default: '#ffffff'
  borderColor?: string;            // Default: '#e5e7eb'
}
```

### Methods

#### `setContent(content: string | HTMLElement)`
Replace sidebar content with new HTML or DOM element.

```typescript
sidebar.setContent('<div>New content</div>');

// Or with DOM element
const element = document.createElement('div');
element.textContent = 'New content';
sidebar.setContent(element);
```

#### `addContent(content: string | HTMLElement)`
Append content to existing sidebar content.

```typescript
sidebar.addContent('<p>Additional content</p>');
```

#### `clearContent()`
Remove all content from sidebar.

```typescript
sidebar.clearContent();
```

#### `toggle()`
Toggle between collapsed and expanded states.

```typescript
sidebar.toggle();
```

#### `collapse()`
Collapse the sidebar (only if currently expanded).

```typescript
sidebar.collapse();
```

#### `expand()`
Expand the sidebar (only if currently collapsed).

```typescript
sidebar.expand();
```

#### `onToggle(callback: (collapsed: boolean) => void)`
Register a callback to be called when sidebar is toggled.

```typescript
sidebar.onToggle((collapsed) => {
  console.log('Sidebar is now:', collapsed ? 'collapsed' : 'expanded');
  // Adjust other UI elements
});
```

#### `destroy()`
Remove sidebar from DOM and clean up.

```typescript
sidebar.destroy();
```

### Properties

#### `element` (getter)
Get the sidebar's root DOM element.

```typescript
const sidebarElement = sidebar.element;
document.body.appendChild(sidebarElement);
```

#### `collapsed` (getter)
Get current collapsed state.

```typescript
if (sidebar.collapsed) {
  console.log('Sidebar is collapsed');
}
```

### Complete Example

```typescript
import { Sidebar } from '@ui/components';

// Create left sidebar for navigation
const navSidebar = new Sidebar({
  side: 'left',
  width: '240px',
  backgroundColor: '#1f2937',
  borderColor: '#374151'
});

navSidebar.setContent(`
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
`);

document.body.appendChild(navSidebar.element);

// Create right sidebar for properties
const propsSidebar = new Sidebar({
  side: 'right',
  width: '320px',
  collapsed: true  // Start collapsed
});

propsSidebar.setContent(`
  <div>
    <h3>Properties</h3>
    <form>
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
    </form>
  </div>
`);

document.body.appendChild(propsSidebar.element);

// React to toggles
navSidebar.onToggle((collapsed) => {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.marginLeft = collapsed ? '48px' : '240px';
  }
});
```

### Styling

The Sidebar component uses inline styles for core functionality, but you can customize the content styling using CSS classes:

```css
/* Style sidebar content */
.sidebar-content {
  /* Your custom styles */
}

/* Style the toggle button */
.sidebar-toggle {
  /* Your custom styles */
}

/* You can also target by side */
.sidebar-left {
  /* Left sidebar specific styles */
}

.sidebar-right {
  /* Right sidebar specific styles */
}
```

### Integration with blob-webbuilder

The blob-webbuilder uses the Sidebar component for its component library (left) and properties panel (right):

```typescript
import { Editor } from './components/Editor';

const editor = new Editor({
  projectPath: 'my-project',
  onSave: () => console.log('Save'),
  onExport: () => console.log('Export'),
  onClose: () => console.log('Close')
});

// Mount editor (includes sidebars)
editor.mount(document.getElementById('app'));

// Access sidebars
const { left, right } = editor.getSidebars();

// Programmatically control
left.collapse();
right.expand();
```

## Widget Metadata Convention

Every component class must declare a `static meta: widgetmeta` property. This allows the blob-webbuilder's Widget Registry to discover and display the component in the widget palette without any manual registration.

```typescript
import type { widgetmeta } from './widget-meta';

export class mybutton {
  static meta: widgetmeta = {
    name: 'mybutton',
    description: 'A clickable button with configurable label and style',
    category: 'inputs',
    defaultOptions: { label: 'Click me', variant: 'primary' },
  };

  // ... component implementation
}
```

### `widgetmeta` fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Unique identifier — must match the class name |
| `description` | `string` | ✅ | One-line human-readable summary shown in the palette |
| `category` | `string` | ✅ | Groups widgets in the palette (e.g. `layout`, `navigation`, `inputs`) |
| `defaultOptions` | `Record<string, unknown>` | — | Reasonable defaults used when dropping the widget onto the canvas |

`widgetmeta` is defined in `./widget-meta.ts` (not `./index.ts`) to avoid circular imports.

## Contributing

To add a new component:

1. Create `src/components/my-component.ts` (kebab-case filename)
2. Export a class with **all-lowercase** name (`class mycomponent`)
3. Add `static meta: widgetmeta` with name, description, and category
4. Export from `src/components/index.ts`
5. Document usage in this README
