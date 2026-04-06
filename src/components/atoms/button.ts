/**
 * Button component — blob-button
 *
 * A themeable button that reads all visual properties from CSS vars (color,
 * radius, font). Tailwind utilities handle spatial properties (padding, text
 * size) and are set per size variant.
 *
 * CSS class:  blob-button
 * Variants:   blob-button--primary (default)
 *             blob-button--secondary
 *             blob-button--ghost
 *             blob-button--danger
 *
 * @example
 * ```typescript
 * const btn = new Button({ label: 'Get Started' });
 * document.body.appendChild(btn.element);
 *
 * const ghost = new Button({ label: 'Cancel', variant: 'ghost', size: 'sm' });
 * const link  = new Button({ label: 'Docs', href: '/docs', variant: 'secondary' });
 * ```
 */

// ---------------------------------------------------------------------------
// Style injection — runs once per page, never duplicated
// ---------------------------------------------------------------------------
let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-button';

  style.textContent = `
    /* Base ------------------------------------------------------------------ */
    .blob-button {
      background-color: var(--color-primary, #000);
      color:            var(--color-on-primary, #fff);
      border-radius:    var(--radius-m, 6px);
      font-family:      var(--font-human, sans-serif);
      border:           none;
      cursor:           pointer;
      display:          inline-flex;
      align-items:      center;
      justify-content:  center;
      gap:              0.375rem;
      text-decoration:  none;
      white-space:      nowrap;
      user-select:      none;
      transition:       opacity 0.15s ease, box-shadow 0.15s ease;
      -webkit-font-smoothing: antialiased;
    }

    .blob-button:hover:not(:disabled):not(.blob-button--disabled) {
      opacity: 0.85;
    }
    .blob-button:active:not(:disabled):not(.blob-button--disabled) {
      opacity: 0.70;
    }
    .blob-button:focus-visible {
      outline: 2px solid var(--color-primary, #000);
      outline-offset: 2px;
    }
    .blob-button:disabled,
    .blob-button--disabled {
      opacity: 0.38;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Loading spinner -------------------------------------------------------- */
    .blob-button--loading {
      position: relative;
      cursor: wait;
    }
    .blob-button--loading > *:not(.blob-button__spinner) {
      opacity: 0;
    }
    .blob-button__spinner {
      position:  absolute;
      width:     1em;
      height:    1em;
      border:    2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: blob-spin 0.6s linear infinite;
    }
    @keyframes blob-spin {
      to { transform: rotate(360deg); }
    }

    /* Variants --------------------------------------------------------------- */
    .blob-button--primary {
      background-color: var(--color-primary, #000);
      color:            var(--color-on-primary, #fff);
      border:           none;
    }

    .blob-button--secondary {
      background-color: var(--color-surface, #fff);
      color:            var(--color-text-primary, #000);
      border:           1px solid var(--color-border, #e5e5e5);
    }

    .blob-button--ghost {
      background-color: transparent;
      color:            var(--color-text-primary, #000);
      border:           1px solid transparent;
    }
    .blob-button--ghost:hover:not(:disabled) {
      background-color: var(--color-surface, rgba(0,0,0,0.05));
      opacity: 1;
    }

    .blob-button--danger {
      background-color: #dc2626;
      color:            #fff;
      border:           none;
    }
    .blob-button--danger:focus-visible {
      outline-color: #dc2626;
    }

    /* Icon-only ------------------------------------------------------------- */
    .blob-button--icon-only {
      aspect-ratio: 1;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Size → Tailwind utility sets
// ---------------------------------------------------------------------------
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/** Equal padding for icon-only buttons (no label). */
const ICON_ONLY_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'p-1 text-xs',
  md: 'p-1.5 text-sm',
  lg: 'p-2 text-base',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonOptions {
  /** Text label. Omit for icon-only mode (requires iconLeft or iconRight). */
  label?:     string;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  disabled?:  boolean;
  loading?:   boolean;
  /** Extra Tailwind classes — e.g. 'w-full' */
  className?: string;
  /** Renders an <a> instead of <button> */
  href?:      string;
  /** Icon element placed before the label (or the sole icon in icon-only mode) */
  iconLeft?:  HTMLElement;
  /** Icon element placed after the label */
  iconRight?: HTMLElement;
  /** Accessible label — required when the button is icon-only */
  ariaLabel?: string;
  onClick?:   (e: MouseEvent) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Button {
  public element: HTMLElement;
  private options: Required<Omit<ButtonOptions, 'href' | 'iconLeft' | 'iconRight' | 'onClick' | 'className' | 'label' | 'ariaLabel'>> &
    Pick<ButtonOptions, 'href' | 'iconLeft' | 'iconRight' | 'onClick' | 'className' | 'label' | 'ariaLabel'>;

  constructor(options: ButtonOptions = {}) {
    injectStyles();

    this.options = {
      label:     options.label,
      variant:   options.variant  ?? 'primary',
      size:      options.size     ?? 'md',
      disabled:  options.disabled ?? false,
      loading:   options.loading  ?? false,
      href:      options.href,
      iconLeft:  options.iconLeft,
      iconRight: options.iconRight,
      onClick:   options.onClick,
      className: options.className,
      ariaLabel: options.ariaLabel,
    };

    this.element = this.build();
  }

  private build(): HTMLElement {
    const { label, variant, size, disabled, loading, href, iconLeft, iconRight, onClick, className, ariaLabel } = this.options;

    // Detect display mode from what's provided
    const isIconOnly = !label && (!!iconLeft || !!iconRight);

    const tag = href ? 'a' : 'button';
    const el  = document.createElement(tag) as HTMLButtonElement | HTMLAnchorElement;

    // Classes
    const classes = [
      'blob-button',
      `blob-button--${variant}`,
      isIconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
      isIconOnly ? 'blob-button--icon-only' : '',
      loading  ? 'blob-button--loading'  : '',
      disabled ? 'blob-button--disabled' : '',
      className ?? '',
    ].filter(Boolean).join(' ');

    el.className = classes;

    if (href && el instanceof HTMLAnchorElement) {
      el.href = href;
    }
    if (!href && el instanceof HTMLButtonElement) {
      el.disabled = disabled || loading;
      el.type = 'button';
    }
    if (ariaLabel) {
      el.setAttribute('aria-label', ariaLabel);
    }
    if (onClick) {
      el.addEventListener('click', onClick as EventListener);
    }

    // Icon left
    if (iconLeft) el.appendChild(iconLeft);

    // Label span — only when text is provided
    if (label) {
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      el.appendChild(labelEl);
    }

    // Icon right
    if (iconRight) el.appendChild(iconRight);

    // Loading spinner (hidden when not loading via CSS)
    const spinner = document.createElement('span');
    spinner.className = 'blob-button__spinner';
    spinner.setAttribute('aria-hidden', 'true');
    el.appendChild(spinner);

    return el;
  }

  /** Update one or more options and re-render. */
  public set(updates: Partial<ButtonOptions>): void {
    Object.assign(this.options, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setLoading(loading: boolean): void { this.set({ loading }); }
  public setDisabled(disabled: boolean): void { this.set({ disabled }); }
  public setLabel(label: string): void { this.set({ label }); }
}
