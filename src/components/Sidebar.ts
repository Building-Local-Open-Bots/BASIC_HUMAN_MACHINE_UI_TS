/**
 * Sidebar Component
 * 
 * A collapsible sidebar that can be positioned on the left or right side.
 * 
 * @example
 * ```typescript
 * const sidebar = new Sidebar({
 *   side: 'left',
 *   collapsed: false,
 *   width: '280px',
 *   collapsedWidth: '48px'
 * });
 * 
 * sidebar.setContent('<div>My content</div>');
 * document.body.appendChild(sidebar.element);
 * ```
 */

export interface sidebaroptions {
  side?: 'left' | 'right';
  collapsed?: boolean;
  width?: string;
  collapsedWidth?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export class sidebar {
  private container: HTMLElement;
  private contentArea: HTMLElement;
  private toggleButton: HTMLElement;
  private options: Required<sidebaroptions>;
  private isCollapsed: boolean;
  private onToggleCallbacks: ((collapsed: boolean) => void)[] = [];

  constructor(options: sidebaroptions = {}) {
    this.options = {
      side: options.side || 'left',
      collapsed: options.collapsed || false,
      width: options.width || '280px',
      collapsedWidth: options.collapsedWidth || '48px',
      backgroundColor: options.backgroundColor || '#ffffff',
      borderColor: options.borderColor || '#e5e7eb'
    };

    this.isCollapsed = this.options.collapsed;
    this.container = this.createContainer();
    this.contentArea = this.createContentArea();
    this.toggleButton = this.createToggleButton();

    this.container.appendChild(this.contentArea);
    this.container.appendChild(this.toggleButton);
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = `sidebar sidebar-${this.options.side}`;
    
    const baseStyles = `
      position: fixed;
      top: 0;
      ${this.options.side}: 0;
      height: 100vh;
      background-color: ${this.options.backgroundColor};
      border-${this.options.side === 'left' ? 'right' : 'left'}: 1px solid ${this.options.borderColor};
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 40;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;

    container.style.cssText = baseStyles + `width: ${this.isCollapsed ? this.options.collapsedWidth : this.options.width};`;
    
    return container;
  }

  private createContentArea(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'sidebar-content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px;
      opacity: ${this.isCollapsed ? '0' : '1'};
      transition: opacity 0.2s ease-in-out;
    `;
    return content;
  }

  private createToggleButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'sidebar-toggle';
    button.setAttribute('aria-label', this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    
    const icon = this.getToggleIcon();
    button.innerHTML = icon;
    
    button.style.cssText = `
      position: absolute;
      top: 12px;
      ${this.options.side === 'left' ? 'right' : 'left'}: -16px;
      width: 32px;
      height: 32px;
      border-radius: 9999px;
      background-color: ${this.options.backgroundColor};
      border: 1px solid ${this.options.borderColor};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      z-index: 50;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `;

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f9fafb';
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = this.options.backgroundColor;
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      this.toggle();
    });

    return button;
  }

  private getToggleIcon(): string {
    const isLeft = this.options.side === 'left';
    const shouldPointIn = (isLeft && !this.isCollapsed) || (!isLeft && this.isCollapsed);
    
    return shouldPointIn 
      ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`
      : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`;
  }

  /**
   * Toggle sidebar collapsed state
   */
  public toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    this.updateState();
  }

  /**
   * Collapse the sidebar
   */
  public collapse(): void {
    if (!this.isCollapsed) {
      this.isCollapsed = true;
      this.updateState();
    }
  }

  /**
   * Expand the sidebar
   */
  public expand(): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.updateState();
    }
  }

  private updateState(): void {
    this.container.style.width = this.isCollapsed ? this.options.collapsedWidth : this.options.width;
    this.contentArea.style.opacity = this.isCollapsed ? '0' : '1';
    this.toggleButton.innerHTML = this.getToggleIcon();
    this.toggleButton.setAttribute('aria-label', this.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    
    // Call registered callbacks
    this.onToggleCallbacks.forEach(callback => callback(this.isCollapsed));
  }

  /**
   * Set sidebar content (HTML string or HTMLElement)
   */
  public setContent(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      this.contentArea.innerHTML = content;
    } else {
      this.contentArea.innerHTML = '';
      this.contentArea.appendChild(content);
    }
  }

  /**
   * Add content to sidebar (appends instead of replacing)
   */
  public addContent(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      this.contentArea.insertAdjacentHTML('beforeend', content);
    } else {
      this.contentArea.appendChild(content);
    }
  }

  /**
   * Clear sidebar content
   */
  public clearContent(): void {
    this.contentArea.innerHTML = '';
  }

  /**
   * Register a callback for toggle events
   */
  public onToggle(callback: (collapsed: boolean) => void): void {
    this.onToggleCallbacks.push(callback);
  }

  /**
   * Get the sidebar DOM element
   */
  get element(): HTMLElement {
    return this.container;
  }

  /**
   * Get collapsed state
   */
  get collapsed(): boolean {
    return this.isCollapsed;
  }

  /**
   * Destroy the sidebar and remove from DOM
   */
  public destroy(): void {
    this.container.remove();
    this.onToggleCallbacks = [];
  }
}
