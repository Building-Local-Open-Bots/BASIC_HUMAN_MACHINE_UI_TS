/**
 * Alert component — blob-alert
 *
 * Inline status banner for persistent feedback. Not a toast — sits in the
 * document flow. Variants cover the 4 semantic states: info, success,
 * warning, error. An optional dismiss button removes the element from the DOM.
 *
 * CSS class: blob-alert
 * Variants:  info (default), success, warning, error
 *
 * @example
 * ```typescript
 * const a = new Alert({
 *   variant: 'success',
 *   title:   'Saved',
 *   message: 'Your changes have been saved successfully.',
 *   dismissible: true,
 * });
 * parent.appendChild(a.element);
 *
 * // Without title
 * const warn = new Alert({ variant: 'warning', message: 'Your session expires in 5 minutes.' });
 *
 * // With custom icon
 * const info = new Alert({ message: 'Read the docs first.', icon: infoSvgEl });
 *
 * // Programmatic dismiss
 * a.dismiss();
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-alert';
  style.textContent = `
    .blob-alert {
      display:        flex;
      align-items:    flex-start;
      gap:            0.75rem;
      padding:        0.875rem 1rem;
      border-radius:  var(--radius-m, 6px);
      border:         1px solid transparent;
      font-family:    var(--font-human, sans-serif);
      font-size:      0.875rem;
      line-height:    1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* icon col */
    .blob-alert__icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      margin-top:  1px;
    }
    .blob-alert__icon svg,
    .blob-alert__icon img { width: 18px; height: 18px; }

    /* body */
    .blob-alert__body    { flex: 1; min-width: 0; }
    .blob-alert__title   { font-weight: 600; margin-bottom: 0.2rem; }
    .blob-alert__message { }

    /* dismiss */
    .blob-alert__dismiss {
      display:          flex;
      align-items:      center;
      justify-content:  center;
      flex-shrink:      0;
      width:            28px;
      height:           28px;
      margin:           -4px -4px -4px 0;
      padding:          0;
      background:       transparent;
      border:           none;
      border-radius:    var(--radius-s, 4px);
      cursor:           pointer;
      opacity:          0.6;
      transition:       opacity 0.1s ease, background 0.1s ease;
    }
    .blob-alert__dismiss:hover   { opacity: 1; background: rgba(0,0,0,0.06); }
    .blob-alert__dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 1px;
    }
    .blob-alert__dismiss svg { width: 14px; height: 14px; }

    /* ------------------------------------------------------------------ */
    /* Variants                                                             */
    /* ------------------------------------------------------------------ */

    /* info */
    .blob-alert--info {
      background:   color-mix(in srgb, var(--color-primary, #2563eb) 8%, transparent);
      border-color: color-mix(in srgb, var(--color-primary, #2563eb) 30%, transparent);
      color:        var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-alert--info .blob-alert__icon { color: var(--color-primary, #2563eb); }
    .blob-alert--info .blob-alert__title { color: var(--color-primary, #2563eb); }

    /* success */
    .blob-alert--success {
      background:   rgba(22,163,74,0.08);
      border-color: rgba(22,163,74,0.3);
      color:        var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-alert--success .blob-alert__icon  { color: #16a34a; }
    .blob-alert--success .blob-alert__title { color: #15803d; }

    /* warning */
    .blob-alert--warning {
      background:   rgba(217,119,6,0.08);
      border-color: rgba(217,119,6,0.3);
      color:        var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-alert--warning .blob-alert__icon  { color: #d97706; }
    .blob-alert--warning .blob-alert__title { color: #b45309; }

    /* error */
    .blob-alert--error {
      background:   rgba(220,38,38,0.08);
      border-color: rgba(220,38,38,0.3);
      color:        var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-alert--error .blob-alert__icon  { color: #dc2626; }
    .blob-alert--error .blob-alert__title { color: #b91c1c; }

    /* dark mode */
    @media (prefers-color-scheme: dark) {
      .blob-alert--success { background: rgba(22,163,74,0.14);  border-color: rgba(22,163,74,0.4); }
      .blob-alert--warning { background: rgba(217,119,6,0.14); border-color: rgba(217,119,6,0.4); }
      .blob-alert--error   { background: rgba(220,38,38,0.14); border-color: rgba(220,38,38,0.4); }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Default icons (inline SVG strings)
// ---------------------------------------------------------------------------
const DEFAULT_ICONS: Record<AlertVariant, string> = {
  info:    '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><path d="M9 8v4M9 6h.01"/></svg>',
  success: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7.5"/><path d="M5.5 9.5l2.5 2.5 4.5-5"/></svg>',
  warning: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2L16.5 15.5H1.5L9 2z"/><path d="M9 7.5v3M9 12.5h.01"/></svg>',
  error:   '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><path d="M6 6l6 6M12 6l-6 6"/></svg>',
};

const CLOSE_ICON = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11 3L3 11M3 3l8 8"/></svg>';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertOptions {
  variant?:      AlertVariant;
  title?:        string;
  message:       string;
  /** Custom icon element. If omitted, a default SVG for the variant is used. */
  icon?:         HTMLElement | false;
  dismissible?:  boolean;
  onDismiss?:    () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Alert {
  public element: HTMLElement;
  private _opts:  AlertOptions;

  constructor(options: AlertOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { variant = 'info', title, message, icon, dismissible = false, onDismiss } = this._opts;

    const el = document.createElement('div');
    el.className = `blob-alert blob-alert--${variant}`;
    el.setAttribute('role', variant === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');

    // Icon
    if (icon !== false) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'blob-alert__icon';
      if (icon instanceof HTMLElement) {
        iconWrap.appendChild(icon);
      } else {
        iconWrap.innerHTML = DEFAULT_ICONS[variant];
      }
      el.appendChild(iconWrap);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'blob-alert__body';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className   = 'blob-alert__title';
      titleEl.textContent = title;
      body.appendChild(titleEl);
    }

    const msgEl = document.createElement('div');
    msgEl.className   = 'blob-alert__message';
    msgEl.textContent = message;
    body.appendChild(msgEl);

    el.appendChild(body);

    // Dismiss button
    if (dismissible) {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'blob-alert__dismiss';
      btn.setAttribute('aria-label', 'Dismiss');
      btn.innerHTML = CLOSE_ICON;
      btn.addEventListener('click', () => this.dismiss());
      el.appendChild(btn);
    }

    return el;
  }

  public dismiss(): void {
    this.element.remove();
    this._opts.onDismiss?.();
  }

  public set(updates: Partial<AlertOptions>): void {
    Object.assign(this._opts, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
