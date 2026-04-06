/**
 * Button Component
 *
 * A flexible button primitive that reads colors and radii from BHMUI CSS tokens
 * written by `applyTheme()`. No Tailwind dependency — all styling via inline CSS vars.
 *
 * @example
 * ```typescript
 * const btn = new button({ text: 'Save', variant: 'primary', onClick: () => save() });
 * document.body.appendChild(btn.element);
 * ```
 */

import type { widgetmeta } from './widget-meta';

export type buttonvariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type buttonsize = 'sm' | 'md' | 'lg';

export interface buttonoptions {
  text: string;
  variant?: buttonvariant;
  size?: buttonsize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const SIZE_STYLES: Record<buttonsize, string> = {
  sm: 'padding: 6px 12px; font-size: 0.875rem;',
  md: 'padding: 8px 16px; font-size: 1rem;',
  lg: 'padding: 12px 24px; font-size: 1.125rem;',
};

export class button {
  static meta: widgetmeta = {
    name: 'button',
    description: 'Interactive button with primary, secondary, outline, and ghost variants',
    category: 'input',
    defaultOptions: { text: 'Button', variant: 'primary', size: 'md' },
  };

  private el: HTMLButtonElement;
  private opts: Required<buttonoptions>;

  constructor(options: buttonoptions) {
    this.opts = {
      variant: 'primary',
      size: 'md',
      iconPosition: 'left',
      fullWidth: false,
      type: 'button',
      disabled: false,
      icon: '',
      onClick: () => {},
      ...options,
    };

    this.el = this.build();
    if (this.opts.onClick) {
      this.el.addEventListener('click', this.opts.onClick);
    }
  }

  private build(): HTMLButtonElement {
    const el = document.createElement('button');
    el.type = this.opts.type;
    el.disabled = this.opts.disabled;
    el.setAttribute('aria-disabled', String(this.opts.disabled));

    this.applyStyles(el);
    this.renderContent(el);
    this.attachHover(el);

    return el;
  }

  private applyStyles(el: HTMLButtonElement): void {
    const { variant, size, fullWidth, disabled } = this.opts;

    const base = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--font-human, sans-serif);
      font-weight: 500;
      border-radius: var(--radius-m, 6px);
      border: 1px solid transparent;
      cursor: ${disabled ? 'not-allowed' : 'pointer'};
      opacity: ${disabled ? '0.5' : '1'};
      transition: opacity 0.15s, background-color 0.15s, color 0.15s, border-color 0.15s;
      white-space: nowrap;
      width: ${fullWidth ? '100%' : 'auto'};
      ${SIZE_STYLES[size]}
    `;

    const variantStyle: Record<buttonvariant, string> = {
      primary: `
        background-color: var(--color-primary, #000);
        color: var(--color-text-on-primary, #fff);
        border-color: var(--color-primary, #000);
      `,
      secondary: `
        background-color: var(--color-surface-elevated, #f9fafb);
        color: var(--color-text-primary, #111);
        border-color: var(--color-border-default, #e5e7eb);
      `,
      outline: `
        background-color: transparent;
        color: var(--color-text-primary, #111);
        border-color: var(--color-border-default, #e5e7eb);
      `,
      ghost: `
        background-color: transparent;
        color: var(--color-text-primary, #111);
        border-color: transparent;
      `,
    };

    el.style.cssText = base + variantStyle[variant];
  }

  private attachHover(el: HTMLButtonElement): void {
    if (this.opts.disabled) return;
    el.addEventListener('mouseenter', () => {
      el.style.opacity = '0.85';
    });
    el.addEventListener('mouseleave', () => {
      el.style.opacity = '1';
    });
  }

  private renderContent(el: HTMLButtonElement): void {
    el.innerHTML = '';

    if (this.opts.icon && this.opts.iconPosition === 'left') {
      const icon = document.createElement('span');
      icon.style.cssText = 'display:flex;flex-shrink:0;width:1em;height:1em;';
      icon.innerHTML = this.opts.icon;
      el.appendChild(icon);
    }

    const text = document.createElement('span');
    text.textContent = this.opts.text;
    el.appendChild(text);

    if (this.opts.icon && this.opts.iconPosition === 'right') {
      const icon = document.createElement('span');
      icon.style.cssText = 'display:flex;flex-shrink:0;width:1em;height:1em;';
      icon.innerHTML = this.opts.icon;
      el.appendChild(icon);
    }
  }

  /** Update button label */
  setText(text: string): void {
    this.opts.text = text;
    this.renderContent(this.el);
  }

  /** Enable or disable the button */
  setDisabled(disabled: boolean): void {
    this.opts.disabled = disabled;
    this.el.disabled = disabled;
    this.el.setAttribute('aria-disabled', String(disabled));
    this.applyStyles(this.el);
  }

  /** The button DOM element */
  get element(): HTMLButtonElement {
    return this.el;
  }

  /** @deprecated Use `.element` */
  getElement(): HTMLButtonElement {
    return this.el;
  }

  destroy(): void {
    this.el.remove();
  }
}
