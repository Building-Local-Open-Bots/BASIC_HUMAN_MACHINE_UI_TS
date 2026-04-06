/**
 * Tooltip component — blob-tooltip
 *
 * Shows a contextual label on hover or focus. Wraps any target element.
 * Positioning is CSS-driven (top/bottom/left/right). Edge-case overflow
 * detection is future work.
 *
 * Structure:
 *   <span class="blob-tooltip-wrapper">
 *     {target element}
 *     <span class="blob-tooltip__content blob-tooltip__content--top">…</span>
 *   </span>
 *
 * @example
 * ```typescript
 * const btn = new Button({ iconLeft: trashIcon, ariaLabel: 'Delete', variant: 'ghost' });
 * const tip = new Tooltip({ target: btn.element, content: 'Delete item', placement: 'top' });
 * container.appendChild(tip.element);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-tooltip';
  style.textContent = `
    .blob-tooltip-wrapper {
      position: relative;
      display:  inline-flex;
    }

    .blob-tooltip__content {
      position:        absolute;
      background:      var(--color-text-primary, rgba(0,0,0,0.9));
      color:           white;
      border-radius:   var(--radius-s, 4px);
      padding:         0.3rem 0.625rem;
      font-family:     var(--font-human, sans-serif);
      font-size:       0.75rem;
      font-weight:     400;
      line-height:     1.4;
      white-space:     nowrap;
      max-width:       240px;
      overflow:        hidden;
      text-overflow:   ellipsis;
      pointer-events:  none;
      z-index:         9999;
      /* Hidden by default */
      opacity:         0;
      visibility:      hidden;
      transition:      opacity 0.12s ease, visibility 0.12s ease;
    }

    /* Show on hover / focus-within */
    .blob-tooltip-wrapper:hover          .blob-tooltip__content,
    .blob-tooltip-wrapper:focus-within   .blob-tooltip__content {
      opacity:    1;
      visibility: visible;
    }

    /* Placements ----------------------------------------------------------- */
    .blob-tooltip__content--top {
      bottom:    calc(100% + 6px);
      left:      50%;
      transform: translateX(-50%);
    }
    .blob-tooltip__content--bottom {
      top:       calc(100% + 6px);
      left:      50%;
      transform: translateX(-50%);
    }
    .blob-tooltip__content--left {
      right:     calc(100% + 6px);
      top:       50%;
      transform: translateY(-50%);
    }
    .blob-tooltip__content--right {
      left:      calc(100% + 6px);
      top:       50%;
      transform: translateY(-50%);
    }

    /* Dark-mode: lighter background */
    @media (prefers-color-scheme: dark) {
      .blob-tooltip__content {
        background: rgba(255,255,255,0.92);
        color:      rgba(0,0,0,0.9);
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipOptions {
  /** The element the tooltip is attached to. Becomes the first child of the wrapper. */
  target:      HTMLElement;
  content:     string;
  placement?:  TooltipPlacement;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Tooltip {
  public element: HTMLElement;
  private _tip:   HTMLElement;
  private _opts:  TooltipOptions;

  constructor(options: TooltipOptions) {
    injectStyles();
    this._opts = options;
    const { wrapper, tip } = this.build();
    this.element = wrapper;
    this._tip    = tip;
  }

  private build(): { wrapper: HTMLElement; tip: HTMLElement } {
    const { target, content, placement = 'top' } = this._opts;

    const wrapper = document.createElement('span');
    wrapper.className = 'blob-tooltip-wrapper';

    wrapper.appendChild(target);

    const tip = document.createElement('span');
    tip.className   = `blob-tooltip__content blob-tooltip__content--${placement}`;
    tip.textContent = content;
    tip.setAttribute('role', 'tooltip');
    wrapper.appendChild(tip);

    return { wrapper, tip };
  }

  public setContent(content: string): void {
    this._opts.content    = content;
    this._tip.textContent = content;
  }

  public setPlacement(placement: TooltipPlacement): void {
    this._opts.placement = placement;
    this._tip.className  = `blob-tooltip__content blob-tooltip__content--${placement}`;
  }
}
