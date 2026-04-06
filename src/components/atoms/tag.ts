/**
 * Tag component — blob-tag
 *
 * A small inline label used for categorisation, filtering, and metadata.
 * Supports optional removal (×), click handlers, icons, and colour variants.
 *
 * CSS class:  blob-tag
 * Variants:   blob-tag--default
 *             blob-tag--primary   (uses --color-primary / --color-on-primary)
 *             blob-tag--success
 *             blob-tag--warning
 *             blob-tag--danger
 *             blob-tag--ghost     (border only, no fill)
 * Modifiers:  blob-tag--interactive  (pointer cursor, hover state)
 *             blob-tag--removable    (shows × button)
 *
 * @example
 * ```typescript
 * // Static label
 * const tag = new Tag({ label: 'TypeScript' });
 *
 * // Filterable tag (click to toggle active state)
 * const filter = new Tag({ label: 'Design', interactive: true, onClick: (active) => filter(active) });
 *
 * // Removable tag (e.g. selected filter chips)
 * const chip = new Tag({ label: 'React', removable: true, onRemove: () => removeFilter('react') });
 *
 * // With icon
 * const tag = new Tag({ label: 'Verified', iconLeft: checkIconEl, variant: 'success' });
 * ```
 */

// ---------------------------------------------------------------------------
// Style injection
// ---------------------------------------------------------------------------
let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-tag';

  style.textContent = `
    /* Base ------------------------------------------------------------------ */
    .blob-tag {
      display:         inline-flex;
      align-items:     center;
      gap:             0.25rem;
      border-radius:   var(--radius-full, 9999px);
      font-family:     var(--font-human, sans-serif);
      font-size:       0.75rem;
      font-weight:     500;
      line-height:     1;
      white-space:     nowrap;
      user-select:     none;
      border:          1px solid transparent;
      padding:         0.25rem 0.625rem;
      transition:      background-color 0.15s ease, opacity 0.15s ease, border-color 0.15s ease;
      -webkit-font-smoothing: antialiased;
    }

    /* Icon slot ------------------------------------------------------------- */
    .blob-tag__icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }
    .blob-tag__icon svg,
    .blob-tag__icon img {
      width:  0.75rem;
      height: 0.75rem;
    }

    /* Remove button --------------------------------------------------------- */
    .blob-tag__remove {
      display:          inline-flex;
      align-items:      center;
      justify-content:  center;
      background:       none;
      border:           none;
      padding:          0;
      margin-left:      0.125rem;
      cursor:           pointer;
      color:            inherit;
      opacity:          0.6;
      line-height:      1;
      font-size:        0.875rem;
      font-family:      inherit;
      border-radius:    var(--radius-full, 9999px);
      transition:       opacity 0.1s ease;
    }
    .blob-tag__remove:hover { opacity: 1; }
    .blob-tag__remove:focus-visible {
      outline:        2px solid currentColor;
      outline-offset: 1px;
      opacity:        1;
    }

    /* Interactive ----------------------------------------------------------- */
    .blob-tag--interactive {
      cursor: pointer;
    }
    .blob-tag--interactive:hover {
      opacity: 0.80;
    }
    .blob-tag--interactive:active {
      opacity: 0.65;
    }
    .blob-tag--interactive:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 2px;
    }
    .blob-tag--interactive.blob-tag--active {
      background-color: var(--color-primary, #000);
      color:            var(--color-on-primary, #fff);
      border-color:     var(--color-primary, #000);
      opacity:          1;
    }

    /* Variants -------------------------------------------------------------- */
    .blob-tag--default {
      background-color: var(--color-surface, #f5f5f5);
      color:            var(--color-text-default, rgba(0,0,0,0.8));
      border-color:     var(--color-border, #e5e5e5);
    }

    .blob-tag--primary {
      background-color: var(--color-primary, #000);
      color:            var(--color-on-primary, #fff);
      border-color:     var(--color-primary, #000);
    }

    .blob-tag--success {
      background-color: #dcfce7;
      color:            #15803d;
      border-color:     #bbf7d0;
    }
    @media (prefers-color-scheme: dark) {
      .blob-tag--success {
        background-color: rgba(21,128,61,0.2);
        color:            #86efac;
        border-color:     rgba(21,128,61,0.35);
      }
    }

    .blob-tag--warning {
      background-color: #fef9c3;
      color:            #a16207;
      border-color:     #fef08a;
    }
    @media (prefers-color-scheme: dark) {
      .blob-tag--warning {
        background-color: rgba(161,98,7,0.2);
        color:            #fde047;
        border-color:     rgba(161,98,7,0.35);
      }
    }

    .blob-tag--danger {
      background-color: #fee2e2;
      color:            #b91c1c;
      border-color:     #fecaca;
    }
    @media (prefers-color-scheme: dark) {
      .blob-tag--danger {
        background-color: rgba(185,28,28,0.2);
        color:            #fca5a5;
        border-color:     rgba(185,28,28,0.35);
      }
    }

    .blob-tag--ghost {
      background-color: transparent;
      color:            var(--color-text-primary, #000);
      border-color:     var(--color-border, #e5e5e5);
    }

    /* Size modifier (optional — default is already small) ------------------- */
    .blob-tag--md {
      font-size: 0.8125rem;
      padding:   0.3125rem 0.75rem;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'ghost';
export type TagSize    = 'sm' | 'md';

export interface TagOptions {
  label:       string;
  variant?:    TagVariant;
  size?:       TagSize;
  /** Renders pointer cursor + hover state. onClick receives the new active state. */
  interactive?: boolean;
  /** Initial active state (only meaningful when interactive: true) */
  active?:     boolean;
  /** Shows a × button that calls onRemove when clicked */
  removable?:  boolean;
  /** Element to render before the label (e.g. a status dot SVG) */
  iconLeft?:   HTMLElement;
  /** Extra Tailwind classes on the outer element */
  className?:  string;
  onClick?:    (active: boolean) => void;
  onRemove?:   () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Tag {
  public element: HTMLElement;
  private _active: boolean;

  private options: Required<Omit<TagOptions, 'iconLeft' | 'className' | 'onClick' | 'onRemove'>> &
    Pick<TagOptions, 'iconLeft' | 'className' | 'onClick' | 'onRemove'>;

  constructor(options: TagOptions) {
    injectStyles();

    this._active = options.active ?? false;

    this.options = {
      label:       options.label,
      variant:     options.variant     ?? 'default',
      size:        options.size        ?? 'sm',
      interactive: options.interactive ?? false,
      active:      this._active,
      removable:   options.removable   ?? false,
      iconLeft:    options.iconLeft,
      className:   options.className,
      onClick:     options.onClick,
      onRemove:    options.onRemove,
    };

    this.element = this.build();
  }

  private build(): HTMLElement {
    const { label, variant, size, interactive, removable, iconLeft, className, onClick, onRemove } = this.options;

    const el = document.createElement('span');

    const classes = [
      'blob-tag',
      `blob-tag--${variant}`,
      size === 'md'   ? 'blob-tag--md'          : '',
      interactive     ? 'blob-tag--interactive'  : '',
      this._active    ? 'blob-tag--active'       : '',
      removable       ? 'blob-tag--removable'     : '',
      className       ?? '',
    ].filter(Boolean).join(' ');

    el.className = classes;

    if (interactive) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => {
        this._active = !this._active;
        el.classList.toggle('blob-tag--active', this._active);
        onClick?.(this._active);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    }

    // Icon left
    if (iconLeft) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'blob-tag__icon';
      iconWrap.appendChild(iconLeft);
      el.appendChild(iconWrap);
    }

    // Label
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    el.appendChild(labelEl);

    // Remove button
    if (removable) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'blob-tag__remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove ${label}`);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove?.();
      });
      el.appendChild(removeBtn);
    }

    return el;
  }

  /** Get current active state. */
  public get active(): boolean { return this._active; }

  /** Programmatically set active state without triggering onClick. */
  public setActive(active: boolean): void {
    this._active = active;
    this.element.classList.toggle('blob-tag--active', active);
  }

  public setLabel(label: string): void {
    this.options.label = label;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
