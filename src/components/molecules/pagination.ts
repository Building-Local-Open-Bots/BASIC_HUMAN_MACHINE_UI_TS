/**
 * Pagination component — blob-pagination
 *
 * Page navigation with prev/next buttons and numbered page buttons.
 * Renders a compact window of pages around the current page with ellipsis
 * for large page counts. Uses Button internally for visual consistency.
 *
 * CSS class: blob-pagination
 *
 * @example
 * ```typescript
 * const pager = new Pagination({
 *   total:    100,
 *   pageSize: 10,
 *   page:     1,
 *   onChange: (page) => loadPage(page),
 * });
 *
 * // With custom page sizes
 * const pager = new Pagination({ total: 500, pageSize: 25, page: 3, onChange: loadPage });
 *
 * // Update programmatically
 * pager.setPage(5);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-pagination';
  style.textContent = `
    .blob-pagination {
      display:     flex;
      align-items: center;
      gap:         0.25rem;
      font-family: var(--font-human, sans-serif);
      font-size:   0.875rem;
      flex-wrap:   wrap;
      -webkit-font-smoothing: antialiased;
    }

    /* Page button */
    .blob-pagination__btn {
      display:          inline-flex;
      align-items:      center;
      justify-content:  center;
      min-width:        34px;
      height:           34px;
      padding:          0 0.375rem;
      background:       transparent;
      border:           1px solid transparent;
      border-radius:    var(--radius-m, 6px);
      font-family:      inherit;
      font-size:        0.875rem;
      color:            var(--color-text-default, rgba(0,0,0,0.8));
      cursor:           pointer;
      user-select:      none;
      transition:       background 0.1s ease, border-color 0.1s ease, color 0.1s ease;
      white-space:      nowrap;
    }
    .blob-pagination__btn:hover:not(:disabled):not(.blob-pagination__btn--active) {
      background:   var(--color-surface, rgba(0,0,0,0.05));
      border-color: var(--color-border, #e5e5e5);
    }
    .blob-pagination__btn:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 1px;
    }
    .blob-pagination__btn:disabled {
      opacity:        0.35;
      cursor:         not-allowed;
      pointer-events: none;
    }
    .blob-pagination__btn--active {
      background:   var(--color-primary, #000);
      color:        var(--color-on-primary, #fff);
      border-color: var(--color-primary, #000);
      font-weight:  600;
    }

    /* Prev / Next — icon buttons */
    .blob-pagination__nav {
      display:     flex;
      align-items: center;
      justify-content: center;
    }
    .blob-pagination__nav svg { width: 16px; height: 16px; }

    /* Ellipsis */
    .blob-pagination__ellipsis {
      display:     inline-flex;
      align-items: center;
      justify-content: center;
      min-width:   34px;
      height:      34px;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
      user-select: none;
      font-size:   0.875rem;
    }
  `;
  document.head.appendChild(style);
}

const PREV_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 3.5L6 8l4.5 4.5"/></svg>';
const NEXT_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3.5L10 8l-4.5 4.5"/></svg>';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PaginationOptions {
  /** Total number of items. */
  total:    number;
  /** Items per page. Default: 10. */
  pageSize?: number;
  /** Current page (1-based). Default: 1. */
  page?:    number;
  /** Number of page buttons visible around current page. Default: 2. */
  siblings?: number;
  onChange: (page: number) => void;
}

// ---------------------------------------------------------------------------
// Helper — compute visible page numbers with ellipsis markers
// ---------------------------------------------------------------------------
function buildRange(current: number, total: number, siblings: number): (number | '...')[] {
  if (total <= 1) return [1];

  const left  = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);
  const range: (number | '...')[] = [1];

  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Pagination {
  public element: HTMLElement;
  private _page:  number;
  private _total: number;
  private _opts:  PaginationOptions;

  constructor(options: PaginationOptions) {
    injectStyles();
    this._opts  = options;
    this._page  = options.page ?? 1;
    this._total = Math.ceil(options.total / (options.pageSize ?? 10));
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { siblings = 2 } = this._opts;
    const totalPages = this._total;
    const current    = this._page;

    const nav = document.createElement('nav');
    nav.className = 'blob-pagination';
    nav.setAttribute('aria-label', 'Pagination');

    const append = (el: HTMLElement) => nav.appendChild(el);

    // Prev
    const prev = this.makeBtn('', 'Previous page');
    prev.className += ' blob-pagination__nav';
    prev.innerHTML = PREV_ICON;
    prev.setAttribute('aria-label', 'Previous page');
    if (current === 1) prev.disabled = true;
    prev.addEventListener('click', () => this.setPage(current - 1));
    append(prev);

    // Pages
    const range = buildRange(current, totalPages, siblings);
    for (const p of range) {
      if (p === '...') {
        const ell = document.createElement('span');
        ell.className   = 'blob-pagination__ellipsis';
        ell.textContent = '…';
        ell.setAttribute('aria-hidden', 'true');
        append(ell);
      } else {
        const btn = this.makeBtn(String(p), `Page ${p}`);
        if (p === current) {
          btn.className += ' blob-pagination__btn--active';
          btn.setAttribute('aria-current', 'page');
        }
        btn.addEventListener('click', () => this.setPage(p as number));
        append(btn);
      }
    }

    // Next
    const next = this.makeBtn('', 'Next page');
    next.className += ' blob-pagination__nav';
    next.innerHTML = NEXT_ICON;
    next.setAttribute('aria-label', 'Next page');
    if (current === totalPages || totalPages === 0) next.disabled = true;
    next.addEventListener('click', () => this.setPage(current + 1));
    append(next);

    return nav;
  }

  private makeBtn(text: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.className   = 'blob-pagination__btn';
    btn.textContent = text;
    btn.setAttribute('aria-label', label);
    return btn;
  }

  public setPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, this._total));
    if (clamped === this._page) return;
    this._page = clamped;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
    this._opts.onChange(clamped);
  }

  public get page(): number { return this._page; }
  public get totalPages(): number { return this._total; }
}
