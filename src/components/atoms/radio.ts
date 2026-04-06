/**
 * Radio component — blob-radio
 *
 * Single radio button atom. Typically composed into groups (RadioGroup molecule)
 * but usable standalone. Backed by a native `<input type="radio">` for form
 * compatibility and native radio-group keyboard behaviour.
 *
 * CSS class: blob-radio  (the outer wrapper)
 * Modifiers: blob-radio--error  blob-radio--disabled
 *
 * @example
 * ```typescript
 * // Standalone
 * const rb = new Radio({ label: 'Option A', name: 'plan', value: 'a', onChange: console.log });
 *
 * // Group — share the same `name` attribute; browser handles exclusivity
 * const a = new Radio({ label: 'Monthly', name: 'billing', value: 'monthly', checked: true });
 * const b = new Radio({ label: 'Yearly',  name: 'billing', value: 'yearly' });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-radio';
  style.textContent = `
    .blob-radio {
      display:     inline-flex;
      align-items: flex-start;
      gap:         0.5rem;
      cursor:      pointer;
      user-select: none;
      font-family: var(--font-human, sans-serif);
      font-size:   0.875rem;
      color:       var(--color-text-default, rgba(0,0,0,0.8));
      line-height: 1.4;
    }
    .blob-radio--disabled { opacity: 0.4; cursor: not-allowed; }
    .blob-radio--disabled .blob-radio__input { cursor: not-allowed; }

    /* Control wrapper */
    .blob-radio__control {
      position:    relative;
      display:     inline-flex;
      flex-shrink: 0;
      margin-top:  0.1em;
    }

    /* Native input */
    .blob-radio__input {
      position: absolute;
      width:    100%;
      height:   100%;
      opacity:  0;
      margin:   0;
      cursor:   pointer;
      z-index:  1;
    }

    /* Custom circle */
    .blob-radio__circle {
      width:         18px;
      height:        18px;
      border:        2px solid var(--color-border, #d1d5db);
      border-radius: 50%;
      background:    transparent;
      display:       flex;
      align-items:   center;
      justify-content: center;
      transition:    background 0.15s, border-color 0.15s;
      flex-shrink:   0;
    }

    /* Checked */
    .blob-radio__input:checked ~ .blob-radio__circle {
      background:   var(--color-primary, #000);
      border-color: var(--color-primary, #000);
    }

    /* Inner dot */
    .blob-radio__dot {
      width:         7px;
      height:        7px;
      border-radius: 50%;
      background:    var(--color-on-primary, #fff);
      display:       none;
      flex-shrink:   0;
    }
    .blob-radio__input:checked ~ .blob-radio__circle .blob-radio__dot {
      display: block;
    }

    /* Focus */
    .blob-radio__input:focus-visible ~ .blob-radio__circle {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 2px;
    }

    /* Error */
    .blob-radio--error .blob-radio__circle {
      border-color: #dc2626;
    }

    /* Helper text */
    .blob-radio__helper {
      display:    block;
      margin-top: 0.25rem;
      font-size:  0.75rem;
      color:      var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-radio--error .blob-radio__helper { color: #dc2626; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RadioOptions {
  label?:    string;
  name:      string;
  value:     string;
  checked?:  boolean;
  disabled?: boolean;
  helper?:   string;
  error?:    string;
  onChange?: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Radio {
  public element:   HTMLElement;
  /** The native `<input type="radio">`. */
  public inputEl!:  HTMLInputElement;
  private _opts:    RadioOptions;

  constructor(options: RadioOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { label, name, value, checked = false, disabled = false, helper, error } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = [
      'blob-radio',
      error    ? 'blob-radio--error'    : '',
      disabled ? 'blob-radio--disabled' : '',
    ].filter(Boolean).join(' ');

    const labelEl = document.createElement('label');
    labelEl.style.display    = 'inline-flex';
    labelEl.style.alignItems = 'flex-start';
    labelEl.style.gap        = '0.5rem';
    labelEl.style.cursor     = disabled ? 'not-allowed' : 'pointer';

    // Control
    const control = document.createElement('span');
    control.className = 'blob-radio__control';

    const input = document.createElement('input');
    input.type     = 'radio';
    input.className = 'blob-radio__input';
    input.name     = name;
    input.value    = value;
    input.checked  = checked;
    input.disabled = disabled;
    this.inputEl   = input;

    input.addEventListener('change', () => {
      if (input.checked) this._opts.onChange?.(value);
    });

    // Custom circle
    const circle = document.createElement('span');
    circle.className = 'blob-radio__circle';
    circle.setAttribute('aria-hidden', 'true');

    const dot = document.createElement('span');
    dot.className = 'blob-radio__dot';
    circle.appendChild(dot);

    control.appendChild(input);
    control.appendChild(circle);
    labelEl.appendChild(control);

    if (label) {
      const text = document.createElement('span');
      text.textContent = label;
      labelEl.appendChild(text);
    }

    wrapper.appendChild(labelEl);

    const helpText = error || helper;
    if (helpText) {
      const helperEl = document.createElement('span');
      helperEl.className   = 'blob-radio__helper';
      helperEl.textContent = helpText;
      wrapper.appendChild(helperEl);
    }

    return wrapper;
  }

  public get checked(): boolean  { return this.inputEl?.checked ?? false; }
  public get value():   string   { return this._opts.value; }

  public setChecked(checked: boolean): void {
    this.inputEl.checked = checked;
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled       = disabled;
    this.inputEl.disabled     = disabled;
    this.element.classList.toggle('blob-radio--disabled', disabled);
  }
}
