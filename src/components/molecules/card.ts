/**
 * Card component — blob-card
 *
 * A surface container with optional header (leading + title/subtitle + trailing),
 * optional media (image banner), a free-form body slot, and an optional footer
 * with action buttons. Accepts any atom or molecule as content.
 *
 * CSS class: blob-card
 * Variants:  default  — bordered, no shadow
 *            elevated — drop shadow, no border
 *            outlined — thicker border, no shadow
 *            ghost    — no border, no shadow (plain container)
 *
 * @example
 * ```typescript
 * const body = document.createElement('div');
 * body.textContent = 'Here is some card content.';
 *
 * const card = new Card({
 *   title:    'Project Alpha',
 *   subtitle: 'Last updated 2h ago',
 *   leading:  new Avatar({ initials: 'PA', size: 'sm' }).element,
 *   trailing: new Badge({ label: 'Active', variant: 'success' }).element,
 *   body:     body,
 *   actions:  [
 *     new Button({ label: 'Open',   variant: 'primary',   size: 'sm' }).element,
 *     new Button({ label: 'Share',  variant: 'secondary', size: 'sm' }).element,
 *   ],
 * });
 *
 * // Media card
 * const mediaCard = new Card({
 *   mediaSrc: '/cover.jpg',
 *   title:    'Getting started',
 *   body:     descEl,
 * });
 *
 * // Clickable card
 * const link = new Card({ title: 'Go somewhere', variant: 'elevated', onClick: () => nav('/') });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-card';
  style.textContent = `
    /* Base */
    .blob-card {
      background:   var(--color-background, #fff);
      border-radius: var(--radius-l, 10px);
      overflow:     hidden;
      display:      flex;
      flex-direction: column;
      font-family:  var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    /* Variants */
    .blob-card--default  { border: 1px solid var(--color-border, #e5e5e5); }
    .blob-card--elevated { box-shadow: var(--shadow-md, 0 4px 16px rgba(0,0,0,0.08)); }
    .blob-card--outlined { border: 2px solid var(--color-border, #d1d5db); }
    .blob-card--ghost    { /* no border, no shadow */ }

    /* Clickable card */
    .blob-card--clickable {
      cursor:     pointer;
      transition: box-shadow 0.15s ease, transform 0.1s ease;
    }
    .blob-card--clickable:hover {
      box-shadow: var(--shadow-md, 0 6px 20px rgba(0,0,0,0.1));
      transform:  translateY(-1px);
    }
    .blob-card--clickable:active {
      transform:  translateY(0);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08));
    }
    .blob-card--clickable:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 2px;
    }

    /* Media banner */
    .blob-card__media {
      width:      100%;
      aspect-ratio: 16/9;
      overflow:   hidden;
      flex-shrink: 0;
    }
    .blob-card__media img {
      width:      100%;
      height:     100%;
      object-fit: cover;
      display:    block;
    }

    /* Header */
    .blob-card__header {
      display:     flex;
      align-items: center;
      gap:         0.75rem;
      padding:     1rem 1rem 0;
    }
    .blob-card__header--bottom-border {
      padding-bottom: 0.75rem;
      border-bottom:  1px solid var(--color-border, #e5e5e5);
      margin-bottom:  0;
    }

    .blob-card__header-leading {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }

    .blob-card__header-body {
      flex:    1;
      min-width: 0;
    }
    .blob-card__title {
      font-size:     0.9375rem;
      font-weight:   600;
      color:         var(--color-text-primary, #000);
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
      line-height:   1.3;
    }
    .blob-card__subtitle {
      font-size:     0.8125rem;
      font-weight:   400;
      color:         var(--color-text-subtle, rgba(0,0,0,0.45));
      margin-top:    0.1rem;
      white-space:   nowrap;
      overflow:      hidden;
      text-overflow: ellipsis;
    }

    .blob-card__header-trailing {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }

    /* Body */
    .blob-card__body {
      flex:    1;
      padding: 1rem;
      color:   var(--color-text-default, rgba(0,0,0,0.8));
      font-size: 0.875rem;
      line-height: 1.6;
    }
    /* Tighten body when header is present */
    .blob-card--has-header .blob-card__body {
      padding-top: 0.75rem;
    }

    /* Footer */
    .blob-card__footer {
      display:         flex;
      align-items:     center;
      justify-content: flex-end;
      gap:             0.5rem;
      padding:         0 1rem 1rem;
      border-top:      1px solid var(--color-border, #e5e5e5);
      padding-top:     0.75rem;
      margin-top:      auto;
    }
    .blob-card__footer--start {
      justify-content: flex-start;
    }
    .blob-card__footer--between {
      justify-content: space-between;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type CardVariant     = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardFooterAlign = 'start' | 'end' | 'between';

export interface CardOptions {
  /** Card title in the header. Omit header section entirely if not provided. */
  title?:        string;
  subtitle?:     string;
  /** Element placed at the start of the header (Avatar, icon, etc.). */
  leading?:      HTMLElement;
  /** Element placed at the end of the header (Badge, Button, etc.). */
  trailing?:     HTMLElement;
  /** Shows a divider under the header. */
  headerDivider?: boolean;
  /** Image URL for a banner above the header. */
  mediaSrc?:     string;
  mediaAlt?:     string;
  /** The main body content. Any HTMLElement. */
  body?:         HTMLElement;
  /** Action buttons rendered in the footer. */
  actions?:      HTMLElement[];
  footerAlign?:  CardFooterAlign;
  variant?:      CardVariant;
  onClick?:      () => void;
  className?:    string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Card {
  public element: HTMLElement;
  private _opts:  CardOptions;

  constructor(options: CardOptions = {}) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      title, subtitle, leading, trailing, headerDivider = false,
      mediaSrc, mediaAlt = '', body, actions,
      footerAlign = 'end', variant = 'default',
      onClick, className,
    } = this._opts;

    const hasHeader = !!(title || leading || trailing);

    const card = document.createElement('div');
    card.className = [
      'blob-card',
      `blob-card--${variant}`,
      onClick ? 'blob-card--clickable' : '',
      hasHeader ? 'blob-card--has-header' : '',
      className ?? '',
    ].filter(Boolean).join(' ');

    if (onClick) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      });
    }

    // Media
    if (mediaSrc) {
      const mediaEl = document.createElement('div');
      mediaEl.className = 'blob-card__media';
      const img = document.createElement('img');
      img.src = mediaSrc;
      img.alt = mediaAlt;
      img.loading = 'lazy';
      mediaEl.appendChild(img);
      card.appendChild(mediaEl);
    }

    // Header
    if (hasHeader) {
      const header = document.createElement('div');
      header.className = [
        'blob-card__header',
        headerDivider ? 'blob-card__header--bottom-border' : '',
      ].filter(Boolean).join(' ');

      if (leading) {
        const leadWrap = document.createElement('div');
        leadWrap.className = 'blob-card__header-leading';
        leadWrap.appendChild(leading);
        header.appendChild(leadWrap);
      }

      if (title || subtitle) {
        const headerBody = document.createElement('div');
        headerBody.className = 'blob-card__header-body';

        if (title) {
          const titleEl = document.createElement('div');
          titleEl.className   = 'blob-card__title';
          titleEl.textContent = title;
          headerBody.appendChild(titleEl);
        }

        if (subtitle) {
          const subEl = document.createElement('div');
          subEl.className   = 'blob-card__subtitle';
          subEl.textContent = subtitle;
          headerBody.appendChild(subEl);
        }

        header.appendChild(headerBody);
      }

      if (trailing) {
        const trailWrap = document.createElement('div');
        trailWrap.className = 'blob-card__header-trailing';
        trailWrap.appendChild(trailing);
        header.appendChild(trailWrap);
      }

      card.appendChild(header);
    }

    // Body
    if (body) {
      const bodyEl = document.createElement('div');
      bodyEl.className = 'blob-card__body';
      bodyEl.appendChild(body);
      card.appendChild(bodyEl);
    }

    // Footer
    if (actions && actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = [
        'blob-card__footer',
        footerAlign === 'start'   ? 'blob-card__footer--start'   : '',
        footerAlign === 'between' ? 'blob-card__footer--between' : '',
      ].filter(Boolean).join(' ');
      for (const action of actions) footer.appendChild(action);
      card.appendChild(footer);
    }

    return card;
  }

  public set(updates: Partial<CardOptions>): void {
    Object.assign(this._opts, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
