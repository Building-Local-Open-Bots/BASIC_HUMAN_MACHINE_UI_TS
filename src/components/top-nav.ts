/**
 * TopNav Component
 *
 * A fixed top navigation bar with a logo slot, link items, and an optional
 * right-side CTA slot. Token-aware — all colors and fonts come from CSS
 * custom properties set by applyTheme().
 *
 * @example
 * ```typescript
 * const nav = new TopNav({
 *   logoText: 'BLOB Browser',
 *   logoHref: '/',
 *   items: [
 *     { path: '/dashboard', label: 'Dashboard' },
 *     { path: '/settings',  label: 'Settings'  },
 *   ],
 *   activePath: '/dashboard',
 * });
 *
 * document.body.appendChild(nav.element);
 * nav.setActivePath('/settings'); // update active state later
 * ```
 */

import type { widgetmeta } from './widget-meta';

export interface NavItem {
  path: string;
  label: string;
}

export interface TopNavOptions {
  logoText?: string;
  logoHref?: string;
  items?: NavItem[];
  activePath?: string;
  /** Optional element rendered on the right side (e.g. auth button). */
  ctaEl?: HTMLElement;
  height?: string;
}

export class TopNav {
  static meta: widgetmeta = {
    name: 'top-nav',
    description: 'Fixed top navigation bar with logo, links, and optional CTA slot',
    category: 'navigation',
    defaultOptions: { logoText: 'App', logoHref: '/', items: [] },
  };

  public element: HTMLElement;

  private options: Required<Omit<TopNavOptions, 'ctaEl'>> & { ctaEl?: HTMLElement };
  private linkEls: Map<string, HTMLElement> = new Map();

  constructor(options: TopNavOptions = {}) {
    this.options = {
      logoText:   options.logoText   ?? 'App',
      logoHref:   options.logoHref   ?? '/',
      items:      options.items      ?? [],
      activePath: options.activePath ?? '',
      ctaEl:      options.ctaEl,
      height:     options.height     ?? '48px',
    };

    this.element = this.build();
  }

  private build(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'top-nav';
    nav.style.cssText = [
      `height: ${this.options.height}`,
      'display: flex',
      'align-items: center',
      'padding: 0 20px',
      'gap: 24px',
      'background-color: var(--color-surface-elevated, #ffffff)',
      'border-bottom: 1px solid var(--color-border-default, #e5e7eb)',
      'position: sticky',
      'top: 0',
      'z-index: 50',
      'box-sizing: border-box',
      'width: 100%',
    ].join('; ');

    // Logo
    const logo = document.createElement('a');
    logo.href = this.options.logoHref;
    logo.textContent = this.options.logoText;
    logo.style.cssText = [
      'font-family: var(--font-display, sans-serif)',
      'font-size: 1rem',
      'font-weight: 700',
      'color: var(--color-primary, #000)',
      'text-decoration: none',
      'white-space: nowrap',
      'margin-right: 8px',
    ].join('; ');
    nav.appendChild(logo);

    // Nav items
    const itemsEl = document.createElement('div');
    itemsEl.style.cssText = 'display: flex; align-items: center; gap: 4px; flex: 1;';

    for (const item of this.options.items) {
      const link = this.createLink(item);
      this.linkEls.set(item.path, link);
      itemsEl.appendChild(link);
    }
    nav.appendChild(itemsEl);

    // CTA slot (e.g. auth button)
    if (this.options.ctaEl) {
      nav.appendChild(this.options.ctaEl);
    }

    return nav;
  }

  private createLink(item: NavItem): HTMLElement {
    const link = document.createElement('a');
    link.href = item.path;
    link.textContent = item.label;
    const isActive = item.path === this.options.activePath;
    link.style.cssText = this.linkStyles(isActive);
    if (isActive) link.classList.add('nav-item-active');
    return link;
  }

  private linkStyles(active: boolean): string {
    return [
      'font-family: var(--font-human, sans-serif)',
      'font-size: 0.875rem',
      `font-weight: ${active ? '600' : '400'}`,
      `color: ${active ? 'var(--color-primary, #000)' : 'var(--color-secondary, #555)'}`,
      'text-decoration: none',
      'padding: 6px 12px',
      'border-radius: var(--radius-m, 4px)',
      `background-color: ${active ? 'var(--color-surface-active, rgba(0,0,0,0.06))' : 'transparent'}`,
      'transition: background-color 0.15s ease, color 0.15s ease',
      'white-space: nowrap',
    ].join('; ');
  }

  /** Update the active link without re-rendering the entire nav. */
  public setActivePath(path: string): void {
    for (const [linkPath, el] of this.linkEls) {
      const active = linkPath === path;
      el.style.cssText = this.linkStyles(active);
      el.classList.toggle('nav-item-active', active);
    }
    this.options.activePath = path;
  }

  /** Replace the CTA slot element. */
  public setCta(el: HTMLElement): void {
    const existing = this.element.querySelector('.top-nav-cta');
    if (existing) existing.remove();
    el.classList.add('top-nav-cta');
    this.element.appendChild(el);
    this.options.ctaEl = el;
  }
}
