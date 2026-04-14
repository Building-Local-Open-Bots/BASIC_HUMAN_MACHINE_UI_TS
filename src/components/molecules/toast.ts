/**
 * Toast + ToastManager — blob-toast
 *
 * Transient notification messages that appear in a fixed corner of the screen
 * and auto-dismiss after a timeout. Use `ToastManager` (singleton via
 * `getToastManager()`) to push toasts from anywhere in your app.
 *
 * CSS class: blob-toast-region  (fixed container)
 *            blob-toast         (individual toast)
 *
 * Variants: info (default), success, warning, error
 * Position: top-right (default), top-left, bottom-right, bottom-left, top-center, bottom-center
 *
 * @example
 * ```typescript
 * // Preferred: singleton manager
 * import { getToastManager } from '@ui/components';
 *
 * const toasts = getToastManager();
 * toasts.push({ message: 'Saved!' });
 * toasts.push({ variant: 'error', title: 'Failed', message: 'Could not save.', duration: 0 });
 * toasts.push({ variant: 'success', message: 'Done.', position: 'bottom-right' });
 *
 * // Direct instantiation (rare — prefer manager)
 * const t = new Toast({ variant: 'warning', message: 'Low disk space.', onDismiss: () => {} });
 * document.body.appendChild(t.element);
 * t.show();
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-toast';
  style.textContent = `
    /* Region — fixed container, one per position */
    .blob-toast-region {
      position:       fixed;
      z-index:        10000;
      display:        flex;
      flex-direction: column;
      gap:            0.5rem;
      pointer-events: none;
      max-width:      min(420px, calc(100vw - 2rem));
    }
    /* Positions */
    .blob-toast-region--top-right    { top: 1rem; right: 1rem;  align-items: flex-end; }
    .blob-toast-region--top-left     { top: 1rem; left: 1rem;   align-items: flex-start; }
    .blob-toast-region--bottom-right { bottom: 1rem; right: 1rem; align-items: flex-end; flex-direction: column-reverse; }
    .blob-toast-region--bottom-left  { bottom: 1rem; left: 1rem;  align-items: flex-start; flex-direction: column-reverse; }
    .blob-toast-region--top-center    { top: 1rem; left: 50%; transform: translateX(-50%); align-items: center; }
    .blob-toast-region--bottom-center { bottom: 1rem; left: 50%; transform: translateX(-50%); align-items: center; flex-direction: column-reverse; }

    /* Toast item */
    .blob-toast {
      pointer-events: all;
      display:        flex;
      align-items:    flex-start;
      gap:            0.625rem;
      padding:        0.75rem 1rem;
      background:     var(--color-background, #fff);
      border:         1px solid var(--color-border, #e5e5e5);
      border-radius:  var(--radius-l, 10px);
      box-shadow:     var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1));
      font-family:    var(--font-human, sans-serif);
      font-size:      0.875rem;
      line-height:    1.45;
      max-width:      100%;
      min-width:      240px;
      -webkit-font-smoothing: antialiased;
      /* Entry */
      animation: blob-toast-in 0.2s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes blob-toast-in {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .blob-toast--exit {
      animation: blob-toast-out 0.15s ease forwards;
    }
    @keyframes blob-toast-out {
      to { opacity: 0; transform: scale(0.95); }
    }

    /* Icon */
    .blob-toast__icon {
      flex-shrink: 0;
      display:     flex;
      align-items: center;
      margin-top:  1px;
    }
    .blob-toast__icon svg { width: 17px; height: 17px; }

    /* Body */
    .blob-toast__body    { flex: 1; min-width: 0; }
    .blob-toast__title   { font-weight: 600; color: var(--color-text-primary, #000); }
    .blob-toast__message { color: var(--color-text-default, rgba(0,0,0,0.8)); margin-top: 0.1rem; }

    /* Progress bar */
    .blob-toast__progress {
      position:      absolute;
      bottom:        0;
      left:          0;
      height:        2px;
      border-radius: 0 0 var(--radius-l, 10px) var(--radius-l, 10px);
      background:    var(--color-primary, #000);
      opacity:       0.3;
      transform-origin: left;
      /* width driven by JS animation */
    }

    /* Dismiss */
    .blob-toast__dismiss {
      display:          flex;
      align-items:      center;
      justify-content:  center;
      flex-shrink:      0;
      width:            24px;
      height:           24px;
      padding:          0;
      background:       transparent;
      border:           none;
      border-radius:    var(--radius-s, 4px);
      cursor:           pointer;
      color:            var(--color-text-subtle, rgba(0,0,0,0.45));
      transition:       background 0.1s ease, color 0.1s ease;
    }
    .blob-toast__dismiss:hover { background: var(--color-surface, rgba(0,0,0,0.05)); color: var(--color-text-default, rgba(0,0,0,0.8)); }
    .blob-toast__dismiss svg   { width: 13px; height: 13px; }

    /* Variant icon colors */
    .blob-toast--info    .blob-toast__icon { color: var(--color-primary, #2563eb); }
    .blob-toast--success .blob-toast__icon { color: #16a34a; }
    .blob-toast--warning .blob-toast__icon { color: #d97706; }
    .blob-toast--error   .blob-toast__icon { color: #dc2626; }

    /* Variant left border accent */
    .blob-toast--info    { border-left: 3px solid var(--color-primary, #2563eb); }
    .blob-toast--success { border-left: 3px solid #16a34a; }
    .blob-toast--warning { border-left: 3px solid #d97706; }
    .blob-toast--error   { border-left: 3px solid #dc2626; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ToastVariant  = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastOptions {
  variant?:    ToastVariant;
  title?:      string;
  message:     string;
  /** Duration in ms. 0 = sticky (never auto-dismisses). Default: 4000. */
  duration?:   number;
  dismissible?: boolean;
  position?:   ToastPosition;
  onDismiss?:  () => void;
}

// Inline icons
const TOAST_ICONS: Record<ToastVariant, string> = {
  info:    '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="7"/><path d="M8.5 9v3.5M8.5 5.5h.01"/></svg>',
  success: '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="8.5" r="7"/><path d="M5.5 9l2.5 2.5 4-4.5"/></svg>',
  warning: '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 2L15.5 14.5H1.5L8.5 2z"/><path d="M8.5 7v3M8.5 11.5h.01"/></svg>',
  error:   '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8.5" cy="8.5" r="7"/><path d="M6 6l5 5M11 6l-5 5"/></svg>',
};
const CLOSE_ICON = '<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M10.5 2.5l-8 8M2.5 2.5l8 8"/></svg>';

// ---------------------------------------------------------------------------
// Toast (single item)
// ---------------------------------------------------------------------------
export class Toast {
  public element: HTMLElement;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _opts:  ToastOptions;

  constructor(options: ToastOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { variant = 'info', title, message, dismissible = true } = this._opts;

    const el = document.createElement('div');
    el.className = `blob-toast blob-toast--${variant}`;
    el.setAttribute('role', variant === 'error' ? 'alert' : 'status');
    el.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');
    el.style.position = 'relative';

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'blob-toast__icon';
    iconWrap.innerHTML = TOAST_ICONS[variant];
    el.appendChild(iconWrap);

    // Body
    const body = document.createElement('div');
    body.className = 'blob-toast__body';
    if (title) {
      const t = document.createElement('div');
      t.className = 'blob-toast__title';
      t.textContent = title;
      body.appendChild(t);
    }
    const msg = document.createElement('div');
    msg.className   = 'blob-toast__message';
    msg.textContent = message;
    body.appendChild(msg);
    el.appendChild(body);

    // Dismiss
    if (dismissible) {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'blob-toast__dismiss';
      btn.setAttribute('aria-label', 'Dismiss notification');
      btn.innerHTML = CLOSE_ICON;
      btn.addEventListener('click', () => this.dismiss());
      el.appendChild(btn);
    }

    return el;
  }

  public show(): void {
    const { duration = 4000 } = this._opts;
    if (duration > 0) {
      this._timer = setTimeout(() => this.dismiss(), duration);
    }
  }

  public dismiss(): void {
    if (this._timer) clearTimeout(this._timer);
    this.element.classList.add('blob-toast--exit');
    this.element.addEventListener('animationend', () => {
      this.element.remove();
      this._opts.onDismiss?.();
    }, { once: true });
  }
}

// ---------------------------------------------------------------------------
// ToastManager — singleton per position
// ---------------------------------------------------------------------------
const _regions = new Map<ToastPosition, HTMLElement>();

function getRegion(position: ToastPosition): HTMLElement {
  let region = _regions.get(position);
  if (!region) {
    injectStyles();
    region = document.createElement('div');
    region.className = `blob-toast-region blob-toast-region--${position}`;
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'false');
    document.body.appendChild(region);
    _regions.set(position, region);
  }
  return region;
}

export class ToastManager {
  private _defaultPosition: ToastPosition;
  private _defaultDuration: number;

  constructor(options: { position?: ToastPosition; duration?: number } = {}) {
    this._defaultPosition = options.position ?? 'top-right';
    this._defaultDuration = options.duration ?? 4000;
  }

  public push(options: ToastOptions): Toast {
    const merged: ToastOptions = {
      duration:    this._defaultDuration,
      dismissible: true,
      position:    this._defaultPosition,
      ...options,
    };
    const toast  = new Toast(merged);
    const region = getRegion(merged.position ?? this._defaultPosition);
    region.appendChild(toast.element);
    toast.show();
    return toast;
  }

  public success(message: string, title?: string): Toast {
    return this.push({ variant: 'success', message, title });
  }
  public error(message: string, title?: string): Toast {
    return this.push({ variant: 'error', message, title, duration: 0 });
  }
  public warning(message: string, title?: string): Toast {
    return this.push({ variant: 'warning', message, title });
  }
  public info(message: string, title?: string): Toast {
    return this.push({ variant: 'info', message, title });
  }
}

// Global singleton
let _toastManager: ToastManager | null = null;
export function getToastManager(options?: { position?: ToastPosition; duration?: number }): ToastManager {
  if (!_toastManager) _toastManager = new ToastManager(options);
  return _toastManager;
}
