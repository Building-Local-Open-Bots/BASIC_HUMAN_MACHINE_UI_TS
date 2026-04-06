/**
 * Switch component — blob-switch
 *
 * A segmented control (radio group) built from Button elements. Exactly one
 * segment is active at a time. Segments support text, icon, or icon + text
 * (matching the Button content modes).
 *
 * CSS class:  blob-switch
 * Internals:  blob-switch > .blob-button  (each segment inherits Button styles)
 *
 * @example
 * ```typescript
 * // Text-only segments
 * const view = new Switch({
 *   items: [
 *     { value: 'grid',  label: 'Grid' },
 *     { value: 'list',  label: 'List' },
 *     { value: 'table', label: 'Table' },
 *   ],
 *   value: 'grid',
 *   onChange: (v) => setView(v),
 * });
 *
 * // Icon-only segments (ariaLabel required per item)
 * const align = new Switch({
 *   items: [
 *     { value: 'left',   icon: iconLeft,   ariaLabel: 'Align left' },
 *     { value: 'center', icon: iconCenter, ariaLabel: 'Align center' },
 *     { value: 'right',  icon: iconRight,  ariaLabel: 'Align right' },
 *   ],
 * });
 *
 * // Icon + text
 * const mode = new Switch({
 *   items: [
 *     { value: 'preview', icon: eyeIcon, label: 'Preview' },
 *     { value: 'code',    icon: codeIcon, label: 'Code' },
 *   ],
 * });
 * ```
 */

import { Button } from './button';
import type { ButtonSize } from './button';

// ---------------------------------------------------------------------------
// Style injection
// ---------------------------------------------------------------------------
let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-switch';

  style.textContent = `
    /* Container ------------------------------------------------------------- */
    .blob-switch {
      display:          inline-flex;
      border:           1px solid var(--color-border, #e5e5e5);
      border-radius:    var(--radius-m, 6px);
      overflow:         hidden;
      background-color: var(--color-surface, #f5f5f5);
    }

    /* Override Button styles inside switch ---------------------------------- */
    .blob-switch > .blob-button {
      border-radius:    0;
      border-top:       none;
      border-bottom:    none;
      border-left:      none;
      border-right:     1px solid var(--color-border, #e5e5e5);
      background-color: transparent;
      color:            var(--color-text-default, rgba(0, 0, 0, 0.8));
      transition:       background-color 0.15s ease, color 0.15s ease;
      /* Reset hover opacity change from base .blob-button */
      opacity:          1;
    }
    .blob-switch > .blob-button:last-child {
      border-right: none;
    }
    /* Hover on inactive */
    .blob-switch > .blob-button:hover:not(:disabled):not([aria-pressed="true"]) {
      background-color: var(--color-surface-elevated, rgba(0,0,0,0.06));
      opacity:          1;
    }
    .blob-switch > .blob-button:active:not(:disabled):not([aria-pressed="true"]) {
      background-color: var(--color-border, #e5e5e5);
      opacity:          1;
    }

    /* Active segment -------------------------------------------------------- */
    .blob-switch > .blob-button[aria-pressed="true"] {
      background-color: var(--color-primary, #000) !important;
      color:            var(--color-on-primary, #fff) !important;
      opacity:          1 !important;
    }

    /* Disabled segment ------------------------------------------------------ */
    .blob-switch > .blob-button[disabled],
    .blob-switch > .blob-button.blob-button--disabled {
      opacity:        0.38;
      cursor:         not-allowed;
      pointer-events: none;
    }

    /* Focus ring scoped to switch ------------------------------------------- */
    .blob-switch > .blob-button:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: -2px;
      z-index:        1;
      position:       relative;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SwitchItem {
  /** Unique value returned by onChange. */
  value:      string;
  /** Text displayed in the segment. Omit for icon-only mode. */
  label?:     string;
  /** Icon element. Used as iconLeft when label is also provided. */
  icon?:      HTMLElement;
  /** Required when the segment is icon-only (for screen readers). */
  ariaLabel?: string;
  disabled?:  boolean;
}

export interface SwitchOptions {
  items:      SwitchItem[];
  /** Initially selected value. Defaults to the first item's value. */
  value?:     string;
  /** Button size for all segments. Defaults to 'md'. */
  size?:      ButtonSize;
  /** Accessible label for the group element (e.g. "View mode"). */
  ariaLabel?: string;
  onChange?:  (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Switch {
  public element: HTMLElement;
  private _value: string;
  private _buttons: Map<string, Button> = new Map();
  private onChange: ((value: string) => void) | undefined;

  constructor(options: SwitchOptions) {
    injectStyles();

    if (!options.items || options.items.length < 2) {
      throw new Error('Switch requires at least 2 items.');
    }

    this._value   = options.value ?? options.items[0].value;
    this.onChange = options.onChange;
    this.element  = this.build(options);
  }

  private build(options: SwitchOptions): HTMLElement {
    const { items, size, ariaLabel } = options;

    const container = document.createElement('div');
    container.className = 'blob-switch';
    container.setAttribute('role', 'group');
    if (ariaLabel) container.setAttribute('aria-label', ariaLabel);

    for (const item of items) {
      const button = new Button({
        label:     item.label,
        iconLeft:  item.icon,
        ariaLabel: item.ariaLabel,
        variant:   'ghost',
        size:      size ?? 'md',
        disabled:  item.disabled,
      });

      // Set initial aria-pressed
      button.element.setAttribute('aria-pressed', item.value === this._value ? 'true' : 'false');

      // Click handler — managed externally so no Button re-render needed
      button.element.addEventListener('click', () => {
        if (item.disabled) return;
        this.select(item.value);
      });

      this._buttons.set(item.value, button);
      container.appendChild(button.element);
    }

    return container;
  }

  /** Programmatically select a segment by value. Fires onChange. */
  public select(value: string): void {
    if (value === this._value) return;
    this._value = value;

    for (const [v, btn] of this._buttons) {
      btn.element.setAttribute('aria-pressed', v === value ? 'true' : 'false');
    }

    this.onChange?.(value);
  }

  /** Get the currently active value. */
  public get value(): string { return this._value; }

  /** Silently set the active value without firing onChange. */
  public setValue(value: string): void {
    if (!this._buttons.has(value)) return;
    this._value = value;
    for (const [v, btn] of this._buttons) {
      btn.element.setAttribute('aria-pressed', v === value ? 'true' : 'false');
    }
  }

  /** Enable or disable an individual segment. */
  public setItemDisabled(value: string, disabled: boolean): void {
    const btn = this._buttons.get(value);
    if (!btn) return;
    btn.setDisabled(disabled);
  }
}
