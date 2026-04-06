/**
 * Modal Component
 *
 * A dialog overlay with title, content slot, backdrop blur, and escape-key support.
 * All visual styling uses BHMUI CSS tokens written by `applyTheme()`.
 *
 * @example
 * ```typescript
 * const m = new modal({ title: 'Confirm', content: 'Are you sure?' });
 * document.body.appendChild(m.element);
 * m.open();
 * ```
 */

import type { widgetmeta } from './widget-meta';

export type modalwidth = 'sm' | 'md' | 'lg' | 'xl';

export interface modaloptions {
  title?: string;
  content: HTMLElement | string;
  maxWidth?: modalwidth;
  onClose?: () => void;
}

const MAX_WIDTH: Record<modalwidth, string> = {
  sm: '384px',
  md: '480px',
  lg: '640px',
  xl: '768px',
};

export class modal {
  static meta: widgetmeta = {
    name: 'modal',
    description: 'Dialog overlay with title, content slot, backdrop, and keyboard support',
    category: 'overlay',
    defaultOptions: { title: 'Dialog', maxWidth: 'md' },
  };

  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private opts: Required<modaloptions>;
  private _isOpen = false;
  private escHandler: (e: KeyboardEvent) => void;

  constructor(options: modaloptions) {
    this.opts = {
      title: '',
      maxWidth: 'md',
      onClose: () => {},
      ...options,
    };

    this.overlay = this.buildOverlay();
    this.panel = this.buildPanel();
    this.overlay.appendChild(this.panel);

    this.escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this._isOpen) this.close();
    };
  }

  private buildOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    `;

    // Clicking the backdrop closes the modal
    overlay.addEventListener('click', e => {
      if (e.target === overlay) this.close();
    });

    return overlay;
  }

  private buildPanel(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: relative;
      width: 100%;
      max-width: ${MAX_WIDTH[this.opts.maxWidth]};
      background-color: var(--color-surface-elevated, #fff);
      border: 1px solid var(--color-border-default, #e5e7eb);
      border-radius: var(--radius-l, 10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      overflow: hidden;
    `;

    if (this.opts.title) {
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 16px 24px;
        border-bottom: 1px solid var(--color-border-default, #e5e7eb);
        display: flex;
        align-items: center;
        justify-content: space-between;
      `;

      const title = document.createElement('h2');
      title.textContent = this.opts.title;
      title.style.cssText = `
        margin: 0;
        font-family: var(--font-display, sans-serif);
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text-primary, #111);
      `;

      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('aria-label', 'Close dialog');
      closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
      closeBtn.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-subtle, #9ca3af);
        padding: 4px;
        border-radius: var(--radius-s, 4px);
        transition: color 0.15s, background-color 0.15s;
      `;
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = 'var(--color-text-primary, #111)';
        closeBtn.style.backgroundColor = 'var(--color-surface-hover, rgba(0,0,0,0.05))';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = 'var(--color-text-subtle, #9ca3af)';
        closeBtn.style.backgroundColor = 'transparent';
      });
      closeBtn.addEventListener('click', () => this.close());

      header.appendChild(title);
      header.appendChild(closeBtn);
      panel.appendChild(header);
    }

    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'padding: 24px;';
    if (typeof this.opts.content === 'string') {
      contentDiv.innerHTML = this.opts.content;
    } else {
      contentDiv.appendChild(this.opts.content);
    }
    panel.appendChild(contentDiv);

    return panel;
  }

  open(): void {
    if (this._isOpen) return;
    document.body.appendChild(this.overlay);
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.escHandler);
    this._isOpen = true;
  }

  close(): void {
    if (!this._isOpen) return;
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.escHandler);
    this._isOpen = false;
    this.opts.onClose();
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  /** The overlay DOM element (contains the panel). Append to body via `open()`. */
  get element(): HTMLDivElement {
    return this.overlay;
  }

  /** @deprecated Use `.element` */
  getElement(): HTMLDivElement {
    return this.overlay;
  }

  destroy(): void {
    this.close();
    document.removeEventListener('keydown', this.escHandler);
    this.overlay.remove();
  }
}
