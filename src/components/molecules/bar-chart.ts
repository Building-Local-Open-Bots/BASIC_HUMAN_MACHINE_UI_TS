/**
 * BarChart component — blob-bar-chart
 *
 * SVG bar chart supporting vertical (default) and horizontal orientations.
 * Grouped multi-series supported in vertical mode.
 *
 * All chrome uses CSS tokens. Pure SVG, no dependencies.
 * Responsive — fills its container via `width: 100%`.
 *
 * @example
 * ```typescript
 * // Simple vertical
 * const chart = new BarChart({
 *   data: [
 *     { label: 'Q1', value: 400 },
 *     { label: 'Q2', value: 650 },
 *     { label: 'Q3', value: 520 },
 *     { label: 'Q4', value: 780 },
 *   ],
 * });
 *
 * // Horizontal (great for rankings)
 * const chart = new BarChart({
 *   data: [
 *     { label: 'TypeScript', value: 60 },
 *     { label: 'Python',     value: 25 },
 *     { label: 'Rust',       value: 15 },
 *   ],
 *   orientation: 'horizontal',
 * });
 *
 * // Grouped multi-series (vertical)
 * const chart = new BarChart({
 *   groups: [
 *     { label: 'Q1', values: [120, 80] },
 *     { label: 'Q2', values: [150, 95] },
 *   ],
 *   seriesLabels: ['Revenue', 'Cost'],
 * });
 *
 * // Update
 * chart.setData([{ label: 'Jan', value: 100 }]);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-bar-chart';
  style.textContent = `
    .blob-bar-chart {
      display:     block;
      width:       100%;
      font-family: var(--font-machine, monospace);
      -webkit-font-smoothing: antialiased;
    }
    .blob-bar-chart svg { display: block; width: 100%; overflow: visible; }

    /* Grid */
    .blob-bar-chart__grid  { stroke: var(--color-border, #e5e5e5); stroke-width: 1; }
    /* Axes */
    .blob-bar-chart__axis  { stroke: var(--color-border, #e5e5e5); stroke-width: 1; }
    /* Tick labels */
    .blob-bar-chart__tick  { fill: var(--color-text-subtle, rgba(0,0,0,0.45)); font-size: 11px; }
    /* Axis labels */
    .blob-bar-chart__label { fill: var(--color-text-default, rgba(0,0,0,0.7)); font-size: 12px; font-weight: 500; }
    /* Bars */
    .blob-bar-chart__bar   { rx: 3; transition: opacity 0.1s ease; }
    .blob-bar-chart__bar:hover { opacity: 0.8; }
    /* Value labels on bars */
    .blob-bar-chart__val   {
      fill:       var(--color-text-subtle, rgba(0,0,0,0.45));
      font-size:  10px;
      text-anchor: middle;
    }

    /* Legend */
    .blob-bar-chart__legend {
      display:         flex;
      flex-wrap:       wrap;
      gap:             0.375rem 0.875rem;
      justify-content: center;
      font-size:       0.8rem;
      margin-top:      0.5rem;
      font-family:     var(--font-human, sans-serif);
    }
    .blob-bar-chart__legend-item {
      display:     flex;
      align-items: center;
      gap:         0.375rem;
      color:       var(--color-text-default, rgba(0,0,0,0.8));
    }
    .blob-bar-chart__legend-dot {
      width:         10px;
      height:        10px;
      border-radius: var(--radius-s, 3px);
      flex-shrink:   0;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const BAR_PALETTE = [
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
export type BarChartOrientation = 'vertical' | 'horizontal';

export interface BarChartDataPoint {
  label:  string;
  value:  number;
  color?: string;
}

export interface BarChartGroup {
  label:  string;
  values: number[];
}

export interface BarChartOptions {
  /** Simple single-value data. */
  data?:          BarChartDataPoint[];
  /** Grouped multi-series data. Supply seriesLabels for legend. */
  groups?:        BarChartGroup[];
  seriesLabels?:  string[];
  seriesColors?:  string[];
  orientation?:   BarChartOrientation;
  xLabel?:        string;
  yLabel?:        string;
  showGrid?:      boolean;
  showLegend?:    boolean;
  showValues?:    boolean;
  palette?:       string[];
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
  const el = document.createElementNS(SVG_NS, 'text') as SVGTextElement;
  el.setAttribute('class', cls);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  el.textContent = content;
  return el;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class BarChart {
  public element: HTMLElement;
  private _opts:  BarChartOptions;

  constructor(options: BarChartOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      data, groups, seriesLabels, seriesColors,
      orientation = 'vertical', xLabel, yLabel,
      showGrid = true, showLegend = true, showValues = false,
      palette = BAR_PALETTE,
    } = this._opts;

    const wrap = document.createElement('div');
    wrap.className = 'blob-bar-chart';

    const isGrouped = !!groups?.length;
    const isSimple  = !!data?.length;
    if (!isGrouped && !isSimple) return wrap;

    const VW     = 600;
    const VH     = 280;
    const LEFT   = yLabel  ? 64 : 52;
    const RIGHT  = 16;
    const TOP    = 12;
    const BOTTOM = xLabel  ? 46 : 34;
    const plotW  = VW - LEFT - RIGHT;
    const plotH  = VH - TOP - BOTTOM;

    const svg = svgEl('svg', { viewBox: `0 0 ${VW} ${VH}`, 'aria-label': 'Bar chart', role: 'img' });

    if (orientation === 'vertical') {
      this.buildVertical(svg, { data, groups, seriesLabels, seriesColors, palette, showGrid, showValues, xLabel, yLabel, plotW, plotH, LEFT, TOP, BOTTOM, VH, VW });
    } else {
      this.buildHorizontal(svg, { data: data ?? [], palette, showGrid, showValues, xLabel, yLabel, plotW, plotH, LEFT, TOP, RIGHT, VH, VW });
    }

    wrap.appendChild(svg);

    // Legend for grouped charts
    if (showLegend && isGrouped && seriesLabels?.length) {
      const legend = document.createElement('div');
      legend.className = 'blob-bar-chart__legend';
      seriesLabels.forEach((lbl, si) => {
        const color = (seriesColors?.[si]) ?? palette[si % palette.length];
        const item  = document.createElement('div');
        item.className = 'blob-bar-chart__legend-item';

        const dot = document.createElement('span');
        dot.className        = 'blob-bar-chart__legend-dot';
        dot.style.background = color;
        item.appendChild(dot);

        const lblEl = document.createElement('span');
        lblEl.textContent = lbl;
        item.appendChild(lblEl);

        legend.appendChild(item);
      });
      wrap.appendChild(legend);
    }

    return wrap;
  }

  private buildVertical(
    svg: SVGSVGElement,
    ctx: {
      data?: BarChartDataPoint[]; groups?: BarChartGroup[];
      seriesLabels?: string[]; seriesColors?: string[];
      palette: string[]; showGrid: boolean; showValues: boolean;
      xLabel?: string; yLabel?: string;
      plotW: number; plotH: number;
      LEFT: number; TOP: number; BOTTOM: number; VH: number; VW: number;
    },
  ): void {
    const { data, groups, seriesColors, palette, showGrid, showValues, xLabel, yLabel, plotW, plotH, LEFT, TOP, VH } = ctx;

    const isGrouped = !!groups?.length;

    // Gather all values for Y scale
    const allVals = isGrouped
      ? groups!.flatMap(g => g.values)
      : data!.map(d => d.value);
    const maxV  = Math.max(...allVals) || 1;
    const yTicks = 5;

    const toBarY = (v: number) => TOP + plotH - (v / maxV) * plotH;
    const barH   = (v: number) => (v / maxV) * plotH;

    // Grid
    if (showGrid) {
      for (let t = 0; t <= yTicks; t++) {
        const y = TOP + (t / yTicks) * plotH;
        svg.appendChild(svgEl('line', { x1: LEFT, y1: y, x2: LEFT + plotW, y2: y, class: 'blob-bar-chart__grid' }));
      }
    }

    // Axes
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP, x2: LEFT, y2: TOP + plotH, class: 'blob-bar-chart__axis' }));
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP + plotH, x2: LEFT + plotW, y2: TOP + plotH, class: 'blob-bar-chart__axis' }));

    // Y ticks
    for (let t = 0; t <= yTicks; t++) {
      const v = ((yTicks - t) / yTicks) * maxV;
      const y = TOP + (t / yTicks) * plotH;
      svg.appendChild(svgText(
        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0),
        { x: LEFT - 8, y: y + 4, 'text-anchor': 'end' },
        'blob-bar-chart__tick',
      ));
    }

    // Axis labels
    if (yLabel) svg.appendChild(svgText(yLabel, { x: 14, y: TOP + plotH / 2, 'text-anchor': 'middle', transform: `rotate(-90, 14, ${TOP + plotH / 2})` }, 'blob-bar-chart__label'));
    if (xLabel) svg.appendChild(svgText(xLabel, { x: LEFT + plotW / 2, y: VH - 4, 'text-anchor': 'middle' }, 'blob-bar-chart__label'));

    if (isGrouped && groups) {
      const n          = groups.length;
      const nSeries    = groups[0].values.length;
      const groupW     = plotW / n;
      const barW       = groupW * 0.7 / nSeries;
      const groupGap   = groupW * 0.3;

      groups.forEach((g, gi) => {
        const groupX = LEFT + gi * groupW + groupGap / 2;
        g.values.forEach((v, si) => {
          const color = (seriesColors?.[si]) ?? palette[si % palette.length];
          const x     = groupX + si * barW;
          const y     = toBarY(v);
          const h     = barH(v);
          const rect  = svgEl('rect', { x: x.toFixed(2), y: y.toFixed(2), width: (barW - 2).toFixed(2), height: h.toFixed(2), rx: 3, fill: color, class: 'blob-bar-chart__bar' });
          const title = document.createElementNS(SVG_NS, 'title');
          title.textContent = `${g.label}: ${v}`;
          rect.appendChild(title);
          svg.appendChild(rect);
          if (showValues && v > 0) {
            svg.appendChild(svgText(String(v), { x: x + (barW - 2) / 2, y: y - 3, 'text-anchor': 'middle' }, 'blob-bar-chart__val'));
          }
        });
        // X tick
        svg.appendChild(svgText(g.label, { x: groupX + (nSeries * barW) / 2, y: TOP + plotH + 18, 'text-anchor': 'middle' }, 'blob-bar-chart__tick'));
      });
    } else if (data) {
      const n    = data.length;
      const barW = (plotW / n) * 0.6;
      const gap  = (plotW / n) * 0.4;
      data.forEach((d, i) => {
        const color = d.color ?? palette[0];
        const x     = LEFT + i * (barW + gap) + gap / 2;
        const y     = toBarY(d.value);
        const h     = barH(d.value);
        const rect  = svgEl('rect', { x: x.toFixed(2), y: y.toFixed(2), width: barW.toFixed(2), height: h.toFixed(2), rx: 3, fill: color, class: 'blob-bar-chart__bar' });
        const title = document.createElementNS(SVG_NS, 'title');
        title.textContent = `${d.label}: ${d.value}`;
        rect.appendChild(title);
        svg.appendChild(rect);
        if (showValues && d.value > 0) {
          svg.appendChild(svgText(String(d.value), { x: x + barW / 2, y: y - 3, 'text-anchor': 'middle' }, 'blob-bar-chart__val'));
        }
        // X tick
        if (n <= 12 || i % Math.ceil(n / 10) === 0) {
          svg.appendChild(svgText(d.label, { x: x + barW / 2, y: TOP + ctx.plotH + 18, 'text-anchor': 'middle' }, 'blob-bar-chart__tick'));
        }
      });
    }
  }

  private buildHorizontal(
    svg: SVGSVGElement,
    ctx: {
      data: BarChartDataPoint[]; palette: string[];
      showGrid: boolean; showValues: boolean;
      xLabel?: string; yLabel?: string;
      plotW: number; plotH: number;
      LEFT: number; TOP: number; RIGHT: number; VH: number; VW: number;
    },
  ): void {
    const { data, palette, showGrid, showValues, xLabel, yLabel, plotW, plotH, LEFT, TOP, VH } = ctx;
    const n    = data.length;
    if (!n) return;

    const maxV   = Math.max(...data.map(d => d.value)) || 1;
    const xTicks = 5;
    const barH   = (plotH / n) * 0.6;
    const gap    = (plotH / n) * 0.4;

    // Grid (vertical lines)
    if (showGrid) {
      for (let t = 0; t <= xTicks; t++) {
        const x = LEFT + (t / xTicks) * plotW;
        svg.appendChild(svgEl('line', { x1: x, y1: TOP, x2: x, y2: TOP + plotH, class: 'blob-bar-chart__grid' }));
      }
    }

    // Axes
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP, x2: LEFT, y2: TOP + plotH, class: 'blob-bar-chart__axis' }));
    svg.appendChild(svgEl('line', { x1: LEFT, y1: TOP + plotH, x2: LEFT + plotW, y2: TOP + plotH, class: 'blob-bar-chart__axis' }));

    // X tick labels (value axis)
    for (let t = 0; t <= xTicks; t++) {
      const v = (t / xTicks) * maxV;
      const x = LEFT + (t / xTicks) * plotW;
      svg.appendChild(svgText(
        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0),
        { x, y: TOP + plotH + 18, 'text-anchor': 'middle' },
        'blob-bar-chart__tick',
      ));
    }

    // Axis labels
    if (xLabel) svg.appendChild(svgText(xLabel, { x: LEFT + plotW / 2, y: VH - 4, 'text-anchor': 'middle' }, 'blob-bar-chart__label'));
    if (yLabel) svg.appendChild(svgText(yLabel, { x: 14, y: TOP + plotH / 2, 'text-anchor': 'middle', transform: `rotate(-90, 14, ${TOP + plotH / 2})` }, 'blob-bar-chart__label'));

    // Bars
    data.forEach((d, i) => {
      const color = d.color ?? palette[0];
      const y     = TOP + i * (barH + gap) + gap / 2;
      const w     = (d.value / maxV) * plotW;
      const rect  = svgEl('rect', { x: LEFT.toFixed(2), y: y.toFixed(2), width: w.toFixed(2), height: barH.toFixed(2), rx: 3, fill: color, class: 'blob-bar-chart__bar' });
      const title = document.createElementNS(SVG_NS, 'title');
      title.textContent = `${d.label}: ${d.value}`;
      rect.appendChild(title);
      svg.appendChild(rect);

      // Category label (left side)
      svg.appendChild(svgText(d.label, { x: LEFT - 8, y: y + barH / 2 + 4, 'text-anchor': 'end' }, 'blob-bar-chart__tick'));

      // Value label (end of bar)
      if (showValues && d.value > 0) {
        svg.appendChild(svgText(String(d.value), { x: LEFT + w + 4, y: y + barH / 2 + 4, 'text-anchor': 'start' }, 'blob-bar-chart__val'));
      }
    });
  }

  public setData(data: BarChartDataPoint[]): void {
    this._opts.data   = data;
    this._opts.groups = undefined;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }

  public setGroups(groups: BarChartGroup[], seriesLabels?: string[]): void {
    this._opts.data          = undefined;
    this._opts.groups        = groups;
    this._opts.seriesLabels  = seriesLabels;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
