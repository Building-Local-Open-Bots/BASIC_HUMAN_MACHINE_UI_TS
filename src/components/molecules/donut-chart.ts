/**
 * DonutChart component — blob-donut-chart
 *
 * SVG donut (or pie) chart with an optional center label and an optional
 * legend below. Uses CSS vars for all chrome; segment colors come from a
 * configurable palette that starts with `--color-primary`.
 *
 * Rendered as inline SVG inside a flex wrapper. Responsive by default.
 *
 * @example
 * ```typescript
 * const chart = new DonutChart({
 *   segments: [
 *     { label: 'TypeScript', value: 60 },
 *     { label: 'Python',     value: 25 },
 *     { label: 'Other',      value: 15 },
 *   ],
 *   centerLabel: 'Languages',
 * });
 *
 * // Pie (no hole)
 * const pie = new DonutChart({ segments: [...], donutRatio: 0 });
 *
 * // Custom colors
 * const chart = new DonutChart({
 *   segments: [
 *     { label: 'Active',   value: 73, color: '#16a34a' },
 *     { label: 'Inactive', value: 27, color: '#e5e7eb' },
 *   ],
 *   centerLabel: '73%',
 *   centerSub:   'Active',
 * });
 *
 * // Update
 * chart.setData([{ label: 'A', value: 40 }, { label: 'B', value: 60 }]);
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-donut-chart';
  style.textContent = `
    .blob-donut-chart {
      display:        flex;
      flex-direction: column;
      align-items:    center;
      gap:            1rem;
      font-family:    var(--font-human, sans-serif);
      -webkit-font-smoothing: antialiased;
    }

    .blob-donut-chart__svg-wrap {
      position: relative;
      width:    100%;
      max-width: 220px;
    }
    .blob-donut-chart__svg-wrap svg {
      display: block;
      width:   100%;
    }

    /* Center label overlay */
    .blob-donut-chart__center {
      position:  absolute;
      inset:     0;
      display:   flex;
      flex-direction: column;
      align-items:    center;
      justify-content: center;
      pointer-events: none;
    }
    .blob-donut-chart__center-label {
      font-size:   1.125rem;
      font-weight: 700;
      color:       var(--color-text-primary, #000);
      line-height: 1.2;
    }
    .blob-donut-chart__center-sub {
      font-size:  0.75rem;
      color:      var(--color-text-subtle, rgba(0,0,0,0.45));
      margin-top: 0.1rem;
    }

    /* Legend */
    .blob-donut-chart__legend {
      display:        flex;
      flex-wrap:      wrap;
      gap:            0.375rem 0.875rem;
      justify-content: center;
      font-size:      0.8125rem;
    }
    .blob-donut-chart__legend-item {
      display:     flex;
      align-items: center;
      gap:         0.375rem;
      color:       var(--color-text-default, rgba(0,0,0,0.8));
      white-space: nowrap;
    }
    .blob-donut-chart__legend-dot {
      width:         10px;
      height:        10px;
      border-radius: var(--radius-full, 9999px);
      flex-shrink:   0;
    }
    .blob-donut-chart__legend-pct {
      color:       var(--color-text-subtle, rgba(0,0,0,0.45));
      font-size:   0.75rem;
    }

    /* Tooltip via title element — native browser tooltip */
    .blob-donut-chart__segment { cursor: default; }
    .blob-donut-chart__segment:hover { opacity: 0.85; }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Default palette — starts with primary (CSS var resolved at render time via
// a fallback chain of readable colors).
// ---------------------------------------------------------------------------
const DEFAULT_PALETTE = [
  'var(--color-primary, #2563eb)',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface DonutSegment {
  label:  string;
  value:  number;
  color?: string;
}

export interface DonutChartOptions {
  segments:      DonutSegment[];
  centerLabel?:  string;
  centerSub?:    string;
  /** 0 = solid pie, 0.5 = donut (default), values 0–0.8 valid. */
  donutRatio?:   number;
  showLegend?:   boolean;
  /** Diameter of the SVG viewBox. Default: 200. */
  size?:         number;
  palette?:      string[];
}

// ---------------------------------------------------------------------------
// SVG arc helper
// ---------------------------------------------------------------------------
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

function describeSlice(cx: number, cy: number, r: number, innerR: number, startAngle: number, endAngle: number): string {
  if (innerR === 0) {
    // Solid pie slice
    const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const lg  = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${lg} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
  }
  // Donut slice
  const outerArc = describeArc(cx, cy, r, startAngle, endAngle);
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
  const ix2 = cx + innerR * Math.cos(toRad(startAngle));
  const iy2 = cy + innerR * Math.sin(toRad(startAngle));
  const ix1 = cx + innerR * Math.cos(toRad(endAngle));
  const iy1 = cy + innerR * Math.sin(toRad(endAngle));
  const lg   = endAngle - startAngle > 180 ? 1 : 0;
  return `${outerArc} L ${ix1.toFixed(3)} ${iy1.toFixed(3)} A ${innerR} ${innerR} 0 ${lg} 0 ${ix2.toFixed(3)} ${iy2.toFixed(3)} Z`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class DonutChart {
  public element: HTMLElement;
  private _opts:  DonutChartOptions;

  constructor(options: DonutChartOptions) {
    injectStyles();
    this._opts   = options;
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      segments, centerLabel, centerSub,
      donutRatio = 0.55, showLegend = true,
      size = 200, palette = DEFAULT_PALETTE,
    } = this._opts;

    const wrap = document.createElement('div');
    wrap.className = 'blob-donut-chart';

    const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
    const cx = size / 2;
    const cy = size / 2;
    const r  = size / 2 - 4; // small gap for visual breathing room
    const innerR = r * Math.max(0, Math.min(0.85, donutRatio));

    // SVG
    const svgWrap = document.createElement('div');
    svgWrap.className = 'blob-donut-chart__svg-wrap';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('aria-label', 'Donut chart');
    svg.setAttribute('role', 'img');

    // Background track (donut only)
    if (innerR > 0) {
      const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      track.setAttribute('cx', String(cx));
      track.setAttribute('cy', String(cy));
      track.setAttribute('r',  String((r + innerR) / 2));
      track.setAttribute('fill',         'none');
      track.setAttribute('stroke',       'var(--color-border, #e5e5e5)');
      track.setAttribute('stroke-width', String(r - innerR));
      svg.appendChild(track);
    }

    let angle = 0;
    segments.forEach((seg, i) => {
      const sliceDeg = (seg.value / total) * 360;
      const endAngle = angle + sliceDeg;
      const color    = seg.color ?? palette[i % palette.length];
      const path     = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d',    describeSlice(cx, cy, r, innerR, angle, endAngle - 0.3));
      path.setAttribute('fill', color);
      path.setAttribute('class', 'blob-donut-chart__segment');

      // Native title tooltip
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = `${seg.label}: ${seg.value} (${((seg.value / total) * 100).toFixed(1)}%)`;
      path.appendChild(titleEl);

      svg.appendChild(path);
      angle = endAngle;
    });

    svgWrap.appendChild(svg);

    // Center label
    if (centerLabel || centerSub) {
      const center = document.createElement('div');
      center.className = 'blob-donut-chart__center';
      if (centerLabel) {
        const lbl = document.createElement('div');
        lbl.className   = 'blob-donut-chart__center-label';
        lbl.textContent = centerLabel;
        center.appendChild(lbl);
      }
      if (centerSub) {
        const sub = document.createElement('div');
        sub.className   = 'blob-donut-chart__center-sub';
        sub.textContent = centerSub;
        center.appendChild(sub);
      }
      svgWrap.appendChild(center);
    }

    wrap.appendChild(svgWrap);

    // Legend
    if (showLegend) {
      const legend = document.createElement('div');
      legend.className = 'blob-donut-chart__legend';
      segments.forEach((seg, i) => {
        const color = seg.color ?? palette[i % palette.length];
        const item  = document.createElement('div');
        item.className = 'blob-donut-chart__legend-item';

        const dot = document.createElement('span');
        dot.className        = 'blob-donut-chart__legend-dot';
        dot.style.background = color;
        item.appendChild(dot);

        const lbl = document.createElement('span');
        lbl.textContent = seg.label;
        item.appendChild(lbl);

        const pct = document.createElement('span');
        pct.className   = 'blob-donut-chart__legend-pct';
        pct.textContent = `${((seg.value / total) * 100).toFixed(0)}%`;
        item.appendChild(pct);

        legend.appendChild(item);
      });
      wrap.appendChild(legend);
    }

    return wrap;
  }

  public setData(segments: DonutSegment[]): void {
    this._opts.segments = segments;
    const next = this.build();
    this.element.replaceWith(next);
    this.element = next;
  }
}
