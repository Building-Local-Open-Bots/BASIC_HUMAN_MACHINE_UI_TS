/**
 * ActionBar component — blob-action-bar
 *
 * A horizontal bar of contextual action buttons, typically docked at the
 * bottom of a widget or modal. Supports a hint label on the left, primary
 * and secondary action groups, and an optional trailing slot.
 *
 * Three layout variants:
 *  - default  — flush background matching surface (toolbar feel)
 *  - elevated — subtle shadow to lift above content
 *  - ghost    — transparent, just the buttons
 *
 * Alignment:
 *  - end (default)     — actions aligned to the right
 *  - start             — actions aligned to the left
 *  - between           — hint label on left, actions on right
 *  - center            — everything centered
 *
 * CSS class: blob-action-bar
 *
 * @example
 * ```typescript
 * const bar = new ActionBar({
 *   hint: 'Unsaved changes',
 *   actions: [
 *     new Button({ label: 'Discard', variant: 'ghost' }).element,
 *     new Button({ label: 'Save',    variant: 'primary' }).element,
 *   ],
 * });
 *
 * // Suggestion chips (ghost variant)
 * const bar = new ActionBar({
 *   hint:    'Try asking:',
 *   variant: 'ghost',
 *   actions: suggestions.map(s =>
 *     new Button({ label: s, variant: 'secondary', size: 'sm', onClick: () => ask(s) }).element
 *   ),
 * });
 *
 * // With separator and trailing slot
 * const bar = new ActionBar({
 *   actions:  [cancelBtn, saveBtn],
 *   trailing: helpBtn,
 *   align:    'between',
 * });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-action-bar';
  style.textContent = `
    .blob-action-bar {
      display:     flex;
      align-items: center;
      gap:         0.5rem;
      padding:     0.625rem 0.875rem;
      font-family: var(--font-human, sans-serif);
      flex-shrink: 0;
      flex-wrap:   wrap;
      -webkit-font-smoothing: antialiased;
    }

    /* Variants */
    .blob-action-bar--default  {
      background:  var(--color-surface, rgba(0,0,0,0.025));
      border-top:  1px solid var(--color-border, #e5e5e5);
    }
    .blob-action-bar--elevated {
      background:  var(--color-background, #fff);
      border-top:  1px solid var(--color-border, #e5e5e5);
      box-shadow:  var(--shadow-sm, 0 -2px 8px rgba(0,0,0,0.05));
    }
    .blob-action-bar--ghost { background: transparent; }

    /* Hint label */
    .blob-action-bar__hint {
      font-size:  0.8125rem;
      color:      var(--color-text-subtle, rgba(0,0,0,0.45));
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Spacer — pushes things to opposite sides in 'between' layout */
    .blob-action-bar__spacer { flex: 1; }

    /* Action group */
    .blob-action-bar__actions {
      display:     flex;
      align-items: center;
      gap:         0.375rem;
      flex-wrap:   wrap;
    }

    /* Trailing slot */
    .blob-action-bar__trailing {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }

    /* Alignment helpers applied to root */
    .blob-action-bar--start   { justify-content: flex-start; }
    .blob-action-bar--end     { justify-content: flex-end; }
    .blob-action-bar--center  { justify-content: center; }
    .blob-action-bar--between { justify-content: space-between; }

    /* Separator */
    .blob-action-bar__sep {
      width:       1px;
      height:      20px;
      background:  var(--color-border, #e5e5e5);
      flex-shrink: 0;
      margin:      0 0.125rem;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ActionBarVariant = 'default' | 'elevated' | 'ghost';
export type ActionBarAlign   = 'start' | 'end' | 'center' | 'between';

export interface ActionBarOptions {
  /** Descriptive text on the leading side (e.g. "2 items selected", "Try asking:"). */
  hint?:     string;
  /** Action elements (Buttons, Tags, etc.). */
  actions?:  HTMLElement[];
  /** Element placed at the far trailing end after a separator. */
  trailing?: HTMLElement;
  variant?:  ActionBarVariant;
  align?:    ActionBarAlign;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class ActionBar {
  public element:   HTMLElement;
  public actionsEl: HTMLElement;
  private _opts:    ActionBarOptions;

  constructor(options: ActionBarOptions = {}) {
    injectStyles();
    this._opts = options;
    const { bar, actionsEl } = this.build();
    this.element    = bar;
    this.actionsEl  = actionsEl;
  }

  private build(): { bar: HTMLElement; actionsEl: HTMLElement } {
    const { hint, actions = [], trailing, variant = 'default', align = 'end' } = this._opts;

    const bar = document.createElement('div');
    bar.className = [
      'blob-action-bar',
      `blob-action-bar--${variant}`,
      `blob-action-bar--${align}`,
    ].join(' ');

    // Hint label
    if (hint) {
      const hintEl = document.createElement('span');
      hintEl.className   = 'blob-action-bar__hint';
      hintEl.textContent = hint;
      bar.appendChild(hintEl);
    }

    // For 'between': spacer pushes actions to the right
    if (align === 'between' && hint) {
      const spacer = document.createElement('div');
      spacer.className = 'blob-action-bar__spacer';
      bar.appendChild(spacer);
    }

    // Actions group
    const actionsEl = document.createElement('div');
    actionsEl.className = 'blob-action-bar__actions';
    for (const action of actions) actionsEl.appendChild(action);
    bar.appendChild(actionsEl);

    // Trailing
    if (trailing) {
      const sep = document.createElement('div');
      sep.className = 'blob-action-bar__sep';
      bar.appendChild(sep);

      const trailWrap = document.createElement('div');
      trailWrap.className = 'blob-action-bar__trailing';
      trailWrap.appendChild(trailing);
      bar.appendChild(trailWrap);
    }

    return { bar, actionsEl };
  }

  /** Replace all action elements. */
  public setActions(actions: HTMLElement[]): void {
    this.actionsEl.innerHTML = '';
    for (const a of actions) this.actionsEl.appendChild(a);
  }

  /** Update hint text. */
  public setHint(hint: string): void {
    const el = this.element.querySelector('.blob-action-bar__hint');
    if (el) {
      el.textContent = hint;
    } else {
      const hintEl = document.createElement('span');
      hintEl.className   = 'blob-action-bar__hint';
      hintEl.textContent = hint;
      this.element.insertBefore(hintEl, this.element.firstChild);
    }
  }
}
