# BASIC HUMAN MACHINE UI Components

Reusable UI components for the OAT ecosystem.

## Sidebar Component

A fully-featured collapsible sidebar component that can be positioned on either the left or right side of the screen.

### Features

- ✅ Positioned on left or right side
- ✅ Collapsible/expandable with smooth animations
- ✅ Toggle button with arrow icon
- ✅ Customizable width and colors
- ✅ Accept HTML content or DOM elements
- ✅ Event callbacks for toggle actions
- ✅ Fixed positioning (overlays content)
- ✅ Clean API for programmatic control

### Basic Usage

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

## Future Components

Coming soon:
- `Button` - Reusable button component
- `Input` - Form input components
- `Modal` - Modal dialog component
- `Toolbar` - Application toolbar
- `Card` - Content card component

## Contributing

To add a new component:

1. Create component file in `src/components/ComponentName.ts`
2. Export from `src/components/index.ts`
3. Document usage in this README
4. Add examples to blob-webbuilder or other apps
