/**
 * ListItem component — blob-list-item
 *
 * A single row used in navigation menus, dropdowns, settings lists, and
 * contact lists. Three zones: leading (icon/avatar), body (label + description),
 * trailing (badge, button, chevron, or any element).
 *
 * CSS class: blob-list-item
 * Modifiers: blob-list-item--active   (highlight current item)
 *            blob-list-item--disabled
 *            blob-list-item--danger   (destructive action, red label)
 *
 * @example
 * ```typescript
 * // Simple text row
 * const item = new ListItem({ label: 'Settings' });
 *
 * // Navigation row with icon + chevron
 * const nav = new ListItem({
 *   label:       'Account',
 *   description: 'Manage your account settings',
 *   leading:     accountIcon,
 *   trailing:    chevronRight,
 *   onClick:     () => navigate('/account'),
 * });
 *
 * // With avatar + badge
 * const contact = new ListItem({
 *   label:    'Jane Doe',
 *   leading:  new Avatar({ initials: 'JD', size: 'sm' }).element,
 *   trailing: new Badge({ variant: 'success', mode: 'dot' }).element,
 * });
 *
 * // Danger action
 * const del = new ListItem({ label: 'Delete workspace', variant: 'danger' });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-list-item';
  style.textContent = `
    .blob-list-item {
      display:         flex;
      align-items:     center;
      gap:             0.75rem;
      padding:         0.625rem 0.75rem;
      border-radius:   var(--radius-m, 6px);
      font-family:     var(--font-human, sans-serif);
      cursor:          default;
      user-select:     none;
      text-decoration: none;
      color:           var(--color-text-default, rgba(0,0,0,0.8));
      transition:      background 0.1s ease;
      -webkit-font-smoothing: antialiased;
    }

    /* Clickable */
    .blob-list-item--clickable {
      cursor: pointer;
    }
    .blob-list-item--clickable:hover {
      background: var(--color-surface, rgba(0,0,0,0.04));
    }
    .blob-list-item--clickable:active {
      background: var(--color-surface-elevated, rgba(0,0,0,0.08));
    }
    .blob-list-item--clickable:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: -2px;
    }

    /* Active / selected */
    .blob-list-item--active {
      background: color-mix(in srgb, var(--color-primary, #000) 8%, transparent);
      color:      var(--color-primary, #000);
      font-weight: 500;
    }
    .blob-list-item--active:hover {
      background: color-mix(in srgb, var(--color-primary, #000) 12%, transparent);
    }

    /* Disabled */
    .blob-list-item--disabled {
      opacity:        0.4;
      cursor:         not-allowed;
      pointer-events: none;
    }

    /* Danger */
    .blob-list-item--danger       { color: #dc2626; }
    .blob-list-item--danger:hover { background: rgba(220,38,38,0.06); }

    /* Leading slot */
    .blob-list-item__leading {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-list-item--active  .blob-list-item__leading { color: var(--color-primary, #000); }
    .blob-list-item--danger  .blob-list-item__leading { color: inherit; }

    /* Body */
    .blob-list-item__body {
      flex:           1;
      min-width:      0; /* allow text truncation */
      display:        flex;
      flex-direction: column;
      gap:            0.125rem;
    }

    .blob-list-item__label {
      font-size:     0.875rem;
      font-weight:   inherit;
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .blob-list-item__description {
      font-size:     0.75rem;
      color:         var(--color-text-subtle, rgba(0,0,0,0.45));
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }
    .blob-list-item--danger .blob-list-item__description { color: rgba(220,38,38,0.7); }

    /* Trailing slot */
    .blob-list-item__trailing {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ListItemVariant = 'default' | 'danger';

export interface ListItemOptions {
  label:        string;
  description?: string;
  /** Icon, Avatar.element, or any inline element. */
  leading?:     HTMLElement;
  /** Badge, Button, chevron SVG, or any inline element. */
  trailing?:    HTMLElement;
  variant?:     ListItemVariant;
  active?:      boolean;
  disabled?:    boolean;
  /** Renders `<a>` instead of `<div>`. */
  href?:        string;
  onClick?:     () => void;
  className?:   string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class ListItem {
  public element: HTMLElement;
  private _opts:  ListItemOptions;

  constructor(options: ListItemOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      label, description, leading, trailing,
      variant = 'default', active = false, disabled = false,
      href, onClick, className,
    } = this._opts;

    const isClickable = !!(onClick || href);
    const tag = href ? 'a' : 'div';
    const el  = document.createElement(tag) as HTMLElement;

    el.className = [
      'blob-list-item',
      isClickable           ? 'blob-list-item--clickable' : '',
      active                ? 'blob-list-item--active'    : '',
      disabled              ? 'blob-list-item--disabled'  : '',
      variant === 'danger'  ? 'blob-list-item--danger'    : '',
      className ?? '',
    ].filter(Boolean).join(' ');

    if (href && el instanceof HTMLAnchorElement) {
      el.href = href;
    }
    if (isClickable) {
      el.setAttribute('tabindex', disabled ? '-1' : '0');
      el.setAttribute('role', 'button');
      if (onClick) {
        el.addEventListener('click', onClick);
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
        });
      }
    }
    if (disabled) {
      el.setAttribute('aria-disabled', 'true');
    }

    // Leading
    if (leading) {
      const wrap = document.createElement('span');
      wrap.className = 'blob-list-item__leading';
      wrap.appendChild(leading);
      el.appendChild(wrap);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'blob-list-item__body';

    const labelEl = document.createElement('span');
    labelEl.className   = 'blob-list-item__label';
    labelEl.textContent = label;
    body.appendChild(labelEl);

    if (description) {
      const descEl = document.createElement('span');
      descEl.className   = 'blob-list-item__description';
      descEl.textContent = description;
      body.appendChild(descEl);
    }

    el.appendChild(body);

    // Trailing
    if (trailing) {
      const wrap = document.createElement('span');
      wrap.className = 'blob-list-item__trailing';
      wrap.appendChild(trailing);
      el.appendChild(wrap);
    }

    return el;
  }

  public setActive(active: boolean): void {
    this._opts.active = active;
    this.element.classList.toggle('blob-list-item--active', active);
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled = disabled;
    this.element.classList.toggle('blob-list-item--disabled', disabled);
    this.element.setAttribute('aria-disabled', String(disabled));
  }

  public set(updates: Partial<ListItemOptions>): void {
    Object.assign(this._opts, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
