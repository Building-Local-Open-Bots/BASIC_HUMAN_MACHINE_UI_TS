/**
 * Badge component — blob-badge
 *
 * Static status indicator. Three display modes:
 * - label  — pill with text (default when `label` is provided)
 * - dot    — small coloured circle (default when no `label`)
 * - count  — compact number chip (notification counters, avatar overlays)
 *
 * Unlike Tag, Badge has no interaction — it is purely informational.
 *
 * CSS class: blob-badge
 * Modes:     blob-badge--dot   blob-badge--count
 * Variants:  blob-badge--default  --primary  --success  --warning  --danger  --info
 *
 * @example
 * ```typescript
 * const live    = new Badge({ label: '● Live',   variant: 'success' });
 * const beta    = new Badge({ label: 'Beta',     variant: 'warning' });
 * const dot     = new Badge({ variant: 'danger' });                      // dot mode
 * const notifs  = new Badge({ label: '12', mode: 'count', variant: 'danger' });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-badge';
  style.textContent = `
    /* Label badge ----------------------------------------------------------- */
    .blob-badge {
      display:         inline-flex;
      align-items:     center;
      gap:             0.25rem;
      border-radius:   var(--radius-full, 9999px);
      font-family:     var(--font-human, sans-serif);
      font-size:       0.75rem;
      font-weight:     500;
      line-height:     1;
      white-space:     nowrap;
      padding:         0.1875rem 0.5rem;
      -webkit-font-smoothing: antialiased;
    }

    /* Dot mode -------------------------------------------------------------- */
    .blob-badge--dot {
      width:   8px;
      height:  8px;
      padding: 0;
      border-radius: 50%;
    }

    /* Count mode (notification chip) --------------------------------------- */
    .blob-badge--count {
      min-width:       18px;
      height:          18px;
      padding:         0 4px;
      justify-content: center;
      font-size:       0.6875rem;
    }

    /* Variants -------------------------------------------------------------- */
    .blob-badge--default { background: var(--color-surface-elevated, #e5e5e5); color: var(--color-text-default, rgba(0,0,0,0.8)); }
    .blob-badge--primary { background: var(--color-primary, #000);             color: var(--color-on-primary, #fff); }
    .blob-badge--success { background: #dcfce7; color: #15803d; }
    .blob-badge--warning { background: #fef9c3; color: #a16207; }
    .blob-badge--danger  { background: #fee2e2; color: #b91c1c; }
    .blob-badge--info    { background: #dbeafe; color: #1d4ed8; }

    @media (prefers-color-scheme: dark) {
      .blob-badge--success { background: rgba(21,128,61,0.2);  color: #86efac; }
      .blob-badge--warning { background: rgba(161,98,7,0.2);   color: #fde047; }
      .blob-badge--danger  { background: rgba(185,28,28,0.2);  color: #fca5a5; }
      .blob-badge--info    { background: rgba(29,78,216,0.2);  color: #93c5fd; }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeMode    = 'label' | 'dot' | 'count';

export interface BadgeOptions {
  /** Text for label / count modes. Omit for dot mode. */
  label?:     string;
  /** Automatically inferred from `label` presence when omitted. */
  mode?:      BadgeMode;
  variant?:   BadgeVariant;
  /** Render a small status dot before the label text (label mode only). */
  dot?:       boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Badge {
  public element: HTMLElement;
  private _opts: BadgeOptions;

  constructor(options: BadgeOptions = {}) {
    injectStyles();
    this._opts   = { variant: 'default', ...options };
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { label, mode: rawMode, variant = 'default', dot, className } = this._opts;
    const mode = rawMode ?? (label ? 'label' : 'dot');

    const el = document.createElement('span');
    el.className = [
      'blob-badge',
      `blob-badge--${variant}`,
      mode === 'dot'   ? 'blob-badge--dot'   : '',
      mode === 'count' ? 'blob-badge--count'  : '',
      className ?? '',
    ].filter(Boolean).join(' ');

    if (mode === 'dot') {
      el.setAttribute('role', 'status');
      return el;
    }

    if (dot && mode === 'label') {
      const dotEl = document.createElement('span');
      dotEl.setAttribute('aria-hidden', 'true');
      dotEl.style.cssText = 'width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;flex-shrink:0';
      el.appendChild(dotEl);
    }

    if (label) {
      const textEl = document.createElement('span');
      textEl.textContent = label;
      el.appendChild(textEl);
    }

    return el;
  }

  public set(updates: Partial<BadgeOptions>): void {
    Object.assign(this._opts, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setLabel(label: string): void { this.set({ label }); }
}
