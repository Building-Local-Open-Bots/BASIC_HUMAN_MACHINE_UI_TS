/**
 * Table component — blob-table
 *
 * A full-featured data table with:
 *  - Column definitions with optional custom renderers
 *  - Client-side sorting (built-in) or server-side sorting (via onSort callback)
 *  - Selectable rows with tri-state header checkbox
 *  - Sticky header
 *  - Striped rows
 *  - Three density variants (compact / default / comfortable)
 *  - Loading skeleton
 *  - Empty state with customizable label
 *  - Row click callback
 *
 * The `render` function on each column receives the cell value and the full
 * row object, allowing you to embed any HTMLElement — including BHMUI atoms
 * like Button, Dropdown, Badge, Avatar.
 *
 * CSS class: blob-table
 *
 * @example
 * ```typescript
 * const table = new Table({
 *   columns: [
 *     { key: 'name',    label: 'Name',   sortable: true },
 *     { key: 'email',   label: 'Email' },
 *     { key: 'role',    label: 'Role',
 *       render: (v) => new Badge({ label: String(v), variant: 'secondary' }).element },
 *     { key: 'actions', label: '',  align: 'right',
 *       render: (_, row) => {
 *         const btn = new Button({ label: 'Edit', size: 'sm', variant: 'ghost' });
 *         btn.element.addEventListener('click', () => console.log('edit', row));
 *         return btn.element;
 *       }},
 *   ],
 *   rows: [
 *     { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
 *     { name: 'Bob',   email: 'bob@example.com',   role: 'Editor' },
 *   ],
 *   selectable:   true,
 *   striped:      true,
 *   density:      'default',
 *   onSelect:     (rows) => console.log('selected', rows),
 * });
 *
 * // Update rows
 * table.setRows([...newRows]);
 *
 * // Show loading state
 * table.setLoading(true);
 *
 * // Get selected rows
 * const selected = table.getSelected();
 *
 * // Server-side sort
 * const table = new Table({
 *   columns: [{ key: 'name', label: 'Name', sortable: true }],
 *   rows: [],
 *   onSort: (key, dir) => fetchRows({ sortKey: key, sortDir: dir }),
 * });
 * ```
 */

import { TableCell } from '../atoms/table-cell';

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-table';
  style.textContent = `
    /* ---- Scroll wrapper ---- */
    .blob-table {
      width:          100%;
      overflow-x:     auto;
      border:         1px solid var(--color-border, #e5e5e5);
      border-radius:  var(--radius-m, 8px);
      font-family:    var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    /* ---- Table ---- */
    .blob-table table {
      width:           100%;
      border-collapse: collapse;
      border-spacing:  0;
    }

    /* ---- Density via CSS custom property — inherited by TableCell ---- */
    .blob-table--compact     { --_tc-pad: 0.375rem 0.625rem; }
    .blob-table--default     { --_tc-pad: 0.625rem 0.875rem; }
    .blob-table--comfortable { --_tc-pad: 0.875rem 1.125rem; }

    /* ---- Sticky header ---- */
    .blob-table--sticky .blob-table-cell--header {
      position: sticky;
      top:      0;
      z-index:  2;
    }

    /* ---- Rows ---- */
    .blob-table__row {
      transition: background 0.1s ease;
    }
    .blob-table__row:last-child .blob-table-cell {
      border-bottom: none;
    }
    .blob-table__row--clickable { cursor: pointer; }
    .blob-table__row--clickable:hover .blob-table-cell--data,
    .blob-table__row:hover .blob-table-cell--data {
      background: var(--color-surface, rgba(0,0,0,0.025));
    }

    /* Striped — odd rows  */
    .blob-table--striped .blob-table__row:nth-child(odd) .blob-table-cell--data {
      background: var(--color-surface, rgba(0,0,0,0.02));
    }
    .blob-table--striped .blob-table__row:nth-child(odd):hover .blob-table-cell--data {
      background: var(--color-surface-elevated, rgba(0,0,0,0.05));
    }

    /* Selected */
    .blob-table__row--selected .blob-table-cell--data {
      background: color-mix(in srgb, var(--color-primary, #2563eb) 6%, transparent) !important;
    }

    /* ---- Checkbox cell ---- */
    .blob-table-cell--checkbox {
      width:   40px;
      padding: var(--_tc-pad, 0.625rem 0.875rem);
    }
    .blob-table__checkbox {
      width:          16px;
      height:         16px;
      accent-color:   var(--color-primary, #2563eb);
      cursor:         pointer;
      flex-shrink:    0;
      margin:         0;
    }

    /* ---- Empty state row ---- */
    .blob-table__empty-cell {
      padding:    2.5rem 1rem;
      text-align: center;
      color:      var(--color-text-subtle, rgba(0,0,0,0.45));
      font-size:  0.875rem;
      border-bottom: none;
    }

    /* ---- Loading skeleton ---- */
    .blob-table__skel {
      display:       block;
      height:        14px;
      border-radius: var(--radius-s, 3px);
      background: linear-gradient(
        90deg,
        var(--color-surface, rgba(0,0,0,0.04)) 25%,
        var(--color-surface-elevated, rgba(0,0,0,0.08)) 50%,
        var(--color-surface, rgba(0,0,0,0.04)) 75%
      );
      background-size: 200% 100%;
      animation:      blob-table-shimmer 1.4s infinite linear;
    }
    @keyframes blob-table-shimmer {
      0%   { background-position:  200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (prefers-color-scheme: dark) {
      .blob-table {
        border-color: var(--color-border, rgba(255,255,255,0.1));
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TableDensity = 'compact' | 'default' | 'comfortable';

export interface TableColumn {
  key:        string;
  label:      string;
  sortable?:  boolean;
  align?:     'left' | 'center' | 'right';
  width?:     string;
  minWidth?:  string;
  /**
   * Custom cell renderer. Return a string, null (use default), or an
   * HTMLElement — including any BHMUI atom (Button, Dropdown, Badge, etc.)
   */
  render?: (value: unknown, row: Record<string, unknown>) => string | HTMLElement | null;
}

export interface TableOptions {
  columns:        TableColumn[];
  rows?:          Record<string, unknown>[];
  selectable?:    boolean;
  stickyHeader?:  boolean;
  striped?:       boolean;
  density?:       TableDensity;
  loading?:       boolean;
  /** Number of skeleton rows shown while loading. Default: 5. */
  loadingRows?:   number;
  /** Label shown when rows is empty. Default: 'No data to display'. */
  emptyLabel?:    string;
  /**
   * When provided, the table calls this instead of sorting rows itself.
   * Use for server-side sorting.
   */
  onSort?:        (key: string, dir: 'asc' | 'desc' | null) => void;
  onSelect?:      (selected: Record<string, unknown>[]) => void;
  onRowClick?:    (row: Record<string, unknown>, index: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Table {
  public element:  HTMLElement;
  public tableEl:  HTMLTableElement;

  private _cols:       TableColumn[];
  private _rows:       Record<string, unknown>[];
  private _opts:       TableOptions;
  private _loading:    boolean;
  private _sortKey:    string | null = null;
  private _sortDir:    'asc' | 'desc' | null = null;
  private _selected:   Set<number> = new Set();
  private _tbodyEl!:   HTMLTableSectionElement;
  private _allCbox!:   HTMLInputElement;
  private _headerCells: Map<string, TableCell> = new Map();

  constructor(options: TableOptions) {
    injectStyles();
    this._opts    = options;
    this._cols    = options.columns;
    this._rows    = options.rows ?? [];
    this._loading = options.loading ?? false;

    const { wrapper, tableEl } = this.buildWrapper();
    this.element  = wrapper;
    this.tableEl  = tableEl;
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------
  private buildWrapper(): { wrapper: HTMLElement; tableEl: HTMLTableElement } {
    const { density = 'default', stickyHeader, striped } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = [
      'blob-table',
      `blob-table--${density}`,
      stickyHeader ? 'blob-table--sticky' : '',
      striped      ? 'blob-table--striped' : '',
    ].filter(Boolean).join(' ');

    const tableEl = document.createElement('table') as HTMLTableElement;
    tableEl.appendChild(this.buildHead());
    this._tbodyEl = this.buildBody();
    tableEl.appendChild(this._tbodyEl);

    wrapper.appendChild(tableEl);
    return { wrapper, tableEl };
  }

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  private buildHead(): HTMLTableSectionElement {
    const thead = document.createElement('thead');
    const tr    = document.createElement('tr');
    tr.setAttribute('role', 'row');

    // Select-all checkbox column
    if (this._opts.selectable) {
      const th = document.createElement('th');
      th.className = 'blob-table-cell blob-table-cell--header blob-table-cell--checkbox';
      const cbox = document.createElement('input');
      cbox.type      = 'checkbox';
      cbox.className = 'blob-table__checkbox';
      cbox.setAttribute('aria-label', 'Select all rows');
      cbox.addEventListener('change', () => this.handleSelectAll(cbox.checked));
      this._allCbox = cbox;
      th.appendChild(cbox);
      tr.appendChild(th);
    }

    // Column headers
    this._headerCells.clear();
    for (const col of this._cols) {
      const cell = new TableCell({
        variant:  'header',
        content:  col.label,
        align:    col.align,
        sortable: col.sortable,
        sortDir:  this._sortKey === col.key ? this._sortDir : null,
        onSort:   col.sortable ? (dir) => this.handleSort(col.key, dir) : undefined,
      });

      if (col.width)    cell.element.style.width    = col.width;
      if (col.minWidth) cell.element.style.minWidth = col.minWidth;

      this._headerCells.set(col.key, cell);
      tr.appendChild(cell.element);
    }

    thead.appendChild(tr);
    return thead;
  }

  // ---------------------------------------------------------------------------
  // Body
  // ---------------------------------------------------------------------------
  private buildBody(): HTMLTableSectionElement {
    const tbody = document.createElement('tbody');

    if (this._loading) {
      this.appendSkeletonRows(tbody);
      return tbody;
    }

    const rows = this.sortedRows();

    if (!rows.length) {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      const td = document.createElement('td');
      td.className = 'blob-table__empty-cell';
      const colCount = this._cols.length + (this._opts.selectable ? 1 : 0);
      td.colSpan    = colCount;
      td.textContent = this._opts.emptyLabel ?? 'No data to display';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return tbody;
    }

    rows.forEach((row, idx) => {
      tbody.appendChild(this.buildRow(row, idx));
    });

    return tbody;
  }

  private buildRow(row: Record<string, unknown>, idx: number): HTMLTableRowElement {
    const tr = document.createElement('tr') as HTMLTableRowElement;
    tr.className = [
      'blob-table__row',
      this._selected.has(idx)       ? 'blob-table__row--selected' : '',
      this._opts.onRowClick          ? 'blob-table__row--clickable' : '',
    ].filter(Boolean).join(' ');
    tr.setAttribute('role', 'row');

    if (this._opts.onRowClick) {
      tr.addEventListener('click', (e) => {
        // Don't trigger row click when clicking checkbox or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, [role="button"]')) return;
        this._opts.onRowClick!(row, idx);
      });
    }

    // Checkbox column
    if (this._opts.selectable) {
      const td = document.createElement('td');
      td.className = 'blob-table-cell blob-table-cell--data blob-table-cell--checkbox';
      const cbox = document.createElement('input');
      cbox.type      = 'checkbox';
      cbox.className = 'blob-table__checkbox';
      cbox.checked   = this._selected.has(idx);
      cbox.setAttribute('aria-label', `Select row ${idx + 1}`);
      cbox.addEventListener('change', (e) => {
        e.stopPropagation();
        this.handleRowSelect(idx, cbox.checked, tr);
      });
      td.appendChild(cbox);
      tr.appendChild(td);
    }

    // Data cells
    for (const col of this._cols) {
      const raw   = row[col.key];
      const align = col.align;
      let   cellContent: string | HTMLElement | null = null;

      if (col.render) {
        cellContent = col.render(raw, row);
      }
      if (cellContent === null) {
        // Default render — convert to string
        cellContent = raw !== null && raw !== undefined ? String(raw) : '';
      }

      const cell = new TableCell({ variant: 'data', content: cellContent, align });
      tr.appendChild(cell.element);
    }

    return tr;
  }

  // ---------------------------------------------------------------------------
  // Skeleton
  // ---------------------------------------------------------------------------
  private appendSkeletonRows(tbody: HTMLTableSectionElement): void {
    const n        = this._opts.loadingRows ?? 5;
    const colCount = this._cols.length + (this._opts.selectable ? 1 : 0);

    for (let r = 0; r < n; r++) {
      const tr = document.createElement('tr');
      tr.className = 'blob-table__row';
      tr.setAttribute('aria-hidden', 'true');

      for (let c = 0; c < colCount; c++) {
        const td  = document.createElement('td');
        td.className = 'blob-table-cell blob-table-cell--data';
        const bar = document.createElement('span');
        // Vary widths for visual interest
        const widths = ['60%', '80%', '45%', '70%', '55%'];
        bar.className = 'blob-table__skel';
        bar.style.width = widths[(r + c) % widths.length];
        td.appendChild(bar);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  // ---------------------------------------------------------------------------
  // Sort
  // ---------------------------------------------------------------------------
  private sortedRows(): Record<string, unknown>[] {
    if (!this._sortKey || !this._sortDir || this._opts.onSort) {
      return this._rows;
    }
    const key = this._sortKey;
    const dir = this._sortDir;
    return [...this._rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
  }

  private handleSort(key: string, dir: 'asc' | 'desc' | null): void {
    this._sortKey = dir === null ? null : key;
    this._sortDir = dir;

    // Clear other header cells' sort classes
    for (const [k, cell] of this._headerCells) {
      if (k !== key) cell.setSortDir(null);
    }

    if (this._opts.onSort) {
      // Server-side: delegate, don't rebuild body
      this._opts.onSort(key, dir ?? 'asc');
    } else {
      // Client-side: rebuild body
      this.rebuildBody();
    }
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------
  private handleSelectAll(checked: boolean): void {
    this._selected.clear();
    if (checked) {
      this.sortedRows().forEach((_, i) => this._selected.add(i));
    }
    this.rebuildBody();
    this.updateSelectAllState();
    this._opts.onSelect?.(this.getSelected());
  }

  private handleRowSelect(idx: number, checked: boolean, tr: HTMLTableRowElement): void {
    if (checked) {
      this._selected.add(idx);
      tr.classList.add('blob-table__row--selected');
    } else {
      this._selected.delete(idx);
      tr.classList.remove('blob-table__row--selected');
    }
    this.updateSelectAllState();
    this._opts.onSelect?.(this.getSelected());
  }

  private updateSelectAllState(): void {
    if (!this._allCbox) return;
    const total    = this.sortedRows().length;
    const selected = this._selected.size;
    if (selected === 0) {
      this._allCbox.checked       = false;
      this._allCbox.indeterminate = false;
    } else if (selected === total) {
      this._allCbox.checked       = true;
      this._allCbox.indeterminate = false;
    } else {
      this._allCbox.checked       = false;
      this._allCbox.indeterminate = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Rebuild
  // ---------------------------------------------------------------------------
  private rebuildBody(): void {
    const next = this.buildBody();
    this._tbodyEl.replaceWith(next);
    this._tbodyEl = next;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Replace table data. Clears selection state. */
  public setRows(rows: Record<string, unknown>[]): void {
    this._rows = rows;
    this._selected.clear();
    this.rebuildBody();
    if (this._allCbox) this.updateSelectAllState();
  }

  /** Show or hide loading skeleton. */
  public setLoading(loading: boolean): void {
    this._loading = loading;
    this.rebuildBody();
  }

  /** Return the currently selected row objects. */
  public getSelected(): Record<string, unknown>[] {
    const sorted = this.sortedRows();
    return [...this._selected].map((i) => sorted[i]).filter(Boolean);
  }

  /** Deselect all rows. */
  public clearSelection(): void {
    this._selected.clear();
    this.rebuildBody();
    this.updateSelectAllState();
    this._opts.onSelect?.([]);
  }
}
