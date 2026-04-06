/**
 * Select component — blob-select
 *
 * Styled wrapper around a native `<select>` element. Fully keyboard-accessible,
 * inherits all token CSS vars (colors, radius, font). Passes through all native
 * select semantics so screen readers and HTML forms work correctly.
 *
 * Use this instead of Dropdown when you need a real form field. Use Dropdown
 * when you need a command menu or non-form interaction.
 *
 * CSS class: blob-select-wrap
 *
 * @example
 * ```typescript
 * const sel = new Select({
 *   label:       'Country',
 *   placeholder: 'Choose a country…',
 *   options: [
 *     { value: 'us', label: 'United States' },
 *     { value: 'gb', label: 'United Kingdom' },
 *     { group: 'Other', items: [{ value: 'ca', label: 'Canada' }] },
 *   ],
 *   onChange: (value) => console.log(value),
 * });
 *
 * form.appendChild(sel.element);
 *
 * // Programmatic value
 * sel.setValue('gb');
 * console.log(sel.value); // 'gb'
 *
 * // Error state
 * sel.setError('Please select a country.');
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-select';
  style.textContent = `
    .blob-select-wrap {
      display:        flex;
      flex-direction: column;
      gap:            0.3rem;
      font-family:    var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    /* Label */
    .blob-select-wrap__label {
      font-size:   0.8125rem;
      font-weight: 500;
      color:       var(--color-text-default, rgba(0,0,0,0.8));
      line-height: 1.3;
    }
    .blob-select-wrap__label--required::after {
      content: ' *';
      color:   #dc2626;
    }

    /* Input row (select + chevron) */
    .blob-select-wrap__control {
      position:         relative;
      display:          flex;
      align-items:      center;
    }

    /* The <select> element */
    .blob-select {
      width:            100%;
      appearance:       none;
      -webkit-appearance: none;
      padding:          0.5rem 2.25rem 0.5rem 0.75rem;
      background:       var(--color-background, #fff);
      border:           1px solid var(--color-border, #d1d5db);
      border-radius:    var(--radius-m, 6px);
      font-family:      var(--font-human, sans-serif);
      font-size:        0.875rem;
      color:            var(--color-text-default, rgba(0,0,0,0.8));
      line-height:      1.5;
      cursor:           pointer;
      transition:       border-color 0.1s ease, box-shadow 0.1s ease;
      outline:          none;
    }
    .blob-select:focus {
      border-color: var(--color-primary, #000);
      box-shadow:   0 0 0 3px color-mix(in srgb, var(--color-primary, #000) 15%, transparent);
    }
    .blob-select:disabled {
      opacity:          0.45;
      cursor:           not-allowed;
      background:       var(--color-surface, rgba(0,0,0,0.03));
    }
    .blob-select--error {
      border-color: #dc2626;
    }
    .blob-select--error:focus {
      border-color: #dc2626;
      box-shadow:   0 0 0 3px rgba(220,38,38,0.15);
    }
    /* Placeholder option */
    .blob-select option[value=""] {
      color: var(--color-text-subtle, rgba(0,0,0,0.45));
    }

    /* Chevron */
    .blob-select-wrap__chevron {
      position:       absolute;
      right:          0.625rem;
      display:        flex;
      align-items:    center;
      pointer-events: none;
      color:          var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-select-wrap__chevron svg { width: 14px; height: 14px; }

    /* Sizes */
    .blob-select--sm { padding: 0.3125rem 2rem 0.3125rem 0.625rem; font-size: 0.8125rem; }
    .blob-select--lg { padding: 0.6875rem 2.5rem 0.6875rem 0.875rem; font-size: 0.9375rem; }

    /* Helper / error text */
    .blob-select-wrap__helper {
      font-size: 0.75rem;
      color:     var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-select-wrap__error {
      font-size: 0.75rem;
      color:     #dc2626;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOptionItem {
  value:    string;
  label:    string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  group: string;
  items: SelectOptionItem[];
}

export type SelectOptionDef = SelectOptionItem | SelectOptionGroup;

export interface SelectOptions {
  options:      SelectOptionDef[];
  label?:       string;
  placeholder?: string;
  value?:       string;
  name?:        string;
  id?:          string;
  required?:    boolean;
  disabled?:    boolean;
  size?:        SelectSize;
  helper?:      string;
  error?:       string;
  onChange?:    (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Select {
  public element:   HTMLElement;
  public selectEl!: HTMLSelectElement;
  private _opts:    SelectOptions;
  private _error:   string | null = null;

  constructor(options: SelectOptions) {
    injectStyles();
    this._opts   = options;
    this._error  = options.error ?? null;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      options, label, placeholder, value, name, id,
      required = false, disabled = false,
      size = 'md', helper, onChange,
    } = this._opts;

    const uid = id ?? `blob-select-${Math.random().toString(36).slice(2, 8)}`;

    const wrap = document.createElement('div');
    wrap.className = 'blob-select-wrap';

    // Label
    if (label) {
      const lbl = document.createElement('label');
      lbl.className = ['blob-select-wrap__label', required ? 'blob-select-wrap__label--required' : ''].filter(Boolean).join(' ');
      lbl.htmlFor   = uid;
      lbl.textContent = label;
      wrap.appendChild(lbl);
    }

    // Control row
    const control = document.createElement('div');
    control.className = 'blob-select-wrap__control';

    // <select>
    const sel = document.createElement('select');
    sel.id        = uid;
    sel.className = [
      'blob-select',
      size !== 'md' ? `blob-select--${size}` : '',
      this._error ? 'blob-select--error' : '',
    ].filter(Boolean).join(' ');
    if (name)     sel.name     = name;
    if (required) sel.required = true;
    if (disabled) sel.disabled = true;
    if (this._error) sel.setAttribute('aria-invalid', 'true');
    this.selectEl = sel;

    // Placeholder option
    if (placeholder) {
      const ph = document.createElement('option');
      ph.value       = '';
      ph.textContent = placeholder;
      ph.disabled    = true;
      ph.selected    = !value;
      sel.appendChild(ph);
    }

    // Options / groups
    for (const opt of options) {
      if ('group' in opt) {
        const grp = document.createElement('optgroup');
        grp.label = opt.group;
        for (const item of opt.items) {
          const o = document.createElement('option');
          o.value        = item.value;
          o.textContent  = item.label;
          if (item.disabled) o.disabled = true;
          if (value === item.value) o.selected = true;
          grp.appendChild(o);
        }
        sel.appendChild(grp);
      } else {
        const o = document.createElement('option');
        o.value        = opt.value;
        o.textContent  = opt.label;
        if (opt.disabled) o.disabled = true;
        if (value === opt.value) o.selected = true;
        sel.appendChild(o);
      }
    }

    sel.addEventListener('change', () => onChange?.(sel.value));
    control.appendChild(sel);

    // Chevron
    const chevron = document.createElement('span');
    chevron.className = 'blob-select-wrap__chevron';
    chevron.innerHTML = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5l4 4 4-4"/></svg>';
    control.appendChild(chevron);

    wrap.appendChild(control);

    // Helper / error text
    if (this._error) {
      const errEl = document.createElement('div');
      errEl.className   = 'blob-select-wrap__error';
      errEl.textContent = this._error;
      errEl.setAttribute('role', 'alert');
      wrap.appendChild(errEl);
    } else if (helper) {
      const helpEl = document.createElement('div');
      helpEl.className   = 'blob-select-wrap__helper';
      helpEl.textContent = helper;
      wrap.appendChild(helpEl);
    }

    return wrap;
  }

  public get value(): string { return this.selectEl.value; }

  public setValue(val: string): void {
    this.selectEl.value = val;
  }

  public setError(error: string | null): void {
    this._error = error;
    const next  = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled = disabled;
    this.selectEl.disabled = disabled;
  }
}
