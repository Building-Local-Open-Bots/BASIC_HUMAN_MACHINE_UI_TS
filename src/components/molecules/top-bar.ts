/**
 * TopBar component — blob-top-bar
 *
 * The chrome bar at the top of a widget, panel, or modal. Distinct from
 * TopNav (app-level navigation) — TopBar is scoped to a single surface.
 *
 * Three zones:
 *  - leading  — icon button(s): back, breadcrumb, logo
 *  - title    — string label or arbitrary element
 *  - trailing — icon button(s): popout, fullscreen, close, custom actions
 *
 * Built-in trailing buttons are opt-in via boolean props. Any extra actions
 * go in the `trailing` slot as custom elements.
 *
 * CSS class: blob-top-bar
 * Variants:  default (bordered bottom), floating (shadow, no border), ghost (no border/shadow)
 *
 * @example
 * ```typescript
 * const bar = new TopBar({
 *   title:    'File Preview',
 *   showClose:   true,
 *   showPopout:  true,
 *   onClose:     () => modal.close(),
 *   onPopout:    () => openInNewTab(),
 * });
 *
 * // Custom trailing actions
 * const bar = new TopBar({
 *   title:    'Workflow Builder',
 *   leading:  backBtn,
 *   trailing: [saveBtn, runBtn],
 *   showClose: true,
 *   onClose:   () => close(),
 * });
 *
 * // Title as element (e.g. Breadcrumb)
 * const bar = new TopBar({ titleEl: breadcrumb.element });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-top-bar';
  style.textContent = `
    .blob-top-bar {
      display:        flex;
      align-items:    center;
      gap:            0.25rem;
      height:         44px;
      padding:        0 0.5rem;
      background:     var(--color-background, #fff);
      font-family:    var(--font-human, sans-serif);
      flex-shrink:    0;
      -webkit-font-smoothing: antialiased;
      user-select:    none;
    }

    /* Variants */
    .blob-top-bar--default  { border-bottom: 1px solid var(--color-border, #e5e5e5); }
    .blob-top-bar--floating { box-shadow: var(--shadow-sm, 0 1px 6px rgba(0,0,0,0.08)); }
    .blob-top-bar--ghost    { /* no border, no shadow */ }

    /* Draggable strip (for detached windows) */
    .blob-top-bar--draggable { cursor: grab; -webkit-app-region: drag; }
    .blob-top-bar--draggable .blob-top-bar__btn { -webkit-app-region: no-drag; }

    /* Zones */
    .blob-top-bar__leading  { display: flex; align-items: center; gap: 0.125rem; flex-shrink: 0; }
    .blob-top-bar__trailing { display: flex; align-items: center; gap: 0.125rem; flex-shrink: 0; }
    .blob-top-bar__title-wrap {
      flex:            1;
      min-width:       0;
      display:         flex;
      align-items:     center;
      padding:         0 0.375rem;
    }

    /* Title */
    .blob-top-bar__title {
      font-size:     0.875rem;
      font-weight:   500;
      color:         var(--color-text-primary, #000);
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
      line-height:   1.3;
    }
    .blob-top-bar__title--center {
      width:       100%;
      text-align:  center;
    }

    /* Icon button shared style */
    .blob-top-bar__btn {
      display:          flex;
      align-items:      center;
      justify-content:  center;
      width:            32px;
      height:           32px;
      padding:          0;
      background:       transparent;
      border:           none;
      border-radius:    var(--radius-m, 6px);
      color:            var(--color-text-subtle, rgba(0,0,0,0.45));
      cursor:           pointer;
      transition:       background 0.1s ease, color 0.1s ease;
      flex-shrink:      0;
    }
    .blob-top-bar__btn:hover {
      background: var(--color-surface, rgba(0,0,0,0.05));
      color:      var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-top-bar__btn:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 1px;
    }
    .blob-top-bar__btn svg { width: 16px; height: 16px; }

    /* Close button — slightly more visible */
    .blob-top-bar__btn--close:hover {
      background: rgba(220,38,38,0.08);
      color:      #dc2626;
    }

    /* Separator between zones */
    .blob-top-bar__sep {
      width:       1px;
      height:      18px;
      background:  var(--color-border, #e5e5e5);
      margin:      0 0.25rem;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

// Built-in SVG icons
const ICONS = {
  close:      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12.5 3.5l-9 9M3.5 3.5l9 9"/></svg>',
  popout:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8A1.5 1.5 0 0013 12.5V9"/><path d="M9 2h5v5"/><path d="M14 2L8 8"/></svg>',
  maximize:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1.5"/></svg>',
  minimize:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 8h10"/></svg>',
  back:       '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.5L6 8l4.5 4.5"/></svg>',
  more:       '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="4" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/></svg>',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TopBarVariant = 'default' | 'floating' | 'ghost';

export interface TopBarOptions {
  /** String title shown in the center zone. */
  title?:         string;
  /** Replace the title string with a custom element. */
  titleEl?:       HTMLElement;
  /** Center the title text. Useful when leading/trailing are symmetric. */
  centerTitle?:   boolean;
  /** Elements placed in the leading (left) zone. */
  leading?:       HTMLElement | HTMLElement[];
  /** Elements placed in the trailing (right) zone — before built-in buttons. */
  trailing?:      HTMLElement | HTMLElement[];
  /** Show popout (open in new tab) button. */
  showPopout?:    boolean;
  /** Show maximize button. */
  showMaximize?:  boolean;
  /** Show minimize button. */
  showMinimize?:  boolean;
  /** Show close button (with red hover). */
  showClose?:     boolean;
  /** Show a separator before built-in trailing buttons. */
  trailingSep?:   boolean;
  variant?:       TopBarVariant;
  /** Mark as draggable (sets -webkit-app-region: drag). */
  draggable?:     boolean;
  /** Callback when the back button is clicked. If set, a back button is shown in leading. */
  onBack?:        () => void;
  onPopout?:      () => void;
  onMaximize?:    () => void;
  onMinimize?:    () => void;
  onClose?:       () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class TopBar {
  public element: HTMLElement;
  private _opts:  TopBarOptions;

  constructor(options: TopBarOptions = {}) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private makeBtn(icon: string, label: string, extraClass = '', onClick?: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = ['blob-top-bar__btn', extraClass].filter(Boolean).join(' ');
    btn.setAttribute('aria-label', label);
    btn.innerHTML = icon;
    if (onClick) btn.addEventListener('click', onClick);
    return btn;
  }

  private build(): HTMLElement {
    const {
      title, titleEl, centerTitle = false,
      leading, trailing,
      showPopout, showMaximize, showMinimize, showClose, trailingSep,
      variant = 'default', draggable = false,
      onBack, onPopout, onMaximize, onMinimize, onClose,
    } = this._opts;

    const bar = document.createElement('div');
    bar.className = [
      'blob-top-bar',
      `blob-top-bar--${variant}`,
      draggable ? 'blob-top-bar--draggable' : '',
    ].filter(Boolean).join(' ');

    // Leading zone
    const leadZone = document.createElement('div');
    leadZone.className = 'blob-top-bar__leading';
    if (onBack) leadZone.appendChild(this.makeBtn(ICONS.back, 'Go back', '', onBack));
    if (leading) {
      const items = Array.isArray(leading) ? leading : [leading];
      for (const el of items) leadZone.appendChild(el);
    }
    bar.appendChild(leadZone);

    // Title zone
    const titleZone = document.createElement('div');
    titleZone.className = 'blob-top-bar__title-wrap';
    if (titleEl) {
      titleZone.appendChild(titleEl);
    } else if (title) {
      const t = document.createElement('span');
      t.className   = ['blob-top-bar__title', centerTitle ? 'blob-top-bar__title--center' : ''].filter(Boolean).join(' ');
      t.textContent = title;
      titleZone.appendChild(t);
    }
    bar.appendChild(titleZone);

    // Trailing zone
    const trailZone = document.createElement('div');
    trailZone.className = 'blob-top-bar__trailing';

    // Custom trailing elements first
    if (trailing) {
      const items = Array.isArray(trailing) ? trailing : [trailing];
      for (const el of items) trailZone.appendChild(el);
    }

    // Separator before built-in buttons
    const hasBuiltIn = showPopout || showMaximize || showMinimize || showClose;
    if (trailingSep && hasBuiltIn && trailing) {
      const sep = document.createElement('div');
      sep.className = 'blob-top-bar__sep';
      trailZone.appendChild(sep);
    }

    if (showPopout)   trailZone.appendChild(this.makeBtn(ICONS.popout,   'Open in new tab', '', onPopout));
    if (showMinimize) trailZone.appendChild(this.makeBtn(ICONS.minimize, 'Minimize',        '', onMinimize));
    if (showMaximize) trailZone.appendChild(this.makeBtn(ICONS.maximize, 'Maximize',        '', onMaximize));
    if (showClose)    trailZone.appendChild(this.makeBtn(ICONS.close,    'Close',           'blob-top-bar__btn--close', onClose));

    bar.appendChild(trailZone);

    return bar;
  }

  /** Update the title text without rebuilding. */
  public setTitle(title: string): void {
    const el = this.element.querySelector('.blob-top-bar__title');
    if (el) el.textContent = title;
  }
}
