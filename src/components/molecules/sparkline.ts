/**
 * Sparkline component — blob-sparkline
 *
 * A minimal inline trend line with no axes, no labels, and no grid. Intended
 * for use inside stat cards, table cells, or anywhere you need a "glanceable"
 * trend at a small size.
 *
 * Rendered as inline SVG. Responsive — fills its container width. Height is
 * controlled by the `height` option (default: 40px).
 *
 * Variants:
 *  - line    — polyline, optional filled area (default)
 *  - bar     — vertical bars (like a mini bar chart)
 *
 * Color: falls back to `--color-primary` so it inherits the active theme.
 *
 * @example
 * ```typescript
 * const spark = new Sparkline({ data: [3, 7, 2, 8, 5, 9, 4, 6] });
 * statCard.appendChild(spark.element);
 *
 * // Negative trend (red color)
 * const down = new Sparkline({ data: [9, 7, 6, 5, 4, 3], color: '#dc2626' });
 *
 * // Bar variant
 * const bars = new Sparkline({ data: [4, 7, 3, 8, 6], variant: 'bar' });
 *
 * // Update data
 * spark.setData([1, 5, 3, 9, 2]);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-sparkline';
  style.textContent = `
    .blob-sparkline {
      display: block;
      width:   100%;
    }
    .blob-sparkline svg {
      display:    block;
      width:      100%;
      overflow:   visible;
    }
    .blob-sparkline__line {
      fill:             none;
      stroke:           var(--blob-sparkline-color, var(--color-primary, #2563eb));
      stroke-width:     1.5;
      stroke-linecap:   round;
      stroke-linejoin:  round;
    }
    .blob-sparkline__area {
      fill:    var(--blob-sparkline-color, var(--color-primary, #2563eb));
      opacity: 0.12;
    }
    .blob-sparkline__bar {
      fill:         var(--blob-sparkline-color, var(--color-primary, #2563eb));
      opacity:      0.7;
      rx:           1;
    }
    .blob-sparkline__bar--last {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SparklineVariant = 'line' | 'bar';

export interface SparklineOptions {
  data:      number[];
  variant?:  SparklineVariant;
  /** Explicit color (overrides CSS var). */
  color?:    string;
  height?:   number;
  /** Fill area under the line. Default: true for 'line' variant. */
  filled?:   boolean;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function normalize(data: number[], padded: number): { minV: number; range: number } {
  const minV  = Math.min(...data);
  const maxV  = Math.max(...data);
  const range = maxV - minV || 1;
  void padded;
  return { minV, range };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Sparkline {
  public element: HTMLElement;
  private _opts:  SparklineOptions;

  constructor(options: SparklineOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const { data, variant = 'line', color, height = 40, filled = true } = this._opts;

    const wrap = document.createElement('div');
    wrap.className = 'blob-sparkline';
    wrap.style.height = `${height}px`;
    if (color) wrap.style.setProperty('--blob-sparkline-color', color);

    if (!data || data.length < 2) {
      wrap.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
      return wrap;
    }

    const W = 100; // viewBox units
    const H = height;
    const PAD = 2; // vertical padding in viewBox units

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    const { minV, range } = normalize(data, PAD);
    const n = data.length;

    const toX = (i: number) => (i / (n - 1)) * W;
    const toY = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2);

    if (variant === 'line') {
      const pts = data.map((v, i) => `${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(' ');

      if (filled) {
        const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const areaPoints = [
          `0,${H}`,
          ...data.map((v, i) => `${toX(i).toFixed(2)},${toY(v).toFixed(2)}`),
          `${W},${H}`,
        ].join(' ');
        area.setAttribute('points', areaPoints);
        area.setAttribute('class', 'blob-sparkline__area');
        svg.appendChild(area);
      }

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('points', pts);
      line.setAttribute('class', 'blob-sparkline__line');
      svg.appendChild(line);

    } else {
      // Bar variant
      const barW = (W / n) * 0.6;
      const gap  = (W / n) * 0.4;
      data.forEach((v, i) => {
        const barH = Math.max(1, ((v - minV) / range) * (H - PAD * 2));
        const x    = i * (barW + gap) + gap / 2;
        const y    = H - PAD - barH;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x',      x.toFixed(2));
        rect.setAttribute('y',      y.toFixed(2));
        rect.setAttribute('width',  barW.toFixed(2));
        rect.setAttribute('height', barH.toFixed(2));
        rect.setAttribute('rx',     '1');
        rect.setAttribute('class',  `blob-sparkline__bar${i === n - 1 ? ' blob-sparkline__bar--last' : ''}`);
        svg.appendChild(rect);
      });
    }

    wrap.appendChild(svg);
    return wrap;
  }

  public setData(data: number[]): void {
    this._opts.data = data;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
