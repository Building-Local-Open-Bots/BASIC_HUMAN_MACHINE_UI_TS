/**
 * TableCell component — blob-table-cell
 *
 * Standalone cell atom that can be used independently (in custom table
 * layouts) or consumed internally by the Table molecule.
 *
 * Creates a semantic <th> or <td> element depending on `variant`.
 *
 * Header cells support an interactive sort indicator that cycles:
 *   unsorted → ascending → descending → unsorted
 *
 * Any HTMLElement can be passed as `content`, making it possible to embed
 * Buttons, Dropdowns, Badges, Avatars, or other BHMUI atoms inside a cell.
 *
 * CSS class: blob-table-cell
 *
 * @example
 * ```typescript
 * // Basic header cell
 * const th = new TableCell({ variant: 'header', content: 'Name' });
 *
 * // Sortable header
 * const th = new TableCell({
 *   variant:  'header',
 *   content:  'Revenue',
 *   sortable: true,
 *   sortDir:  null,
 *   onSort:   (dir) => console.log('sort dir:', dir),
 * });
 *
 * // Data cell with a Button inside
 * const td = new TableCell({
 *   content: new Button({ label: 'Edit', size: 'sm', variant: 'ghost' }).element,
 *   align: 'right',
 * });
 *
 * // Data cell with a Dropdown inside
 * const td = new TableCell({
 *   content: new Dropdown({ trigger: new Button({ label: '⋯', variant: 'ghost' }).element, items: [...] }).element,
 * });
 *
 * // Update content dynamically
 * cell.setContent('Updated value');
 *
 * // Update sort direction from outside (e.g. when another column is sorted)
 * cell.setSortDir(null);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-table-cell';
  style.textContent = `
    /* ---- Base ---- */
    .blob-table-cell {
      padding:        var(--_tc-pad, 0.625rem 0.875rem);
      text-align:     left;
      vertical-align: middle;
      border-bottom:  1px solid var(--color-border, #e5e5e5);
      font-family:    var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
      white-space:    nowrap;
    }

    /* ---- Variants ---- */
    .blob-table-cell--header {
      font-size:       0.75rem;
      font-weight:     600;
      color:           var(--color-text-subtle, rgba(0,0,0,0.45));
      text-transform:  uppercase;
      letter-spacing:  0.04em;
      background:      var(--color-surface, rgba(0,0,0,0.025));
      position:        sticky;
      top:             0;
      z-index:         1;
    }
    .blob-table-cell--data {
      font-size:  0.875rem;
      color:      var(--color-text-default, rgba(0,0,0,0.8));
      background: transparent;
    }

    /* ---- Alignment ---- */
    .blob-table-cell--center { text-align: center; }
    .blob-table-cell--right  { text-align: right; }

    /* ---- Inner flex wrapper ---- */
    .blob-table-cell__inner {
      display:     flex;
      align-items: center;
      gap:         0.375rem;
    }
    .blob-table-cell--center .blob-table-cell__inner { justify-content: center; }
    .blob-table-cell--right  .blob-table-cell__inner { justify-content: flex-end; }

    /* ---- Sort button ---- */
    .blob-table-cell--sortable { cursor: pointer; user-select: none; }
    .blob-table-cell--sortable:hover { color: var(--color-text-primary, #000); }

    .blob-table-cell__sort {
      display:        inline-flex;
      align-items:    center;
      justify-content: center;
      background:     transparent;
      border:         none;
      padding:        0;
      margin:         0;
      cursor:         pointer;
      flex-shrink:    0;
      color:          inherit;
      line-height:    0;
    }
    .blob-table-cell__sort:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 2px;
      border-radius:  2px;
    }

    /* Sort icon arrows — both dim when unsorted */
    .blob-table-cell__sort-icon .sa-up,
    .blob-table-cell__sort-icon .sa-dn { opacity: 0.25; transition: opacity 0.15s ease; }

    .blob-table-cell--asc  .blob-table-cell__sort-icon .sa-up { opacity: 1; }
    .blob-table-cell--asc  .blob-table-cell__sort-icon .sa-dn { opacity: 0.25; }
    .blob-table-cell--desc .blob-table-cell__sort-icon .sa-dn { opacity: 1; }
    .blob-table-cell--desc .blob-table-cell__sort-icon .sa-up { opacity: 0.25; }

    /* If sortable but unsorted — show on hover */
    .blob-table-cell--sortable:not(.blob-table-cell--asc):not(.blob-table-cell--desc):hover
      .blob-table-cell__sort-icon .sa-up { opacity: 0.5; }

    /* ---- aria-sort attribute used for accessibility ---- */
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Sort icon SVG
// ---------------------------------------------------------------------------
const SORT_ICON_SVG = `
  <svg class="blob-table-cell__sort-icon" width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
    <path class="sa-up" d="M5 1L1.5 6h7L5 1z"/>
    <path class="sa-dn" d="M5 13l3.5-5h-7L5 13z"/>
  </svg>
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TableCellVariant = 'header' | 'data';
export type TableCellAlign   = 'left' | 'center' | 'right';
export type TableCellSortDir = 'asc' | 'desc' | null;

export interface TableCellOptions {
  /** 'header' renders a <th>; 'data' renders a <td>. Default: 'data'. */
  variant?:   TableCellVariant;
  /** String text or any HTMLElement (Button, Dropdown, Badge, …). */
  content?:   string | HTMLElement | null;
  align?:     TableCellAlign;
  /** Show a clickable sort indicator. Only meaningful for 'header' cells. */
  sortable?:  boolean;
  /** Current sort state. Controlled externally or via internal toggle. */
  sortDir?:   TableCellSortDir;
  /** Called when the sort direction changes (cycles null → asc → desc → null). */
  onSort?:    (next: TableCellSortDir) => void;
  colSpan?:   number;
  rowSpan?:   number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class TableCell {
  public element:  HTMLTableCellElement;
  private _dir:    TableCellSortDir;
  private _onSort: ((next: TableCellSortDir) => void) | undefined;

  constructor(options: TableCellOptions = {}) {
    injectStyles();
    this._dir    = options.sortDir ?? null;
    this._onSort = options.onSort;
    this.element = this.build(options);
  }

  private build(opts: TableCellOptions): HTMLTableCellElement {
    const { variant = 'data', content, align = 'left', sortable, colSpan, rowSpan } = opts;

    const el = document.createElement(variant === 'header' ? 'th' : 'td') as HTMLTableCellElement;

    el.className = [
      'blob-table-cell',
      `blob-table-cell--${variant}`,
      align !== 'left' ? `blob-table-cell--${align}` : '',
      sortable         ? 'blob-table-cell--sortable' : '',
      this._dir        ? `blob-table-cell--${this._dir}` : '',
    ].filter(Boolean).join(' ');

    if (variant === 'header') {
      el.scope = 'col';
      if (this._dir) el.setAttribute('aria-sort', this._dir === 'asc' ? 'ascending' : 'descending');
    }

    if (colSpan && colSpan > 1) el.colSpan = colSpan;
    if (rowSpan && rowSpan > 1) el.rowSpan = rowSpan;

    // Inner flex wrapper
    const inner = document.createElement('div');
    inner.className = 'blob-table-cell__inner';
    this.renderContent(inner, content ?? null);

    // Sort button (header only)
    if (sortable && variant === 'header') {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'blob-table-cell__sort';
      btn.setAttribute('aria-label', 'Toggle sort');
      btn.innerHTML = SORT_ICON_SVG;
      inner.appendChild(btn);

      // Click on the whole cell (and the btn) triggers sort
      el.addEventListener('click', () => this.handleSort(el));
    }

    el.appendChild(inner);
    return el;
  }

  private renderContent(inner: HTMLElement, content: string | HTMLElement | null): void {
    // Clear everything except the sort button
    const sortBtn = inner.querySelector('.blob-table-cell__sort') as HTMLElement | null;
    inner.innerHTML = '';
    if (content instanceof HTMLElement) {
      inner.appendChild(content);
    } else if (content !== null && content !== undefined) {
      const span        = document.createElement('span');
      span.textContent  = String(content);
      inner.appendChild(span);
    }
    if (sortBtn) inner.appendChild(sortBtn);
  }

  private handleSort(el: HTMLTableCellElement): void {
    const next: TableCellSortDir = this._dir === null ? 'asc'
      : this._dir === 'asc'                           ? 'desc'
      :                                                  null;
    this._dir = next;
    this.applyDir(el);
    this._onSort?.(next);
  }

  private applyDir(el: HTMLTableCellElement = this.element): void {
    el.classList.remove('blob-table-cell--asc', 'blob-table-cell--desc');
    if (this._dir) el.classList.add(`blob-table-cell--${this._dir}`);

    // aria-sort
    if (this._dir) {
      el.setAttribute('aria-sort', this._dir === 'asc' ? 'ascending' : 'descending');
    } else {
      el.removeAttribute('aria-sort');
    }
  }

  /**
   * Set sort direction from outside — use this to clear other columns when
   * a different column is sorted.
   */
  public setSortDir(dir: TableCellSortDir): void {
    this._dir = dir;
    this.applyDir();
  }

  /** Replace cell content without rebuilding. */
  public setContent(content: string | HTMLElement | null): void {
    const inner = this.element.querySelector('.blob-table-cell__inner');
    if (!inner) return;
    this.renderContent(inner as HTMLElement, content);
  }
}
