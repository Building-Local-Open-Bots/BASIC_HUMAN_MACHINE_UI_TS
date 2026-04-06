/**
 * Textarea component — blob-textarea
 *
 * Multi-line plain text field with label, helper, error, and optional resize
 * control. This is the raw atom (fixed height). For the auto-growing chat
 * variant see ChatInput.
 *
 * CSS class: blob-textarea-wrapper  (outer)
 *            blob-textarea-label    (label)
 *            blob-textarea-field    (the <textarea>)
 *            blob-textarea-helper   (helper / error text)
 * Modifiers: blob-textarea--error  blob-textarea--disabled
 *
 * @example
 * ```typescript
 * const notes = new Textarea({ label: 'Notes', rows: 4, placeholder: 'Add a note…' });
 * const bio   = new Textarea({ label: 'Bio', maxLength: 280, showCount: true });
 *
 * notes.setValue('Hello');
 * notes.setError('Too long');
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-textarea';
  style.textContent = `
    .blob-textarea-wrapper {
      display:        flex;
      flex-direction: column;
      gap:            0.3rem;
      width:          100%;
    }

    /* Label */
    .blob-textarea-label {
      font-family:   var(--font-human, sans-serif);
      font-size:     0.8125rem;
      font-weight:   500;
      color:         var(--color-text-default, rgba(0,0,0,0.8));
      display:       flex;
      align-items:   center;
      gap:           0.25rem;
    }
    .blob-textarea--error .blob-textarea-label { color: #dc2626; }

    /* Field */
    .blob-textarea-field {
      width:         100%;
      box-sizing:    border-box;
      padding:       0.625rem 0.75rem;
      font-family:   var(--font-human, sans-serif);
      font-size:     0.875rem;
      line-height:   1.5;
      color:         var(--color-text-primary, #000);
      background:    var(--color-background, #fff);
      border:        1px solid var(--color-border, #d1d5db);
      border-radius: var(--radius-m, 6px);
      outline:       none;
      resize:        vertical;
      transition:    border-color 0.15s ease;
      -webkit-font-smoothing: antialiased;
    }
    .blob-textarea-field::placeholder {
      color: var(--color-text-subtle, rgba(0,0,0,0.35));
    }
    .blob-textarea-field:focus {
      border-color: var(--color-primary, #000);
      box-shadow:   0 0 0 3px color-mix(in srgb, var(--color-primary, #000) 15%, transparent);
    }
    .blob-textarea-field:disabled {
      opacity: 0.5;
      cursor:  not-allowed;
      resize:  none;
    }

    /* Error border */
    .blob-textarea--error .blob-textarea-field {
      border-color: #dc2626;
    }
    .blob-textarea--error .blob-textarea-field:focus {
      box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
    }

    /* No-resize variant */
    .blob-textarea--no-resize .blob-textarea-field { resize: none; }

    /* Helper / error text row + optional char count */
    .blob-textarea-footer {
      display:         flex;
      justify-content: space-between;
      align-items:     center;
      gap:             0.5rem;
    }
    .blob-textarea-helper {
      font-family: var(--font-human, sans-serif);
      font-size:   0.75rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-textarea--error .blob-textarea-helper { color: #dc2626; }
    .blob-textarea-count {
      font-family:  var(--font-human, sans-serif);
      font-size:    0.75rem;
      color:        var(--color-text-subtle, rgba(0,0,0,0.45));
      white-space:  nowrap;
      margin-left:  auto;
    }
    .blob-textarea-count--over { color: #dc2626; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TextareaOptions {
  label?:       string;
  placeholder?: string;
  value?:       string;
  rows?:        number;
  maxLength?:   number;
  /** Show a live character count when maxLength is set. */
  showCount?:   boolean;
  resize?:      boolean;
  disabled?:    boolean;
  required?:    boolean;
  name?:        string;
  helper?:      string;
  error?:       string;
  onChange?:    (value: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Textarea {
  public element:       HTMLElement;
  /** The native `<textarea>` element. */
  public textareaEl!:   HTMLTextAreaElement;
  private _countEl:     HTMLElement | null = null;
  private _opts:        TextareaOptions;
  private _hasError:    boolean = false;

  constructor(options: TextareaOptions = {}) {
    injectStyles();
    this._opts    = options;
    this._hasError = !!options.error;
    this.element  = this.build();
  }

  private build(): HTMLElement {
    const {
      label, placeholder, value = '', rows = 4,
      maxLength, showCount, resize = true, disabled = false,
      required = false, name, helper, error,
    } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = [
      'blob-textarea-wrapper',
      error            ? 'blob-textarea--error'     : '',
      !resize          ? 'blob-textarea--no-resize'  : '',
    ].filter(Boolean).join(' ');

    // Label
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.className   = 'blob-textarea-label';
      labelEl.textContent = label;
      if (required) {
        const req = document.createElement('span');
        req.textContent = '*';
        req.style.color = '#dc2626';
        req.setAttribute('aria-hidden', 'true');
        labelEl.appendChild(req);
      }
      wrapper.appendChild(labelEl);
    }

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.className   = 'blob-textarea-field';
    textarea.rows        = rows;
    textarea.value       = value;
    textarea.disabled    = disabled;
    textarea.required    = required;
    if (placeholder) textarea.placeholder = placeholder;
    if (maxLength)   textarea.maxLength   = maxLength;
    if (name)        textarea.name        = name;
    this.textareaEl = textarea;

    textarea.addEventListener('input', () => {
      if (this._countEl && maxLength) {
        const len = textarea.value.length;
        this._countEl.textContent = `${len} / ${maxLength}`;
        this._countEl.classList.toggle('blob-textarea-count--over', len > maxLength);
      }
      this._opts.onChange?.(textarea.value);
    });

    wrapper.appendChild(textarea);

    // Footer (helper + count)
    const helpText = error || helper;
    if (helpText || (showCount && maxLength)) {
      const footer = document.createElement('div');
      footer.className = 'blob-textarea-footer';

      if (helpText) {
        const helperEl = document.createElement('span');
        helperEl.className   = 'blob-textarea-helper';
        helperEl.textContent = helpText;
        footer.appendChild(helperEl);
      }

      if (showCount && maxLength) {
        const countEl = document.createElement('span');
        countEl.className   = 'blob-textarea-count';
        countEl.textContent = `${value.length} / ${maxLength}`;
        this._countEl       = countEl;
        footer.appendChild(countEl);
      }

      wrapper.appendChild(footer);
    }

    return wrapper;
  }

  public getValue(): string          { return this.textareaEl?.value ?? ''; }
  public setValue(value: string): void {
    this.textareaEl.value = value;
    if (this._countEl && this._opts.maxLength) {
      this._countEl.textContent = `${value.length} / ${this._opts.maxLength}`;
    }
  }
  public focus(): void { this.textareaEl?.focus(); }

  public setError(msg: string): void {
    this._opts.error = msg;
    this._hasError   = true;
    this.element.classList.add('blob-textarea--error');
    const helperEl = this.element.querySelector('.blob-textarea-helper');
    if (helperEl) helperEl.textContent = msg;
    else {
      let footer = this.element.querySelector('.blob-textarea-footer') as HTMLElement | null;
      if (!footer) {
        footer = document.createElement('div');
        footer.className = 'blob-textarea-footer';
        this.element.appendChild(footer);
      }
      const helperNew = document.createElement('span');
      helperNew.className   = 'blob-textarea-helper';
      helperNew.textContent = msg;
      footer.prepend(helperNew);
    }
  }

  public clearError(): void {
    this._opts.error = undefined;
    this._hasError   = false;
    this.element.classList.remove('blob-textarea--error');
    this.element.querySelector('.blob-textarea-helper')?.remove();
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled         = disabled;
    this.textareaEl.disabled    = disabled;
  }
}
