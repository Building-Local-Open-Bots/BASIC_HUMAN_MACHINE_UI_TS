/**
 * Input Component
 *
 * A text input with optional label, icon, and error state.
 * All visual styling uses BHMUI CSS tokens written by `applyTheme()`.
 *
 * @example
 * ```typescript
 * const field = new input({
 *   label: 'Email',
 *   type: 'email',
 *   placeholder: 'you@example.com',
 *   onChange: value => console.log(value),
 * });
 * document.body.appendChild(field.element);
 * ```
 */

import type { widgetmeta } from './widget-meta';

export interface inputoptions {
  type?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onChange?: (value: string) => void;
  onInput?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export class input {
  static meta: widgetmeta = {
    name: 'input',
    description: 'Single-line text input with label, icon, and error state support',
    category: 'input',
    defaultOptions: { type: 'text', label: 'Label', placeholder: 'Enter value…' },
  };

  private container: HTMLDivElement;
  private inputEl: HTMLInputElement;
  private opts: Required<inputoptions>;

  constructor(options: inputoptions) {
    this.opts = {
      type: 'text',
      label: '',
      placeholder: '',
      value: '',
      error: '',
      icon: '',
      iconPosition: 'left',
      onChange: () => {},
      onInput: () => {},
      disabled: false,
      required: false,
      ...options,
    };

    this.container = document.createElement('div');
    this.container.style.cssText = 'display:flex;flex-direction:column;gap:4px;width:100%;';

    this.inputEl = document.createElement('input');
    this.inputEl.type = this.opts.type;
    this.inputEl.placeholder = this.opts.placeholder;
    this.inputEl.value = this.opts.value;
    this.inputEl.disabled = this.opts.disabled;
    this.inputEl.required = this.opts.required;

    this.render();
    this.attachListeners();
  }

  private render(): void {
    this.container.innerHTML = '';

    // Label
    if (this.opts.label) {
      const label = document.createElement('label');
      label.textContent = this.opts.label;
      label.style.cssText = `
        font-family: var(--font-human, sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-default, #374151);
      `;
      this.container.appendChild(label);
    }

    // Wrapper (handles icon positioning)
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:flex;align-items:center;';

    if (this.opts.icon && this.opts.iconPosition === 'left') {
      wrapper.appendChild(this.buildIcon('left'));
    }

    this.applyInputStyles();
    wrapper.appendChild(this.inputEl);

    if (this.opts.icon && this.opts.iconPosition === 'right') {
      wrapper.appendChild(this.buildIcon('right'));
    }

    this.container.appendChild(wrapper);

    // Error message
    if (this.opts.error) {
      const err = document.createElement('p');
      err.textContent = this.opts.error;
      err.style.cssText = `
        font-family: var(--font-human, sans-serif);
        font-size: 0.75rem;
        color: #ef4444;
        margin: 0;
      `;
      this.container.appendChild(err);
    }
  }

  private buildIcon(side: 'left' | 'right'): HTMLElement {
    const icon = document.createElement('span');
    icon.innerHTML = this.opts.icon;
    icon.style.cssText = `
      position:absolute;
      ${side}:10px;
      display:flex;
      align-items:center;
      color:var(--color-text-subtle,#9ca3af);
      pointer-events:none;
      width:1rem;height:1rem;
    `;
    return icon;
  }

  private applyInputStyles(): void {
    const hasIcon = !!this.opts.icon;
    const leftPad = hasIcon && this.opts.iconPosition === 'left' ? '36px' : '12px';
    const rightPad = hasIcon && this.opts.iconPosition === 'right' ? '36px' : '12px';
    const borderColor = this.opts.error ? '#ef4444' : 'var(--color-border-default, #e5e7eb)';

    this.inputEl.style.cssText = `
      width: 100%;
      box-sizing: border-box;
      padding: 8px ${rightPad} 8px ${leftPad};
      font-family: var(--font-human, sans-serif);
      font-size: 1rem;
      color: var(--color-text-primary, #111);
      background-color: var(--color-surface-default, #fff);
      border: 1px solid ${borderColor};
      border-radius: var(--radius-m, 6px);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      opacity: ${this.opts.disabled ? '0.5' : '1'};
      cursor: ${this.opts.disabled ? 'not-allowed' : 'text'};
    `;

    this.inputEl.addEventListener('focus', () => {
      this.inputEl.style.borderColor = 'var(--color-primary, #000)';
      this.inputEl.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
    });
    this.inputEl.addEventListener('blur', () => {
      this.inputEl.style.borderColor = this.opts.error
        ? '#ef4444'
        : 'var(--color-border-default, #e5e7eb)';
      this.inputEl.style.boxShadow = 'none';
    });
  }

  private attachListeners(): void {
    this.inputEl.addEventListener('change', e => {
      this.opts.onChange((e.target as HTMLInputElement).value);
    });
    this.inputEl.addEventListener('input', e => {
      this.opts.onInput((e.target as HTMLInputElement).value);
    });
  }

  getValue(): string {
    return this.inputEl.value;
  }

  setValue(value: string): void {
    this.inputEl.value = value;
  }

  setError(error: string | undefined): void {
    this.opts.error = error ?? '';
    this.render();
    this.attachListeners();
  }

  setDisabled(disabled: boolean): void {
    this.opts.disabled = disabled;
    this.inputEl.disabled = disabled;
    this.applyInputStyles();
  }

  get element(): HTMLDivElement {
    return this.container;
  }

  /** @deprecated Use `.element` */
  getElement(): HTMLDivElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
  }
}
