/**
 * Input component — blob-input
 *
 * A single-line text input with optional label, helper text, error state,
 * and icon/action slots on either side. All visual properties come from CSS
 * vars. Tailwind utilities handle padding and font size per size variant.
 *
 * CSS class:  blob-input-wrapper  (outer container)
 *             blob-input-label
 *             blob-input-field    (the <input> itself)
 *             blob-input-helper
 *             blob-input--error
 *             blob-input--disabled
 *
 * @example
 * ```typescript
 * const email = new Input({ label: 'Email', type: 'email', placeholder: 'you@example.com' });
 * const search = new Input({ placeholder: 'Search…', iconLeft: searchIconEl });
 * const pw = new Input({ label: 'Password', type: 'password', size: 'lg' });
 * const bad = new Input({ label: 'Username', value: 'x', error: 'Too short' });
 * ```
 */

// ---------------------------------------------------------------------------
// Style injection
// ---------------------------------------------------------------------------
let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-input';

  style.textContent = `
    /* Wrapper --------------------------------------------------------------- */
    .blob-input-wrapper {
      display:        flex;
      flex-direction: column;
      gap:            0.25rem;
      width:          100%;
    }

    /* Label ----------------------------------------------------------------- */
    .blob-input-label {
      font-family: var(--font-human, sans-serif);
      font-size:   0.8125rem;
      font-weight: 500;
      color:       var(--color-text-primary, #000);
      line-height: 1.4;
    }
    .blob-input--error  .blob-input-label  { color: #dc2626; }

    /* Field row (icon + input + action) ------------------------------------- */
    .blob-input-row {
      position:         relative;
      display:          flex;
      align-items:      center;
      background-color: var(--color-surface, #fff);
      border:           1px solid var(--color-border, #e5e5e5);
      border-radius:    var(--radius-m, 6px);
      transition:       border-color 0.15s ease, box-shadow 0.15s ease;
      overflow:         hidden;
    }
    .blob-input-row:focus-within {
      border-color: var(--color-primary, #000);
      box-shadow:   0 0 0 3px color-mix(in srgb, var(--color-primary, #000) 15%, transparent);
    }
    .blob-input--error  .blob-input-row {
      border-color: #dc2626;
    }
    .blob-input--error  .blob-input-row:focus-within {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
    }
    .blob-input--disabled .blob-input-row {
      background-color: var(--color-surface, #f5f5f5);
      opacity:          0.5;
      pointer-events:   none;
    }

    /* Icon slots ------------------------------------------------------------ */
    .blob-input-icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      color:       var(--color-text-subtle, rgba(0,0,0,0.5));
      padding:     0 0.5rem;
    }
    .blob-input-icon svg,
    .blob-input-icon img {
      width:  1rem;
      height: 1rem;
    }

    /* Action slot (right side) — e.g. a Button component ------------------- */
    .blob-input-action {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
      padding:     0 0.25rem;
    }

    /* The <input> itself ---------------------------------------------------- */
    .blob-input-field {
      flex:             1;
      background:       transparent;
      border:           none;
      outline:          none;
      font-family:      var(--font-human, sans-serif);
      color:            var(--color-text-default, #000);
      caret-color:      var(--color-primary, #000);
      min-width:        0;
    }
    .blob-input-field::placeholder {
      color: var(--color-text-subtle, rgba(0,0,0,0.4));
    }

    /* Helper / error text --------------------------------------------------- */
    .blob-input-helper {
      font-family: var(--font-human, sans-serif);
      font-size:   0.75rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.5));
      line-height: 1.4;
    }
    .blob-input--error .blob-input-helper {
      color: #dc2626;
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Size → Tailwind classes applied to the <input> field
// ---------------------------------------------------------------------------
const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'px-2 py-1   text-xs',
  md: 'px-3 py-2   text-sm',
  lg: 'px-4 py-2.5 text-base',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';

export interface InputOptions {
  label?:       string;
  placeholder?: string;
  value?:       string;
  type?:        InputType;
  size?:        InputSize;
  disabled?:    boolean;
  /** Error message — also applies error styling to the field */
  error?:       string;
  /** Helper text shown below the field (hidden when error is set) */
  helper?:      string;
  /** Element placed inside the field on the left (e.g. search icon svg) */
  iconLeft?:    HTMLElement;
  /** Element placed inside the field on the right before the action */
  iconRight?:   HTMLElement;
  /** Element placed in the action slot on the far right (e.g. a Button) */
  action?:      HTMLElement;
  /** Extra classes on the outer wrapper */
  className?:   string;
  onChange?:    (value: string) => void;
  onEnter?:     (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Input {
  public element: HTMLElement;
  public inputEl!: HTMLInputElement;

  private options: Required<Omit<InputOptions, 'iconLeft' | 'iconRight' | 'action' | 'className' | 'onChange' | 'onEnter'>> &
    Pick<InputOptions, 'iconLeft' | 'iconRight' | 'action' | 'className' | 'onChange' | 'onEnter'>;

  constructor(options: InputOptions = {}) {
    injectStyles();

    this.options = {
      label:       options.label       ?? '',
      placeholder: options.placeholder ?? '',
      value:       options.value       ?? '',
      type:        options.type        ?? 'text',
      size:        options.size        ?? 'md',
      disabled:    options.disabled    ?? false,
      error:       options.error       ?? '',
      helper:      options.helper      ?? '',
      iconLeft:    options.iconLeft,
      iconRight:   options.iconRight,
      action:      options.action,
      className:   options.className,
      onChange:    options.onChange,
      onEnter:     options.onEnter,
    };

    this.element = this.build();
  }

  private build(): HTMLElement {
    const { label, placeholder, value, type, size, disabled, error, helper,
            iconLeft, iconRight, action, className, onChange, onEnter } = this.options;

    // Outer wrapper
    const wrapper = document.createElement('div');
    const stateClass = error ? 'blob-input--error' : disabled ? 'blob-input--disabled' : '';
    wrapper.className = ['blob-input-wrapper', stateClass, className ?? ''].filter(Boolean).join(' ');

    // Label
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className = 'blob-input-label';
      labelEl.textContent = label;
      wrapper.appendChild(labelEl);
    }

    // Field row
    const row = document.createElement('div');
    row.className = 'blob-input-row';

    // Icon left
    if (iconLeft) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'blob-input-icon';
      iconWrap.appendChild(iconLeft);
      row.appendChild(iconWrap);
    }

    // Input
    const input = document.createElement('input');
    input.className = ['blob-input-field', SIZE_CLASSES[size]].join(' ');
    input.type        = type;
    input.placeholder = placeholder;
    input.value       = value;
    input.disabled    = disabled;
    input.setAttribute('autocomplete', type === 'password' ? 'current-password' : 'off');

    if (onChange) {
      input.addEventListener('input', () => onChange(input.value));
    }
    if (onEnter) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onEnter(input.value);
      });
    }

    this.inputEl = input;
    row.appendChild(input);

    // Icon right
    if (iconRight) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'blob-input-icon';
      iconWrap.appendChild(iconRight);
      row.appendChild(iconWrap);
    }

    // Action slot
    if (action) {
      const actionWrap = document.createElement('span');
      actionWrap.className = 'blob-input-action';
      actionWrap.appendChild(action);
      row.appendChild(actionWrap);
    }

    wrapper.appendChild(row);

    // Helper / error text
    const subtext = error || helper;
    if (subtext) {
      const helperEl = document.createElement('span');
      helperEl.className = 'blob-input-helper';
      helperEl.textContent = subtext;
      wrapper.appendChild(helperEl);
    }

    return wrapper;
  }

  /** Get the current input value. */
  public getValue(): string {
    return this.inputEl.value;
  }

  /** Programmatically set the value. */
  public setValue(value: string): void {
    this.inputEl.value = value;
  }

  /** Focus the input. */
  public focus(): void {
    this.inputEl.focus();
  }

  /** Re-render with updated options. */
  public set(updates: Partial<InputOptions>): void {
    Object.assign(this.options, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setError(error: string): void { this.set({ error }); }
  public clearError(): void            { this.set({ error: '' }); }
  public setDisabled(disabled: boolean): void { this.set({ disabled }); }
}
