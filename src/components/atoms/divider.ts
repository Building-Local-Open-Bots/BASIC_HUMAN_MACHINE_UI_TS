/**
 * Divider component — blob-divider
 *
 * A horizontal (default) or vertical separator line.
 * Optionally renders a centered text label.
 *
 * CSS class: blob-divider
 *
 * @example
 * ```typescript
 * const rule   = new Divider();
 * const orRule = new Divider({ label: 'or' });
 * const vRule  = new Divider({ orientation: 'vertical' });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-divider';
  style.textContent = `
    /* Horizontal — plain line */
    .blob-divider {
      display:    block;
      width:      100%;
      height:     1px;
      background: var(--color-border, #e5e5e5);
      border:     none;
      flex-shrink: 0;
    }

    /* Horizontal — with label */
    .blob-divider--labeled {
      height:      auto;
      background:  none;
      display:     flex;
      align-items: center;
      gap:         0.75rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
      font-family: var(--font-human, sans-serif);
      font-size:   0.75rem;
      white-space: nowrap;
    }
    .blob-divider--labeled::before,
    .blob-divider--labeled::after {
      content:    '';
      flex:       1;
      height:     1px;
      background: var(--color-border, #e5e5e5);
    }

    /* Vertical */
    .blob-divider--vertical {
      display:     inline-block;
      width:       1px;
      height:      100%;
      background:  var(--color-border, #e5e5e5);
      align-self:  stretch;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerOptions {
  /** Centered text (horizontal only). Switches to labeled variant. */
  label?:       string;
  orientation?: DividerOrientation;
  className?:   string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Divider {
  public element: HTMLElement;

  constructor(options: DividerOptions = {}) {
    injectStyles();
    this.element = this.build(options);
  }

  private build(options: DividerOptions): HTMLElement {
    const { label, orientation = 'horizontal', className } = options;

    const el = document.createElement('div');
    el.setAttribute('role', 'separator');
    el.setAttribute('aria-orientation', orientation);

    const classes = [
      'blob-divider',
      orientation === 'vertical' ? 'blob-divider--vertical' : '',
      label                      ? 'blob-divider--labeled'  : '',
      className ?? '',
    ].filter(Boolean).join(' ');
    el.className = classes;

    if (label) {
      const text = document.createElement('span');
      text.textContent = label;
      el.appendChild(text);
    }

    return el;
  }
}
