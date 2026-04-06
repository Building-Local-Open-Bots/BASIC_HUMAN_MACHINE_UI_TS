/**
 * Avatar component — blob-avatar
 *
 * Displays a user's profile image or their initials as a fallback.
 * Optional status dot overlay.
 *
 * CSS class: blob-avatar
 * Sizes:     blob-avatar--xs (24) --sm (32) --md (40, default) --lg (56) --xl (80)
 * Shape:     circle (default) or blob-avatar--square
 * Status:    blob-avatar__status --online --away --busy --offline
 *
 * @example
 * ```typescript
 * const avatar = new Avatar({ src: '/user.jpg', alt: 'Jane Doe', size: 'md' });
 * const init   = new Avatar({ initials: 'JD', size: 'lg', status: 'online' });
 * const square = new Avatar({ src: '/logo.png', shape: 'square', size: 'sm' });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-avatar';
  style.textContent = `
    .blob-avatar {
      position:        relative;
      display:         inline-flex;
      align-items:     center;
      justify-content: center;
      border-radius:   50%;
      overflow:        hidden;
      background:      var(--color-surface-elevated, #e0e0e0);
      color:           var(--color-text-default, rgba(0,0,0,0.7));
      font-family:     var(--font-human, sans-serif);
      font-weight:     600;
      flex-shrink:     0;
      user-select:     none;
    }

    /* Sizes */
    .blob-avatar--xs { width: 24px; height: 24px; font-size: 0.6rem;   }
    .blob-avatar--sm { width: 32px; height: 32px; font-size: 0.75rem;  }
    .blob-avatar--md { width: 40px; height: 40px; font-size: 0.875rem; }
    .blob-avatar--lg { width: 56px; height: 56px; font-size: 1.125rem; }
    .blob-avatar--xl { width: 80px; height: 80px; font-size: 1.5rem;   }

    /* Shape */
    .blob-avatar--square { border-radius: var(--radius-m, 6px); overflow: hidden; }

    /* Image */
    .blob-avatar__img {
      width:      100%;
      height:     100%;
      object-fit: cover;
      display:    block;
    }

    /* Status dot — positioned outside the overflow:hidden via outline trick */
    .blob-avatar {
      /* Re-enable overflow visible so status dot shows */
      overflow: visible;
    }
    .blob-avatar__img {
      /* Keep image clipped via border-radius on the img itself */
      border-radius: inherit;
      overflow:      hidden;
    }
    .blob-avatar__initials {
      border-radius: inherit;
    }
    .blob-avatar__status {
      position:     absolute;
      bottom:       0;
      right:        0;
      border-radius: 50%;
      border:       2px solid var(--color-background, #fff);
      z-index:      1;
    }

    /* Status dot sizes (scale with avatar) */
    .blob-avatar--xs .blob-avatar__status { width: 6px;  height: 6px;  border-width: 1.5px; }
    .blob-avatar--sm .blob-avatar__status { width: 8px;  height: 8px;  }
    .blob-avatar--md .blob-avatar__status { width: 10px; height: 10px; }
    .blob-avatar--lg .blob-avatar__status { width: 12px; height: 12px; border-width: 2.5px; }
    .blob-avatar--xl .blob-avatar__status { width: 16px; height: 16px; border-width: 3px;   }

    /* Status colours */
    .blob-avatar__status--online  { background: #22c55e; }
    .blob-avatar__status--away    { background: #f59e0b; }
    .blob-avatar__status--busy    { background: #ef4444; }
    .blob-avatar__status--offline { background: #9ca3af; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AvatarSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape   = 'circle' | 'square';
export type AvatarStatus  = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarOptions {
  /** Image URL. Falls back to `initials` then a generic placeholder. */
  src?:       string;
  alt?:       string;
  /** Up to 2 characters shown when no `src`. Auto-derived when omitted. */
  initials?:  string;
  size?:      AvatarSize;
  shape?:     AvatarShape;
  status?:    AvatarStatus;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Avatar {
  public element: HTMLElement;
  private _opts: AvatarOptions;

  constructor(options: AvatarOptions = {}) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      src, alt = '', initials, size = 'md',
      shape = 'circle', status, className,
    } = this._opts;

    const el = document.createElement('span');
    el.className = [
      'blob-avatar',
      `blob-avatar--${size}`,
      shape === 'square' ? 'blob-avatar--square' : '',
      className ?? '',
    ].filter(Boolean).join(' ');

    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', alt || initials || 'Avatar');

    if (src) {
      const img = document.createElement('img');
      img.className = 'blob-avatar__img';
      img.src       = src;
      img.alt       = alt;
      img.draggable = false;
      el.appendChild(img);
    } else {
      const text = document.createElement('span');
      text.className   = 'blob-avatar__initials';
      text.textContent = (initials ?? '?').slice(0, 2).toUpperCase();
      el.appendChild(text);
    }

    if (status) {
      const dot = document.createElement('span');
      dot.className = `blob-avatar__status blob-avatar__status--${status}`;
      dot.setAttribute('aria-label', status);
      el.appendChild(dot);
    }

    return el;
  }

  public set(updates: Partial<AvatarOptions>): void {
    Object.assign(this._opts, updates);
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setStatus(status: AvatarStatus | undefined): void { this.set({ status }); }
  public setSrc(src: string): void { this.set({ src }); }
}
