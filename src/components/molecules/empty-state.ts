/**
 * EmptyState component — blob-empty-state
 *
 * Blank-slate placeholder shown when a list, table, or section has no content.
 * Provides an optional illustration/icon, heading, description, and CTA action.
 *
 * CSS class: blob-empty-state
 *
 * @example
 * ```typescript
 * const emptySearch = new EmptyState({
 *   icon:        searchIcon,
 *   title:       'No results found',
 *   description: 'Try adjusting your search or filters.',
 * });
 *
 * // With primary action
 * const emptyProjects = new EmptyState({
 *   icon:        folderIcon,
 *   title:       'No projects yet',
 *   description: 'Create your first project to get started.',
 *   action:      new Button({ label: 'New project', variant: 'primary' }).element,
 * });
 *
 * // Compact (inside a card or table)
 * const empty = new EmptyState({ title: 'Nothing here yet', compact: true });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-empty-state';
  style.textContent = `
    .blob-empty-state {
      display:         flex;
      flex-direction:  column;
      align-items:     center;
      justify-content: center;
      text-align:      center;
      padding:         3.5rem 2rem;
      font-family:     var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    .blob-empty-state--compact {
      padding: 1.75rem 1.25rem;
    }

    /* Icon / illustration */
    .blob-empty-state__icon {
      display:        flex;
      align-items:    center;
      justify-content: center;
      width:          56px;
      height:         56px;
      border-radius:  var(--radius-l, 10px);
      background:     var(--color-surface, rgba(0,0,0,0.04));
      color:          var(--color-text-subtle, rgba(0,0,0,0.35));
      margin-bottom:  1.25rem;
      flex-shrink:    0;
    }
    .blob-empty-state--compact .blob-empty-state__icon {
      width:  40px;
      height: 40px;
      margin-bottom: 0.875rem;
    }
    .blob-empty-state__icon svg,
    .blob-empty-state__icon img { width: 28px; height: 28px; }
    .blob-empty-state--compact .blob-empty-state__icon svg,
    .blob-empty-state--compact .blob-empty-state__icon img { width: 20px; height: 20px; }

    /* Text */
    .blob-empty-state__title {
      font-size:     1rem;
      font-weight:   600;
      color:         var(--color-text-primary, #000);
      line-height:   1.3;
      margin-bottom: 0.375rem;
    }
    .blob-empty-state--compact .blob-empty-state__title {
      font-size: 0.9375rem;
    }

    .blob-empty-state__description {
      font-size:   0.875rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.5));
      line-height: 1.6;
      max-width:   360px;
    }

    /* Action(s) */
    .blob-empty-state__actions {
      display:     flex;
      align-items: center;
      gap:         0.625rem;
      flex-wrap:   wrap;
      justify-content: center;
      margin-top:  1.25rem;
    }
    .blob-empty-state--compact .blob-empty-state__actions {
      margin-top: 0.875rem;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EmptyStateOptions {
  title:        string;
  description?: string;
  /** Icon or illustration element. */
  icon?:         HTMLElement;
  /** Primary CTA — typically a Button element. Can also be an array. */
  action?:       HTMLElement | HTMLElement[];
  /** Reduce padding for use inside a card or table. */
  compact?:      boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class EmptyState {
  public element: HTMLElement;

  constructor(options: EmptyStateOptions) {
    injectStyles();
    this.element = this.build(options);
  }

  private build(options: EmptyStateOptions): HTMLElement {
    const { title, description, icon, action, compact = false } = options;

    const el = document.createElement('div');
    el.className = ['blob-empty-state', compact ? 'blob-empty-state--compact' : ''].filter(Boolean).join(' ');

    // Icon
    if (icon) {
      const iconWrap = document.createElement('div');
      iconWrap.className = 'blob-empty-state__icon';
      iconWrap.appendChild(icon);
      el.appendChild(iconWrap);
    }

    // Title
    const titleEl = document.createElement('div');
    titleEl.className   = 'blob-empty-state__title';
    titleEl.textContent = title;
    el.appendChild(titleEl);

    // Description
    if (description) {
      const descEl = document.createElement('div');
      descEl.className   = 'blob-empty-state__description';
      descEl.textContent = description;
      el.appendChild(descEl);
    }

    // Action(s)
    if (action) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'blob-empty-state__actions';
      const actions = Array.isArray(action) ? action : [action];
      for (const a of actions) actionsEl.appendChild(a);
      el.appendChild(actionsEl);
    }

    return el;
  }
}
