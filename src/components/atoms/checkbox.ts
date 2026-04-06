/**
 * Checkbox component — blob-checkbox
 *
 * Custom-styled checkbox backed by a native hidden `<input type="checkbox">`.
 * The native input stays in the DOM for form-submission compatibility.
 * Supports indeterminate state (e.g. "select all" when some children are checked).
 *
 * CSS class: blob-checkbox  (the outer <label>)
 * Modifiers: blob-checkbox--error  blob-checkbox--disabled
 *
 * @example
 * ```typescript
 * const cb = new Checkbox({ label: 'Remember me', onChange: (v) => save(v) });
 * const all = new Checkbox({ label: 'Select all', indeterminate: true });
 *
 * cb.setChecked(true);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-checkbox';
  style.textContent = `
    /* Outer label ---------------------------------------------------------- */
    .blob-checkbox {
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
    .blob-checkbox--disabled { opacity: 0.4; cursor: not-allowed; }
    .blob-checkbox--disabled .blob-checkbox__input { cursor: not-allowed; }

    /* Control wrapper (box + hidden native input) -------------------------- */
    .blob-checkbox__control {
      position: relative;
      display:  inline-flex;
      flex-shrink: 0;
      margin-top: 0.1em; /* optically align with first line of text */
    }

    /* Native input — invisible but still interactive ---------------------- */
    .blob-checkbox__input {
      position: absolute;
      width:    100%;
      height:   100%;
      opacity:  0;
      margin:   0;
      cursor:   pointer;
      z-index:  1;
    }

    /* Custom box ----------------------------------------------------------- */
    .blob-checkbox__box {
      width:         18px;
      height:        18px;
      border:        2px solid var(--color-border, #d1d5db);
      border-radius: var(--radius-s, 3px);
      background:    switch var(--color-background, transparent);
      background:    transparent;
      display:       flex;
      align-items:   center;
      justify-content: center;
      transition:    background 0.15s, border-color 0.15s;
      flex-shrink:   0;
    }

    /* Checked */
    .blob-checkbox__input:checked ~ .blob-checkbox__box {
      background:   var(--color-primary, #000);
      border-color: var(--color-primary, #000);
    }
    /* Indeterminate */
    .blob-checkbox__input:indeterminate ~ .blob-checkbox__box {
      background:   var(--color-primary, #000);
      border-color: var(--color-primary, #000);
    }

    /* Check icon (hidden by default, visible when checked) */
    .blob-checkbox__check {
      display:  none;
      width:    10px;
      height:   10px;
      color:    var(--color-on-primary, #fff);
      flex-shrink: 0;
    }
    .blob-checkbox__input:checked ~ .blob-checkbox__box .blob-checkbox__check {
      display: block;
    }

    /* Dash icon (indeterminate) */
    .blob-checkbox__dash {
      display:       none;
      width:         10px;
      height:        2px;
      background:    var(--color-on-primary, #fff);
      border-radius: 1px;
      flex-shrink:   0;
    }
    .blob-checkbox__input:indeterminate ~ .blob-checkbox__box .blob-checkbox__check {
      display: none !important;
    }
    .blob-checkbox__input:indeterminate ~ .blob-checkbox__box .blob-checkbox__dash {
      display: block;
    }

    /* Focus ring on the visual box */
    .blob-checkbox__input:focus-visible ~ .blob-checkbox__box {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 2px;
    }

    /* Error state */
    .blob-checkbox--error .blob-checkbox__box {
      border-color: #dc2626;
    }

    /* Helper / error text */
    .blob-checkbox__helper {
      display:     block;
      margin-top:  0.25rem;
      font-size:   0.75rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-checkbox--error .blob-checkbox__helper {
      color: #dc2626;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CheckboxOptions {
  label?:         string;
  checked?:       boolean;
  indeterminate?: boolean;
  disabled?:      boolean;
  /** Optional name attribute for form submission. */
  name?:          string;
  value?:         string;
  helper?:        string;
  error?:         string;
  onChange?:      (checked: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Checkbox {
  public element:    HTMLElement;
  /** The native `<input type="checkbox">` for direct form access. */
  public inputEl!:   HTMLInputElement;
  private _checked:  boolean;
  private _opts:     CheckboxOptions;

  constructor(options: CheckboxOptions = {}) {
    injectStyles();
    this._checked = options.checked ?? false;
    this._opts    = options;
    this.element  = this.build();
  }

  private build(): HTMLElement {
    const {
      label, indeterminate = false, disabled = false,
      name, value, helper, error,
    } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = [
      'blob-checkbox',
      error    ? 'blob-checkbox--error'    : '',
      disabled ? 'blob-checkbox--disabled' : '',
    ].filter(Boolean).join(' ');

    const labelEl = document.createElement('label');
    labelEl.style.display    = 'inline-flex';
    labelEl.style.alignItems = 'flex-start';
    labelEl.style.gap        = '0.5rem';
    labelEl.style.cursor     = disabled ? 'not-allowed' : 'pointer';

    // Control
    const control = document.createElement('span');
    control.className = 'blob-checkbox__control';

    const input = document.createElement('input');
    input.type           = 'checkbox';
    input.className      = 'blob-checkbox__input';
    input.checked        = this._checked;
    input.indeterminate  = indeterminate;
    input.disabled       = disabled;
    if (name)  input.name  = name;
    if (value) input.value = value;
    this.inputEl = input;

    input.addEventListener('change', () => {
      this._checked = input.checked;
      this._opts.onChange?.(this._checked);
    });

    // Custom box
    const box = document.createElement('span');
    box.className = 'blob-checkbox__box';
    box.setAttribute('aria-hidden', 'true');

    // Checkmark SVG
    const check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    check.setAttribute('class', 'blob-checkbox__check');
    check.setAttribute('viewBox', '0 0 10 10');
    check.setAttribute('fill', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M1.5 5.5L4 8L8.5 2');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.75');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    check.appendChild(path);
    box.appendChild(check);

    // Dash (indeterminate)
    const dash = document.createElement('span');
    dash.className = 'blob-checkbox__dash';
    dash.setAttribute('aria-hidden', 'true');
    box.appendChild(dash);

    control.appendChild(input);
    control.appendChild(box);
    labelEl.appendChild(control);

    if (label) {
      const text = document.createElement('span');
      text.textContent = label;
      labelEl.appendChild(text);
    }

    wrapper.appendChild(labelEl);

    // Helper / error text
    const helpText = error || helper;
    if (helpText) {
      const helperEl = document.createElement('span');
      helperEl.className   = 'blob-checkbox__helper';
      helperEl.textContent = helpText;
      wrapper.appendChild(helperEl);
    }

    return wrapper;
  }

  public get checked(): boolean  { return this._checked; }
  public get value():   string   { return this.inputEl?.value ?? ''; }

  public setChecked(checked: boolean): void {
    this._checked        = checked;
    this.inputEl.checked = checked;
  }

  public setIndeterminate(value: boolean): void {
    this.inputEl.indeterminate = value;
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled       = disabled;
    this.inputEl.disabled     = disabled;
    this.element.classList.toggle('blob-checkbox--disabled', disabled);
  }

  public setError(msg: string): void {
    this._opts.error = msg;
    // Rebuild the helper text only — not full re-render
    const existing = this.element.querySelector('.blob-checkbox__helper');
    if (existing) existing.textContent = msg;
    else {
      const helperEl = document.createElement('span');
      helperEl.className   = 'blob-checkbox__helper';
      helperEl.textContent = msg;
      this.element.appendChild(helperEl);
    }
    this.element.classList.add('blob-checkbox--error');
  }

  public clearError(): void {
    this._opts.error = undefined;
    this.element.classList.remove('blob-checkbox--error');
    this.element.querySelector('.blob-checkbox__helper')?.remove();
  }
}
