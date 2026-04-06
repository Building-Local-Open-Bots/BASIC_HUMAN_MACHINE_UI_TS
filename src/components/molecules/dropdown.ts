/**
 * Dropdown component — blob-dropdown
 *
 * A trigger element + positioned floating menu of items. Clicking the trigger
 * opens the menu; clicking outside or pressing Escape closes it. Up/Down arrow
 * keys navigate items; Enter/Space activates the focused item.
 *
 * The trigger can be any element (typically a Button) or a string label that
 * builds a default Button trigger automatically.
 *
 * CSS class: blob-dropdown  (the positionig wrapper)
 *            blob-dropdown__menu
 *            blob-dropdown__item
 *
 * Placement: bottom-start (default), bottom-end, top-start, top-end
 *
 * @example
 * ```typescript
 * const menu = new Dropdown({
 *   trigger: 'Options',
 *   items: [
 *     { label: 'Edit',   onClick: () => edit() },
 *     { label: 'Rename', onClick: () => rename() },
 *     { type: 'divider' },
 *     { label: 'Delete', variant: 'danger', onClick: () => del() },
 *   ],
 * });
 *
 * // Custom trigger element
 * const moreBtn = new Button({ iconLeft: dotsIcon, ariaLabel: 'More options', variant: 'ghost' });
 * const menu = new Dropdown({ trigger: moreBtn.element, items: [...] });
 *
 * // With icons and descriptions
 * const menu = new Dropdown({
 *   items: [
 *     { label: 'Profile', description: 'View your profile', leading: userIcon },
 *     { label: 'Settings', leading: settingsIcon },
 *   ],
 * });
 * ```
 */

import { Button } from '../atoms/button';

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-dropdown';
  style.textContent = `
    /* Wrapper — establishes the positioning context */
    .blob-dropdown {
      position: relative;
      display:  inline-flex;
    }

    /* Floating menu */
    .blob-dropdown__menu {
      position:         absolute;
      z-index:          1000;
      min-width:        180px;
      max-width:        320px;
      padding:          0.25rem;
      background:       var(--color-background, #fff);
      border:           1px solid var(--color-border, #e5e5e5);
      border-radius:    var(--radius-l, 10px);
      box-shadow:       var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1));
      list-style:       none;
      margin:           0;
      outline:          none;
      display:          flex;
      flex-direction:   column;
      gap:              1px;
      /* Entry animation */
      transform-origin: top left;
      animation:        blob-dropdown-in 0.1s ease;
    }

    .blob-dropdown__menu--hidden {
      display: none;
    }

    /* Placement */
    .blob-dropdown__menu--bottom-start { top: calc(100% + 4px); left: 0; }
    .blob-dropdown__menu--bottom-end   { top: calc(100% + 4px); right: 0; transform-origin: top right; }
    .blob-dropdown__menu--top-start    { bottom: calc(100% + 4px); left: 0; transform-origin: bottom left; }
    .blob-dropdown__menu--top-end      { bottom: calc(100% + 4px); right: 0; transform-origin: bottom right; }

    @keyframes blob-dropdown-in {
      from { opacity: 0; transform: scale(0.95) translateY(-4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Item */
    .blob-dropdown__item {
      display:         flex;
      align-items:     center;
      gap:             0.625rem;
      padding:         0.5rem 0.625rem;
      border-radius:   var(--radius-m, 6px);
      font-family:     var(--font-human, sans-serif);
      font-size:       0.875rem;
      color:           var(--color-text-default, rgba(0,0,0,0.8));
      cursor:          pointer;
      user-select:     none;
      white-space:     nowrap;
      outline:         none;
      transition:      background 0.08s ease;
      -webkit-font-smoothing: antialiased;
    }
    .blob-dropdown__item:hover,
    .blob-dropdown__item:focus {
      background: var(--color-surface, rgba(0,0,0,0.05));
    }
    .blob-dropdown__item--danger {
      color: #dc2626;
    }
    .blob-dropdown__item--danger:hover,
    .blob-dropdown__item--danger:focus {
      background: rgba(220,38,38,0.06);
    }
    .blob-dropdown__item--active {
      background: color-mix(in srgb, var(--color-primary, #000) 8%, transparent);
      color:      var(--color-primary, #000);
      font-weight: 500;
    }
    .blob-dropdown__item--disabled {
      opacity:        0.38;
      cursor:         not-allowed;
      pointer-events: none;
    }

    /* Item leading icon */
    .blob-dropdown__item-icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-dropdown__item--danger  .blob-dropdown__item-icon { color: inherit; }
    .blob-dropdown__item--active  .blob-dropdown__item-icon { color: var(--color-primary, #000); }

    /* Item body */
    .blob-dropdown__item-body {
      flex:           1;
      min-width:      0;
      display:        flex;
      flex-direction: column;
    }
    .blob-dropdown__item-label {
      line-height: 1.2;
    }
    .blob-dropdown__item-desc {
      font-size:     0.75rem;
      color:         var(--color-text-subtle, rgba(0,0,0,0.45));
      margin-top:    0.1rem;
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }

    /* Item trailing slot */
    .blob-dropdown__item-trailing {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
      font-size:   0.75rem;
    }

    /* Divider inside menu */
    .blob-dropdown__divider {
      height:     1px;
      background: var(--color-border, #e5e5e5);
      margin:     0.25rem 0;
      flex-shrink: 0;
    }

    /* Section header */
    .blob-dropdown__section-label {
      padding:    0.375rem 0.625rem 0.25rem;
      font-size:  0.6875rem;
      font-weight: 600;
      color:      var(--color-text-subtle, rgba(0,0,0,0.45));
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: var(--font-human, sans-serif);
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type DropdownItemDef =
  | {
      type?:        'item';
      label:        string;
      description?: string;
      leading?:     HTMLElement;
      trailing?:    HTMLElement;
      variant?:     'default' | 'danger';
      active?:      boolean;
      disabled?:    boolean;
      onClick?:     () => void;
    }
  | { type: 'divider' }
  | { type: 'section'; label: string };

export interface DropdownOptions {
  /** String = auto-builds a ghost Button with chevron. Element = use as-is. */
  trigger:     string | HTMLElement;
  items:       DropdownItemDef[];
  placement?:  DropdownPlacement;
  /** Close the menu after an item is clicked. Default: true. */
  closeOnSelect?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Dropdown {
  public element:    HTMLElement;
  public triggerEl:  HTMLElement;
  public menuEl:     HTMLElement;
  private _open:     boolean = false;
  private _opts:     DropdownOptions;
  private _itemEls:  HTMLElement[] = [];

  constructor(options: DropdownOptions) {
    injectStyles();
    this._opts = options;
    const { wrapper, trigger, menu } = this.build();
    this.element   = wrapper;
    this.triggerEl = trigger;
    this.menuEl    = menu;
  }

  private build(): { wrapper: HTMLElement; trigger: HTMLElement; menu: HTMLElement } {
    const { trigger, items, placement = 'bottom-start', closeOnSelect = true } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = 'blob-dropdown';

    // Trigger element
    let triggerEl: HTMLElement;
    if (typeof trigger === 'string') {
      const chevron = document.createElement('span');
      chevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      triggerEl = new Button({
        label:     trigger,
        iconRight: chevron,
        variant:   'secondary',
      }).element;
    } else {
      triggerEl = trigger;
    }
    triggerEl.setAttribute('aria-haspopup', 'true');
    triggerEl.setAttribute('aria-expanded', 'false');
    wrapper.appendChild(triggerEl);

    // Menu
    const menu = document.createElement('ul');
    menu.className   = `blob-dropdown__menu blob-dropdown__menu--${placement} blob-dropdown__menu--hidden`;
    menu.setAttribute('role', 'menu');
    menu.tabIndex    = -1;
    this._itemEls    = [];

    for (const item of items) {
      if (item.type === 'divider') {
        const divEl = document.createElement('li');
        divEl.className = 'blob-dropdown__divider';
        divEl.setAttribute('role', 'separator');
        menu.appendChild(divEl);
        continue;
      }

      if (item.type === 'section') {
        const secEl = document.createElement('li');
        secEl.className   = 'blob-dropdown__section-label';
        secEl.textContent = item.label;
        secEl.setAttribute('role', 'presentation');
        menu.appendChild(secEl);
        continue;
      }

      // Regular item
      const li = document.createElement('li');
      li.setAttribute('role', 'menuitem');
      li.setAttribute('tabindex', item.disabled ? '-1' : '0');

      li.className = [
        'blob-dropdown__item',
        item.variant === 'danger' ? 'blob-dropdown__item--danger'   : '',
        item.active               ? 'blob-dropdown__item--active'   : '',
        item.disabled             ? 'blob-dropdown__item--disabled' : '',
      ].filter(Boolean).join(' ');

      if (item.leading) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'blob-dropdown__item-icon';
        iconWrap.appendChild(item.leading);
        li.appendChild(iconWrap);
      }

      const body = document.createElement('span');
      body.className = 'blob-dropdown__item-body';

      const labelEl = document.createElement('span');
      labelEl.className   = 'blob-dropdown__item-label';
      labelEl.textContent = item.label;
      body.appendChild(labelEl);

      if (item.description) {
        const descEl = document.createElement('span');
        descEl.className   = 'blob-dropdown__item-desc';
        descEl.textContent = item.description;
        body.appendChild(descEl);
      }

      li.appendChild(body);

      if (item.trailing) {
        const trailWrap = document.createElement('span');
        trailWrap.className = 'blob-dropdown__item-trailing';
        trailWrap.appendChild(item.trailing);
        li.appendChild(trailWrap);
      }

      const onClick = item.onClick;
      li.addEventListener('click', () => {
        if (item.disabled) return;
        onClick?.();
        if (closeOnSelect) this.close();
      });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      });

      this._itemEls.push(li);
      menu.appendChild(li);
    }

    // Keyboard navigation
    menu.addEventListener('keydown', (e) => this.handleMenuKey(e));

    wrapper.appendChild(menu);

    // Trigger click
    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this._open ? this.close() : this.open();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this._open && !wrapper.contains(e.target as Node)) this.close();
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._open) { this.close(); triggerEl.focus(); }
    });

    return { wrapper, trigger: triggerEl, menu };
  }

  private handleMenuKey(e: KeyboardEvent): void {
    const focusable = this._itemEls.filter(el => !el.classList.contains('blob-dropdown__item--disabled'));
    if (!focusable.length) return;
    const cur = document.activeElement;
    const idx = focusable.indexOf(cur as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusable[(idx + 1) % focusable.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusable[(idx - 1 + focusable.length) % focusable.length]?.focus();
    } else if (e.key === 'Tab') {
      // Close on Tab out
      this.close();
    }
  }

  public open(): void {
    this._open = true;
    this.menuEl.classList.remove('blob-dropdown__menu--hidden');
    this.triggerEl.setAttribute('aria-expanded', 'true');
    // Focus first item
    this._itemEls[0]?.focus();
  }

  public close(): void {
    this._open = false;
    this.menuEl.classList.add('blob-dropdown__menu--hidden');
    this.triggerEl.setAttribute('aria-expanded', 'false');
  }

  public toggle(): void { this._open ? this.close() : this.open(); }

  public get isOpen(): boolean { return this._open; }
}
