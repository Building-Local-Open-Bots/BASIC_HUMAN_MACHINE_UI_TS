/**
 * Breadcrumb component — blob-breadcrumb
 *
 * Navigation path chain. Each item is a label, optionally wrapped in an `<a>`
 * if an `href` is provided. The last item is the current page — it is rendered
 * as plain text (no link) and receives `aria-current="page"`.
 *
 * CSS class: blob-breadcrumb
 *
 * @example
 * ```typescript
 * const bc = new Breadcrumb({
 *   items: [
 *     { label: 'Home',     href: '/' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Alpha',                        },  // current — no href needed
 *   ],
 * });
 *
 * // Custom separator (SVG element)
 * const bc = new Breadcrumb({
 *   items: [...],
 *   separator: slashEl,
 * });
 *
 * // With icons
 * const bc = new Breadcrumb({
 *   items: [
 *     { label: 'Home', href: '/', icon: homeIcon },
 *     { label: 'Settings' },
 *   ],
 * });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-breadcrumb';
  style.textContent = `
    .blob-breadcrumb {
      display:     flex;
      align-items: center;
      flex-wrap:   wrap;
      gap:         0;
      font-family: var(--font-human, sans-serif);
      font-size:   0.875rem;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
      list-style:  none;
      margin:      0;
      padding:     0;
    }

    /* Item */
    .blob-breadcrumb__item {
      display:     flex;
      align-items: center;
      gap:         0;
    }

    /* Link or current-page text */
    .blob-breadcrumb__link {
      display:         flex;
      align-items:     center;
      gap:             0.3rem;
      color:           var(--color-text-subtle, rgba(0,0,0,0.45));
      text-decoration: none;
      padding:         0.1rem 0.2rem;
      border-radius:   var(--radius-s, 4px);
      transition:      color 0.1s ease, background 0.1s ease;
      white-space:     nowrap;
    }
    .blob-breadcrumb__link:hover {
      color:      var(--color-text-default, rgba(0,0,0,0.8));
      background: var(--color-surface, rgba(0,0,0,0.04));
    }
    .blob-breadcrumb__link:focus-visible {
      outline:        2px solid var(--color-primary, #000);
      outline-offset: 1px;
    }

    /* Current page (last item) */
    .blob-breadcrumb__current {
      display:     flex;
      align-items: center;
      gap:         0.3rem;
      color:       var(--color-text-primary, #000);
      font-weight: 500;
      white-space: nowrap;
    }

    /* Icon */
    .blob-breadcrumb__icon {
      display:     flex;
      align-items: center;
      flex-shrink: 0;
    }
    .blob-breadcrumb__icon svg,
    .blob-breadcrumb__icon img { width: 14px; height: 14px; }

    /* Separator */
    .blob-breadcrumb__sep {
      display:     flex;
      align-items: center;
      margin:      0 0.15rem;
      color:       var(--color-text-subtle, rgba(0,0,0,0.3));
      user-select: none;
      flex-shrink: 0;
    }
    .blob-breadcrumb__sep svg { width: 14px; height: 14px; }
  `;
  document.head.appendChild(style);
}

// Default separator chevron
const DEFAULT_SEP = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 3l3.5 4-3.5 4"/></svg>';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface BreadcrumbItem {
  label:  string;
  href?:  string;
  icon?:  HTMLElement;
  /** Override the separator after this item (useful for custom separators). */
  sep?:   HTMLElement | string;
}

export interface BreadcrumbOptions {
  items:      BreadcrumbItem[];
  /** Default separator between items. String = HTML, HTMLElement = element. */
  separator?: HTMLElement | string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Breadcrumb {
  public element: HTMLElement;

  constructor(options: BreadcrumbOptions) {
    injectStyles();
    this.element = this.build(options);
  }

  private buildSep(sep: HTMLElement | string | undefined): HTMLElement {
    const wrap = document.createElement('li');
    wrap.className = 'blob-breadcrumb__sep';
    wrap.setAttribute('aria-hidden', 'true');
    if (sep instanceof HTMLElement) {
      wrap.appendChild(sep.cloneNode(true) as HTMLElement);
    } else {
      wrap.innerHTML = sep ?? DEFAULT_SEP;
    }
    return wrap;
  }

  private build(options: BreadcrumbOptions): HTMLElement {
    const { items, separator } = options;

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Breadcrumb');

    const ol = document.createElement('ol');
    ol.className = 'blob-breadcrumb';

    items.forEach((item, idx) => {
      const isCurrent = idx === items.length - 1;
      const li = document.createElement('li');
      li.className = 'blob-breadcrumb__item';

      if (isCurrent) {
        const span = document.createElement('span');
        span.className = 'blob-breadcrumb__current';
        span.setAttribute('aria-current', 'page');

        if (item.icon) {
          const iconWrap = document.createElement('span');
          iconWrap.className = 'blob-breadcrumb__icon';
          iconWrap.appendChild(item.icon);
          span.appendChild(iconWrap);
        }

        span.appendChild(document.createTextNode(item.label));
        li.appendChild(span);
      } else {
        const a = item.href ? document.createElement('a') : document.createElement('span');
        a.className = 'blob-breadcrumb__link';
        if (item.href && a instanceof HTMLAnchorElement) a.href = item.href;

        if (item.icon) {
          const iconWrap = document.createElement('span');
          iconWrap.className = 'blob-breadcrumb__icon';
          iconWrap.appendChild(item.icon);
          a.appendChild(iconWrap);
        }

        a.appendChild(document.createTextNode(item.label));
        li.appendChild(a);

        // Append separator after non-last items
        const sep = item.sep ?? separator;
        ol.appendChild(li);
        ol.appendChild(this.buildSep(sep));
        return;
      }

      ol.appendChild(li);
    });

    nav.appendChild(ol);
    return nav;
  }
}
