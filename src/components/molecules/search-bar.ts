/**
 * SearchBar component — blob-search-bar
 *
 * An enhanced Input with a built-in search icon, clear button, optional
 * keyboard shortcut hint, and an optional results dropdown.
 *
 * Pass `onSearch` for debounced search. Results are rendered inside an
 * auto-positioned dropdown using the same visual pattern as Dropdown items.
 * When `results` is `null` the dropdown is hidden; set it to `[]` to show
 * an empty state.
 *
 * CSS class: blob-search-bar
 *
 * @example
 * ```typescript
 * // Basic (no results)
 * const search = new SearchBar({
 *   placeholder: 'Search anything…',
 *   onSearch:    (query) => console.log(query),
 * });
 *
 * // With async results
 * const search = new SearchBar({
 *   placeholder: 'Search projects…',
 *   shortcut:    '⌘K',
 *   onSearch:    async (q) => {
 *     const data = await api.search(q);
 *     search.setResults(
 *       data.map(r => ({ label: r.name, description: r.path, onSelect: () => open(r) }))
 *     );
 *   },
 * });
 *
 * // Programmatic clear
 * search.clear();
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-search-bar';
  style.textContent = `
    .blob-search-bar {
      position:    relative;
      display:     flex;
      align-items: center;
      font-family: var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    /* Search icon (left) */
    .blob-search-bar__icon {
      position:       absolute;
      left:           0.625rem;
      display:        flex;
      align-items:    center;
      pointer-events: none;
      color:          var(--color-text-subtle, rgba(0,0,0,0.4));
      z-index:        1;
    }
    .blob-search-bar__icon svg { width: 16px; height: 16px; }

    /* The <input> */
    .blob-search-bar__input {
      width:        100%;
      padding:      0.5rem 0.75rem 0.5rem 2.1rem;
      background:   var(--color-background, #fff);
      border:       1px solid var(--color-border, #d1d5db);
      border-radius: var(--radius-m, 6px);
      font-family:  var(--font-human, sans-serif);
      font-size:    0.875rem;
      color:        var(--color-text-default, rgba(0,0,0,0.8));
      line-height:  1.5;
      outline:      none;
      transition:   border-color 0.1s ease, box-shadow 0.1s ease;
    }
    .blob-search-bar__input::placeholder {
      color: var(--color-text-subtle, rgba(0,0,0,0.4));
    }
    .blob-search-bar__input:focus {
      border-color: var(--color-primary, #000);
      box-shadow:   0 0 0 3px color-mix(in srgb, var(--color-primary, #000) 15%, transparent);
    }
    /* Extra right padding when clear or shortcut is visible */
    .blob-search-bar--has-right .blob-search-bar__input {
      padding-right: 4.5rem;
    }

    /* Right slot — shortcut hint + clear */
    .blob-search-bar__right {
      position:    absolute;
      right:       0.5rem;
      display:     flex;
      align-items: center;
      gap:         0.25rem;
    }

    /* Keyboard shortcut badge */
    .blob-search-bar__shortcut {
      display:          inline-flex;
      align-items:      center;
      padding:          0.1rem 0.35rem;
      background:       var(--color-surface, rgba(0,0,0,0.06));
      border:           1px solid var(--color-border, #e5e5e5);
      border-radius:    var(--radius-s, 4px);
      font-size:        0.7rem;
      font-family:      var(--font-machine, monospace);
      color:            var(--color-text-subtle, rgba(0,0,0,0.45));
      pointer-events:   none;
      user-select:      none;
      white-space:      nowrap;
    }

    /* Clear button */
    .blob-search-bar__clear {
      display:          flex;
      align-items:      center;
      justify-content:  center;
      width:            22px;
      height:           22px;
      padding:          0;
      background:       var(--color-surface, rgba(0,0,0,0.06));
      border:           none;
      border-radius:    var(--radius-full, 9999px);
      cursor:           pointer;
      color:            var(--color-text-subtle, rgba(0,0,0,0.5));
      transition:       background 0.1s ease, color 0.1s ease;
    }
    .blob-search-bar__clear:hover {
      background: var(--color-surface-elevated, rgba(0,0,0,0.12));
      color:      var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-search-bar__clear:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 1px;
    }
    .blob-search-bar__clear svg { width: 11px; height: 11px; }
    .blob-search-bar__clear--hidden { display: none; }

    /* Results dropdown */
    .blob-search-bar__results {
      position:       absolute;
      top:            calc(100% + 4px);
      left:           0;
      right:          0;
      z-index:        1000;
      background:     var(--color-background, #fff);
      border:         1px solid var(--color-border, #e5e5e5);
      border-radius:  var(--radius-l, 10px);
      box-shadow:     var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1));
      padding:        0.25rem;
      max-height:     320px;
      overflow-y:     auto;
      display:        flex;
      flex-direction: column;
      gap:            1px;
      animation:      blob-search-results-in 0.1s ease;
    }
    .blob-search-bar__results--hidden { display: none; }

    @keyframes blob-search-results-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Result item */
    .blob-search-bar__result-item {
      display:       flex;
      align-items:   center;
      gap:           0.625rem;
      padding:       0.5rem 0.625rem;
      border-radius: var(--radius-m, 6px);
      cursor:        pointer;
      font-size:     0.875rem;
      color:         var(--color-text-default, rgba(0,0,0,0.8));
      outline:       none;
      transition:    background 0.08s ease;
      user-select:   none;
    }
    .blob-search-bar__result-item:hover,
    .blob-search-bar__result-item:focus {
      background: var(--color-surface, rgba(0,0,0,0.05));
    }
    .blob-search-bar__result-item-icon {
      display:     flex;
      align-items: center;
      color:       var(--color-text-subtle, rgba(0,0,0,0.4));
      flex-shrink: 0;
    }
    .blob-search-bar__result-item-icon svg,
    .blob-search-bar__result-item-icon img { width: 16px; height: 16px; }
    .blob-search-bar__result-item-body {
      flex:           1;
      min-width:      0;
      display:        flex;
      flex-direction: column;
    }
    .blob-search-bar__result-item-label {
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }
    .blob-search-bar__result-item-desc {
      font-size:     0.75rem;
      color:         var(--color-text-subtle, rgba(0,0,0,0.45));
      overflow:      hidden;
      text-overflow: ellipsis;
      white-space:   nowrap;
    }
    .blob-search-bar__result-trailing {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.4));
      font-size:   0.75rem;
    }

    /* Empty results */
    .blob-search-bar__results-empty {
      padding:   0.75rem 0.625rem;
      font-size: 0.875rem;
      color:     var(--color-text-subtle, rgba(0,0,0,0.45));
      text-align: center;
    }
  `;
  document.head.appendChild(style);
}

const SEARCH_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>';
const CLEAR_ICON  = '<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 2L2 9M2 2l7 7"/></svg>';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SearchResultItem {
  label:        string;
  description?: string;
  icon?:        HTMLElement;
  trailing?:    HTMLElement;
  onSelect?:    () => void;
}

export interface SearchBarOptions {
  placeholder?:  string;
  value?:        string;
  /** Optional keyboard shortcut badge displayed on the right (e.g. '⌘K'). */
  shortcut?:     string;
  /** Debounce delay in ms. Default: 200. */
  debounce?:     number;
  /** Empty string label shown when results = []. Default: 'No results'. */
  emptyLabel?:   string;
  onSearch?:     (query: string) => void;
  onClear?:      () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class SearchBar {
  public element:   HTMLElement;
  public inputEl!:  HTMLInputElement;
  private _resultsEl!: HTMLElement;
  private _clearBtn!:  HTMLButtonElement;
  private _opts:    SearchBarOptions;
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: SearchBarOptions = {}) {
    injectStyles();
    this._opts = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { placeholder = 'Search…', value = '', shortcut, debounce: delay = 200 } = this._opts;
    const hasRight = !!(shortcut);

    const wrap = document.createElement('div');
    wrap.className = ['blob-search-bar', hasRight ? 'blob-search-bar--has-right' : ''].filter(Boolean).join(' ');

    // Search icon
    const iconEl = document.createElement('span');
    iconEl.className = 'blob-search-bar__icon';
    iconEl.innerHTML  = SEARCH_ICON;
    wrap.appendChild(iconEl);

    // Input
    const input = document.createElement('input');
    input.type        = 'search';
    input.className   = 'blob-search-bar__input';
    input.placeholder = placeholder;
    input.value       = value;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    this.inputEl = input;
    wrap.appendChild(input);

    // Right slot
    const right = document.createElement('div');
    right.className = 'blob-search-bar__right';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.type      = 'button';
    clearBtn.className = ['blob-search-bar__clear', value ? '' : 'blob-search-bar__clear--hidden'].filter(Boolean).join(' ');
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.innerHTML = CLEAR_ICON;
    clearBtn.addEventListener('click', () => this.clear());
    right.appendChild(clearBtn);
    this._clearBtn = clearBtn;

    if (shortcut) {
      const sc = document.createElement('span');
      sc.className   = 'blob-search-bar__shortcut';
      sc.textContent = shortcut;
      right.appendChild(sc);
    }

    wrap.appendChild(right);

    // Results dropdown
    const results = document.createElement('div');
    results.className = 'blob-search-bar__results blob-search-bar__results--hidden';
    results.setAttribute('role', 'listbox');
    wrap.appendChild(results);
    this._resultsEl = results;

    // Input events
    input.addEventListener('input', () => {
      const q = input.value;
      // Toggle clear button
      clearBtn.classList.toggle('blob-search-bar__clear--hidden', !q);
      // Debounced search
      if (this._debounceTimer) clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._opts.onSearch?.(q), delay);
      // Hide results on empty
      if (!q) this.hideResults();
    });

    // Close results on outside click
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target as Node)) this.hideResults();
    });

    // Arrow key navigation into results
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const first = results.querySelector<HTMLElement>('.blob-search-bar__result-item');
        first?.focus();
      } else if (e.key === 'Escape') {
        this.hideResults();
        input.blur();
      }
    });

    results.addEventListener('keydown', (e) => {
      const items = Array.from(results.querySelectorAll<HTMLElement>('.blob-search-bar__result-item'));
      const idx   = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); idx <= 0 ? input.focus() : items[idx - 1]?.focus(); }
      if (e.key === 'Escape')    { this.hideResults(); input.focus(); }
    });

    return wrap;
  }

  /** Replace results dropdown content. Pass null to hide, [] to show empty state. */
  public setResults(items: SearchResultItem[] | null): void {
    const el = this._resultsEl;
    el.innerHTML = '';

    if (items === null) {
      this.hideResults();
      return;
    }

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className   = 'blob-search-bar__results-empty';
      empty.textContent = this._opts.emptyLabel ?? 'No results';
      el.appendChild(empty);
    } else {
      for (const item of items) {
        const row = document.createElement('div');
        row.className  = 'blob-search-bar__result-item';
        row.setAttribute('role', 'option');
        row.tabIndex   = 0;

        if (item.icon) {
          const iw = document.createElement('span');
          iw.className = 'blob-search-bar__result-item-icon';
          iw.appendChild(item.icon);
          row.appendChild(iw);
        }

        const body = document.createElement('div');
        body.className = 'blob-search-bar__result-item-body';
        const lbl = document.createElement('span');
        lbl.className   = 'blob-search-bar__result-item-label';
        lbl.textContent = item.label;
        body.appendChild(lbl);
        if (item.description) {
          const desc = document.createElement('span');
          desc.className   = 'blob-search-bar__result-item-desc';
          desc.textContent = item.description;
          body.appendChild(desc);
        }
        row.appendChild(body);

        if (item.trailing) {
          const tw = document.createElement('span');
          tw.className = 'blob-search-bar__result-trailing';
          tw.appendChild(item.trailing);
          row.appendChild(tw);
        }

        row.addEventListener('click', () => { item.onSelect?.(); this.hideResults(); });
        row.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.onSelect?.(); this.hideResults(); }
        });

        el.appendChild(row);
      }
    }

    el.classList.remove('blob-search-bar__results--hidden');
  }

  public hideResults(): void {
    this._resultsEl.classList.add('blob-search-bar__results--hidden');
  }

  public clear(): void {
    this.inputEl.value = '';
    this._clearBtn.classList.add('blob-search-bar__clear--hidden');
    this.hideResults();
    this._opts.onClear?.();
    this._opts.onSearch?.('');
    this.inputEl.focus();
  }

  public get value(): string { return this.inputEl.value; }

  public setValue(val: string): void {
    this.inputEl.value = val;
    this._clearBtn.classList.toggle('blob-search-bar__clear--hidden', !val);
  }
}
