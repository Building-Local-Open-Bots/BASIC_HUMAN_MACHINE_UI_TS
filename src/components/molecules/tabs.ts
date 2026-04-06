/**
 * Tabs component — blob-tabs
 *
 * Accessible tab group with ARIA `tablist` / `tab` / `tabpanel` semantics.
 * Same coordination pattern as Switch but adds content panels and two style
 * variants. Keyboard: Arrow keys navigate tabs, Enter/Space activates.
 *
 * CSS class: blob-tabs
 * Variants:  line    — underline indicator (default)
 *            pill    — filled pill, same style as blob-switch
 *            boxed   — full border box around active tab
 *
 * @example
 * ```typescript
 * const overview = document.createElement('div');
 * overview.textContent = 'Overview content here';
 *
 * const tabs = new Tabs({
 *   items: [
 *     { id: 'overview',  label: 'Overview',  panel: overviewEl },
 *     { id: 'activity',  label: 'Activity',  panel: activityEl, badge: '3' },
 *     { id: 'settings',  label: 'Settings',  panel: settingsEl },
 *   ],
 *   active: 'overview',
 *   onChange: (id) => console.log(id),
 * });
 *
 * // With icon
 * const tabs = new Tabs({
 *   items: [
 *     { id: 'code',    label: 'Code',    icon: codeIcon },
 *     { id: 'preview', label: 'Preview', icon: eyeIcon  },
 *   ],
 *   variant: 'pill',
 * });
 *
 * // Switch active tab programmatically
 * tabs.select('settings');
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-tabs';
  style.textContent = `
    /* Wrapper */
    .blob-tabs {
      display:        flex;
      flex-direction: column;
      gap:            0;
    }

    /* Tab list */
    .blob-tabs__list {
      display:     flex;
      align-items: stretch;
      flex-shrink: 0;
    }

    /* ------------------------------------------------------------------ */
    /* LINE VARIANT (default) ------------------------------------------- */
    /* ------------------------------------------------------------------ */
    .blob-tabs--line .blob-tabs__list {
      border-bottom: 1px solid var(--color-border, #e5e5e5);
      gap:           0;
    }

    .blob-tabs--line .blob-tabs__tab {
      position:          relative;
      display:           inline-flex;
      align-items:       center;
      gap:               0.375rem;
      padding:           0.625rem 1rem;
      background:        none;
      border:            none;
      border-bottom:     2px solid transparent;
      margin-bottom:     -1px; /* sit on top of list border */
      font-family:       var(--font-human, sans-serif);
      font-size:         0.875rem;
      font-weight:       400;
      color:             var(--color-text-subtle, rgba(0,0,0,0.45));
      cursor:            pointer;
      white-space:       nowrap;
      user-select:       none;
      transition:        color 0.15s ease, border-color 0.15s ease;
      -webkit-font-smoothing: antialiased;
    }
    .blob-tabs--line .blob-tabs__tab:hover:not([aria-selected="true"]):not(:disabled) {
      color: var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-tabs--line .blob-tabs__tab[aria-selected="true"] {
      color:        var(--color-primary, #000);
      font-weight:  500;
      border-bottom-color: var(--color-primary, #000);
    }

    /* ------------------------------------------------------------------ */
    /* PILL VARIANT ----------------------------------------------------- */
    /* ------------------------------------------------------------------ */
    .blob-tabs--pill .blob-tabs__list {
      display:          inline-flex;
      border:           1px solid var(--color-border, #e5e5e5);
      border-radius:    var(--radius-m, 6px);
      overflow:         hidden;
      background:       var(--color-surface, #f5f5f5);
      align-self:       flex-start; /* don't stretch full-width */
      margin-bottom:    0.75rem;
    }
    .blob-tabs--pill .blob-tabs__tab {
      display:       inline-flex;
      align-items:   center;
      gap:           0.375rem;
      padding:       0.375rem 0.875rem;
      background:    transparent;
      border:        none;
      border-right:  1px solid var(--color-border, #e5e5e5);
      font-family:   var(--font-human, sans-serif);
      font-size:     0.875rem;
      font-weight:   400;
      color:         var(--color-text-default, rgba(0,0,0,0.8));
      cursor:        pointer;
      white-space:   nowrap;
      user-select:   none;
      transition:    background 0.1s ease;
      -webkit-font-smoothing: antialiased;
    }
    .blob-tabs--pill .blob-tabs__tab:last-child { border-right: none; }
    .blob-tabs--pill .blob-tabs__tab:hover:not([aria-selected="true"]):not(:disabled) {
      background: var(--color-surface-elevated, rgba(0,0,0,0.05));
    }
    .blob-tabs--pill .blob-tabs__tab[aria-selected="true"] {
      background: var(--color-primary, #000);
      color:      var(--color-on-primary, #fff);
    }

    /* ------------------------------------------------------------------ */
    /* BOXED VARIANT ---------------------------------------------------- */
    /* ------------------------------------------------------------------ */
    .blob-tabs--boxed .blob-tabs__list {
      gap:           0.25rem;
      border-bottom: 1px solid var(--color-border, #e5e5e5);
      padding:       0 0 0 0;
    }
    .blob-tabs--boxed .blob-tabs__tab {
      display:       inline-flex;
      align-items:   center;
      gap:           0.375rem;
      padding:       0.5rem 1rem;
      background:    transparent;
      border:        1px solid transparent;
      border-bottom: none;
      border-radius: var(--radius-m, 6px) var(--radius-m, 6px) 0 0;
      font-family:   var(--font-human, sans-serif);
      font-size:     0.875rem;
      font-weight:   400;
      color:         var(--color-text-subtle, rgba(0,0,0,0.45));
      cursor:        pointer;
      white-space:   nowrap;
      user-select:   none;
      translate:     0 1px; /* overlap the list border */
      transition:    color 0.1s ease, background 0.1s ease;
      -webkit-font-smoothing: antialiased;
    }
    .blob-tabs--boxed .blob-tabs__tab:hover:not([aria-selected="true"]):not(:disabled) {
      color: var(--color-text-default, rgba(0,0,0,0.8));
      background: var(--color-surface, rgba(0,0,0,0.03));
    }
    .blob-tabs--boxed .blob-tabs__tab[aria-selected="true"] {
      background:   var(--color-background, #fff);
      color:        var(--color-text-primary, #000);
      font-weight:  500;
      border-color: var(--color-border, #e5e5e5);
    }

    /* ------------------------------------------------------------------ */
    /* Shared tab states ------------------------------------------------ */
    /* ------------------------------------------------------------------ */
    .blob-tabs__tab:disabled {
      opacity:        0.38;
      cursor:         not-allowed;
      pointer-events: none;
    }
    .blob-tabs__tab:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: -2px;
      z-index:        1;
      position:       relative;
    }

    /* Icon inside tab */
    .blob-tabs__tab-icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }
    .blob-tabs__tab-icon svg,
    .blob-tabs__tab-icon img {
      width:  16px;
      height: 16px;
    }

    /* Badge inside tab */
    .blob-tabs__tab-badge {
      display:         inline-flex;
      align-items:     center;
      justify-content: center;
      min-width:       18px;
      height:          18px;
      padding:         0 4px;
      background:      var(--color-surface-elevated, #e5e5e5);
      color:           var(--color-text-default, rgba(0,0,0,0.7));
      border-radius:   var(--radius-full, 9999px);
      font-size:       0.6875rem;
      font-weight:     500;
      line-height:     1;
    }
    .blob-tabs__tab[aria-selected="true"] .blob-tabs__tab-badge {
      background: color-mix(in srgb, currentColor 15%, transparent);
    }
    .blob-tabs--pill .blob-tabs__tab[aria-selected="true"] .blob-tabs__tab-badge {
      background: rgba(255,255,255,0.25);
      color:      inherit;
    }

    /* ------------------------------------------------------------------ */
    /* Panels ----------------------------------------------------------- */
    /* ------------------------------------------------------------------ */
    .blob-tabs__panels {
      flex: 1;
    }
    .blob-tabs__panel {
      display: none;
    }
    .blob-tabs__panel--active {
      display: block;
    }
    .blob-tabs--line .blob-tabs__panels,
    .blob-tabs--boxed .blob-tabs__panels {
      padding-top: 0.75rem;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TabVariant = 'line' | 'pill' | 'boxed';

export interface TabItem {
  id:        string;
  label:     string;
  /** Icon shown before the label. */
  icon?:     HTMLElement;
  /** Short string shown as a badge (e.g. "3" for unread count). */
  badge?:    string;
  /** Panel content rendered below the tab list. */
  panel?:    HTMLElement;
  disabled?: boolean;
}

export interface TabsOptions {
  items:      TabItem[];
  /** Initially selected tab id. Defaults to the first item. */
  active?:    string;
  variant?:   TabVariant;
  /** Accessible label for the tab list. */
  ariaLabel?: string;
  onChange?:  (id: string) => void;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------
interface TabRef {
  btn:   HTMLButtonElement;
  panel: HTMLElement | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Tabs {
  public element:   HTMLElement;
  public listEl!:   HTMLElement;
  public panelsEl!: HTMLElement;
  private _active:  string;
  private _refs:    Map<string, TabRef> = new Map();
  private _onChange: ((id: string) => void) | undefined;

  constructor(options: TabsOptions) {
    injectStyles();

    if (!options.items || options.items.length < 1) {
      throw new Error('Tabs requires at least 1 item.');
    }

    this._active   = options.active ?? options.items[0].id;
    this._onChange = options.onChange;
    this.element   = this.build(options);
  }

  private build(options: TabsOptions): HTMLElement {
    const { items, variant = 'line', ariaLabel } = options;

    const wrapper = document.createElement('div');
    wrapper.className = ['blob-tabs', `blob-tabs--${variant}`].join(' ');

    // Tab list
    const list = document.createElement('div');
    list.className = 'blob-tabs__list';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-orientation', 'horizontal');
    if (ariaLabel) list.setAttribute('aria-label', ariaLabel);
    this.listEl = list;

    // Panels container
    const panels = document.createElement('div');
    panels.className = 'blob-tabs__panels';
    this.panelsEl = panels;

    // Build each tab + panel
    for (const item of items) {
      const panelId = `blob-tabs-panel-${item.id}`;
      const tabId   = `blob-tabs-tab-${item.id}`;
      const isActive = item.id === this._active;

      // Tab button
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'blob-tabs__tab';
      btn.id        = tabId;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
      if (item.disabled) btn.disabled = true;

      if (item.icon) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'blob-tabs__tab-icon';
        iconWrap.appendChild(item.icon);
        btn.appendChild(iconWrap);
      }

      const labelEl = document.createElement('span');
      labelEl.textContent = item.label;
      btn.appendChild(labelEl);

      if (item.badge) {
        const badgeEl = document.createElement('span');
        badgeEl.className   = 'blob-tabs__tab-badge';
        badgeEl.textContent = item.badge;
        btn.appendChild(badgeEl);
      }

      btn.addEventListener('click', () => {
        if (!item.disabled) this.select(item.id);
      });

      list.appendChild(btn);

      // Panel
      let panel: HTMLElement | null = null;
      if (item.panel) {
        panel = document.createElement('div');
        panel.className  = ['blob-tabs__panel', isActive ? 'blob-tabs__panel--active' : ''].filter(Boolean).join(' ');
        panel.id         = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
        if (!isActive) panel.setAttribute('hidden', '');
        panel.appendChild(item.panel);
        panels.appendChild(panel);
      }

      this._refs.set(item.id, { btn, panel });
    }

    // Keyboard navigation (roving tabindex)
    list.addEventListener('keydown', (e) => this.handleKey(e, items));

    wrapper.appendChild(list);
    wrapper.appendChild(panels);

    return wrapper;
  }

  private handleKey(e: KeyboardEvent, items: TabItem[]): void {
    const ids      = items.filter(i => !i.disabled).map(i => i.id);
    const curIndex = ids.indexOf(this._active);
    let next: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (curIndex + 1) % ids.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (curIndex - 1 + ids.length) % ids.length;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = ids.length - 1;
    }

    if (next !== null) {
      e.preventDefault();
      this.select(ids[next]);
      this._refs.get(ids[next])?.btn.focus();
    }
  }

  /** Select a tab by id. Fires onChange. */
  public select(id: string): void {
    if (id === this._active) return;

    const prev = this._refs.get(this._active);
    const next = this._refs.get(id);
    if (!next) return;

    // Deactivate old
    if (prev) {
      prev.btn.setAttribute('aria-selected', 'false');
      prev.btn.setAttribute('tabindex', '-1');
      if (prev.panel) {
        prev.panel.classList.remove('blob-tabs__panel--active');
        prev.panel.setAttribute('hidden', '');
      }
    }

    // Activate new
    next.btn.setAttribute('aria-selected', 'true');
    next.btn.setAttribute('tabindex', '0');
    if (next.panel) {
      next.panel.classList.add('blob-tabs__panel--active');
      next.panel.removeAttribute('hidden');
    }

    this._active = id;
    this._onChange?.(id);
  }

  public get active(): string { return this._active; }

  /** Silently set active tab without firing onChange. */
  public setValue(id: string): void {
    const cb = this._onChange;
    this._onChange = undefined;
    this.select(id);
    this._onChange = cb;
  }

  /** Update the badge count on a specific tab. */
  public setBadge(id: string, badge: string | null): void {
    const ref = this._refs.get(id);
    if (!ref) return;
    let badgeEl = ref.btn.querySelector('.blob-tabs__tab-badge') as HTMLElement | null;
    if (badge === null) {
      badgeEl?.remove();
    } else if (badgeEl) {
      badgeEl.textContent = badge;
    } else {
      badgeEl = document.createElement('span');
      badgeEl.className   = 'blob-tabs__tab-badge';
      badgeEl.textContent = badge;
      ref.btn.appendChild(badgeEl);
    }
  }
}
