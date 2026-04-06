/**
 * LineChart component — blob-line-chart
 *
 * SVG line chart with X/Y axes, grid lines, optional data point dots, and
 * multi-series support. All chrome (axes, grid, labels) uses CSS tokens so
 * it inherits dark mode automatically.
 *
 * Rendering is pure SVG — no canvas, no external dependencies.
 * The viewBox is fixed at 600 × 320 internal units; the element scales to
 * fill its container via `width: 100%`.
 *
 * X-axis can be categorical (string labels) or numeric.
 *
 * @example
 * ```typescript
 * // Single series — daily visitors
 * const chart = new LineChart({
 *   series: [{
 *     label: 'Visitors',
 *     data: [
 *       { x: 'Mon', y: 120 },
 *       { x: 'Tue', y: 200 },
 *       { x: 'Wed', y: 150 },
 *       { x: 'Thu', y: 300 },
 *       { x: 'Fri', y: 260 },
 *     ],
 *   }],
 * });
 *
 * // Multi-series
 * const chart = new LineChart({
 *   series: [
 *     { label: 'Revenue',  data: [{ x: 1, y: 400 }, { x: 2, y: 600 }] },
 *     { label: 'Expenses', data: [{ x: 1, y: 250 }, { x: 2, y: 300 }], color: '#dc2626' },
 *   ],
 *   xLabel: 'Quarter',
 *   yLabel: 'USD',
 *   showDots: true,
 * });
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-line-chart';
  style.textContent = `
    .blob-line-chart {
      display:     block;
      width:       100%;
      font-family: var(--font-machine, monospace);
      -webkit-font-smoothing: antialiased;
    }
    .blob-line-chart svg { display: block; width: 100%; overflow: visible; }

    /* Grid */
    .blob-line-chart__grid {
      stroke:       var(--color-border, #e5e5e5);
      stroke-width: 1;
    }
    /* Axes */
    .blob-line-chart__axis {
      stroke:       var(--color-border, #e5e5e5);
      stroke-width: 1;
    }
    /* Tick labels */
    .blob-line-chart__tick {
      fill:      var(--color-text-subtle, rgba(0,0,0,0.45));
      font-size: 11px;
    }
    /* Axis labels */
    .blob-line-chart__label {
      fill:        var(--color-text-default, rgba(0,0,0,0.7));
      font-size:   12px;
      font-weight: 500;
    }
    /* Data lines */
    .blob-line-chart__line {
      fill:             none;
      stroke-width:     2;
      stroke-linecap:   round;
      stroke-linejoin:  round;
    }
    /* Data dots */
    .blob-line-chart__dot {
      r:      4;
      stroke: var(--color-background, #fff);
      stroke-width: 2;
    }

    /* Legend */
    .blob-line-chart__legend {
      display:         flex;
      flex-wrap:       wrap;
      gap:             0.375rem 0.875rem;
      justify-content: center;
      font-size:       0.8rem;
      margin-top:      0.5rem;
      font-family:     var(--font-human, sans-serif);
    }
    .blob-line-chart__legend-item {
      display:     flex;
      align-items: center;
      gap:         0.375rem;
      color:       var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-line-chart__legend-swatch {
      width:         24px;
      height:        3px;
      border-radius: 2px;
      flex-shrink:   0;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const LINE_PALETTE = [
  'var(--color-primary, #2563eb)',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LineChartPoint {
  x: number | string;
  y: number;
}

export interface LineChartSeries {
  label:  string;
  data:   LineChartPoint[];
  color?: string;
}

export interface LineChartOptions {
  series:       LineChartSeries[];
  xLabel?:      string;
  yLabel?:      string;
  showDots?:    boolean;
  showGrid?:    boolean;
  showLegend?:  boolean;
  palette?:     string[];
  /** Number of Y-axis gridlines. Default 5. */
  yTicks?:      number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function svgText(content: string, attrs: Record<string, string | number>, cls: string): SVGTextElement {
  const el = svgEl('text', attrs);
  el.setAttribute('class', cls);
  el.textContent = content;
  return el;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class LineChart {
  public element: HTMLElement;
  private _opts:  LineChartOptions;

  constructor(options: LineChartOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      series, xLabel, yLabel,
      showDots = true, showGrid = true, showLegend = true,
      palette = LINE_PALETTE, yTicks = 5,
    } = this._opts;

    const wrap = document.createElement('div');
    wrap.className = 'blob-line-chart';

    if (!series.length) return wrap;

    // Layout constants (SVG user units)
    const VW     = 600;
    const VH     = 280;
    const LEFT   = yLabel  ? 64 : 52;
    const RIGHT  = 16;
    const TOP    = 12;
    const BOTTOM = xLabel  ? 46 : 34;

    const plotW  = VW - LEFT - RIGHT;
    const plotH  = VH - TOP - BOTTOM;

    // Collect all points across series
    const allY = series.flatMap(s => s.data.map(p => p.y));
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const yRange = maxY - minY || 1;

    // X scale — categorical or numeric
    const xVals = series[0].data.map(p => p.x);
    const n     = xVals.length;

    const toPlotX = (i: number) => LEFT + (i / Math.max(n - 1, 1)) * plotW;
    const toPlotY = (v: number) => TOP + plotH - ((v - minY) / yRange) * plotH;

    const svg = svgEl('svg', { viewBox: `0 0 ${VW} ${VH}`, 'aria-label': 'Line chart', role: 'img' });

    // Grid lines (horizontal)
    if (showGrid) {
      for (let t = 0; t <= yTicks; t++) {
        const y = TOP + (t / yTicks) * plotH;
        svg.appendChild(svgEl('line', { x1: LEFT, y1: y, x2: LEFT + plotW, y2: y, class: 'blob-line-chart__grid' }));
      }
    }

    // Axes
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP, x2: LEFT, y2: TOP + plotH, class: 'blob-line-chart__axis' }));
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP + plotH, x2: LEFT + plotW, y2: TOP + plotH, class: 'blob-line-chart__axis' }));

    // Y tick labels
    for (let t = 0; t <= yTicks; t++) {
      const v = minY + ((yTicks - t) / yTicks) * yRange;
      const y = TOP + (t / yTicks) * plotH;
      svg.appendChild(svgText(
        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0),
        { x: LEFT - 8, y: y + 4, 'text-anchor': 'end' },
        'blob-line-chart__tick',
      ));
    }

    // X tick labels
    xVals.forEach((xv, i) => {
      const x = toPlotX(i);
      // Thin out labels when many points
      if (n <= 12 || i % Math.ceil(n / 10) === 0) {
        svg.appendChild(svgText(
          String(xv),
          { x, y: TOP + plotH + 18, 'text-anchor': 'middle' },
          'blob-line-chart__tick',
        ));
      }
    });

    // Axis labels
    if (yLabel) {
      const lbl = svgText(yLabel, { x: 14, y: TOP + plotH / 2, 'text-anchor': 'middle', transform: `rotate(-90, 14, ${TOP + plotH / 2})` }, 'blob-line-chart__label');
      svg.appendChild(lbl);
    }
    if (xLabel) {
      svg.appendChild(svgText(xLabel, { x: LEFT + plotW / 2, y: VH - 4, 'text-anchor': 'middle' }, 'blob-line-chart__label'));
    }

    // Series lines + dots
    series.forEach((s, si) => {
      const color = s.color ?? palette[si % palette.length];
      const pts   = s.data.map((p, i) => `${toPlotX(i).toFixed(2)},${toPlotY(p.y).toFixed(2)}`).join(' ');

      const line = svgEl('polyline', { points: pts, class: 'blob-line-chart__line', stroke: color });
      svg.appendChild(line);

      if (showDots) {
        s.data.forEach((p, i) => {
          const dot = svgEl('circle', {
            cx:    toPlotX(i),
            cy:    toPlotY(p.y),
            class: 'blob-line-chart__dot',
            fill:  color,
          });
          const titleEl = document.createElementNS(SVG_NS, 'title');
          titleEl.textContent = `${s.label}: ${p.y} at ${p.x}`;
          dot.appendChild(titleEl);
          svg.appendChild(dot);
        });
      }
    });

    wrap.appendChild(svg);

    // Legend
    if (showLegend && series.length > 1) {
      const legend = document.createElement('div');
      legend.className = 'blob-line-chart__legend';
      series.forEach((s, si) => {
        const color = s.color ?? palette[si % palette.length];
        const item  = document.createElement('div');
        item.className = 'blob-line-chart__legend-item';

        const swatch = document.createElement('span');
        swatch.className        = 'blob-line-chart__legend-swatch';
        swatch.style.background = color;
        item.appendChild(swatch);

        const lbl = document.createElement('span');
        lbl.textContent = s.label;
        item.appendChild(lbl);

        legend.appendChild(item);
      });
      wrap.appendChild(legend);
    }

    return wrap;
  }

  public setData(series: LineChartSeries[]): void {
    this._opts.series = series;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
