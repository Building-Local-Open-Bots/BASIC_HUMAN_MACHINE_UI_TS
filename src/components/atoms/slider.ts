/**
 * Slider component — blob-slider
 *
 * Range input with custom CSS styling. The track fill is updated in JS via a
 * CSS custom property (`--pct`) so there's no extra DOM element needed.
 *
 * CSS class: blob-slider
 * Sizes:     blob-slider--sm  blob-slider--md (default)  blob-slider--lg
 *
 * @example
 * ```typescript
 * const volume = new Slider({ label: 'Volume', value: 70, onChange: (v) => setVol(v) });
 * const opacity = new Slider({ min: 0, max: 1, step: 0.01, value: 0.5, showValue: true });
 *
 * volume.setValue(50);
 * console.log(volume.value); // → 50
 * ```
 */

let _stylesInjected = false;

function injectStyles(): void {
  if (_stylesInjected || typeof document === 'undefined') return;
  _stylesInjected = true;

  const style = document.createElement('style');
  style.dataset['bhmui'] = 'blob-slider';
  style.textContent = `
    .blob-slider {
      display:        flex;
      flex-direction: column;
      gap:            0.375rem;
      width:          100%;
    }

    /* Header — label + value */
    .blob-slider__header {
      display:         flex;
      justify-content: space-between;
      align-items:     baseline;
      font-family:     var(--font-human, sans-serif);
      font-size:       0.75rem;
      color:           var(--color-text-subtle, rgba(0,0,0,0.45));
    }
    .blob-slider__value {
      font-weight: 500;
      color:       var(--color-text-primary, #000);
    }

    /* Native range input — cross-browser reset + custom styling */
    .blob-slider__input {
      -webkit-appearance: none;
      appearance:   none;
      width:        100%;
      height:       6px;
      border-radius: var(--radius-full, 9999px);
      /* Two-color gradient: before thumb = primary, after = track */
      background: linear-gradient(
        to right,
        var(--color-primary, #000) 0%,
        var(--color-primary, #000) var(--pct, 0%),
        var(--color-surface-elevated, #e5e5e5) var(--pct, 0%),
        var(--color-surface-elevated, #e5e5e5) 100%
      );
      outline:      none;
      cursor:       pointer;
    }

    /* Sizes — track height */
    .blob-slider--sm .blob-slider__input { height: 4px;  }
    .blob-slider--lg .blob-slider__input { height: 8px;  }

    /* Thumb — webkit */
    .blob-slider__input::-webkit-slider-thumb {
      -webkit-appearance: none;
      width:         18px;
      height:        18px;
      border-radius: 50%;
      background:    var(--color-primary, #000);
      cursor:        pointer;
      border:        2px solid white;
      box-shadow:    0 1px 4px rgba(0,0,0,0.2);
      transition:    box-shadow 0.1s ease;
    }
    .blob-slider__input::-webkit-slider-thumb:hover {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-primary, #000) 15%, transparent);
    }

    /* Thumb — moz */
    .blob-slider__input::-moz-range-thumb {
      width:       18px;
      height:      18px;
      border-radius: 50%;
      background:  var(--color-primary, #000);
      cursor:      pointer;
      border:      2px solid white;
      box-shadow:  0 1px 4px rgba(0,0,0,0.2);
      box-sizing:  border-box;
    }

    /* Sizes — thumb */
    .blob-slider--sm .blob-slider__input::-webkit-slider-thumb { width: 14px; height: 14px; }
    .blob-slider--sm .blob-slider__input::-moz-range-thumb     { width: 14px; height: 14px; }
    .blob-slider--lg .blob-slider__input::-webkit-slider-thumb { width: 22px; height: 22px; }
    .blob-slider--lg .blob-slider__input::-moz-range-thumb     { width: 22px; height: 22px; }

    /* Focus */
    .blob-slider__input:focus-visible::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px var(--color-background, #fff),
                  0 0 0 5px var(--color-primary, #000);
    }

    /* Disabled */
    .blob-slider--disabled .blob-slider__input {
      opacity: 0.4;
      cursor:  not-allowed;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SliderSize = 'sm' | 'md' | 'lg';

export interface SliderOptions {
  value?:     number;
  min?:       number;
  max?:       number;
  step?:      number;
  label?:     string;
  /** Show the current value next to the label. */
  showValue?: boolean;
  /** Format function for the displayed value. */
  format?:    (v: number) => string;
  size?:      SliderSize;
  disabled?:  boolean;
  onChange?:  (value: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class Slider {
  public element:   HTMLElement;
  /** The native `<input type="range">`. */
  public inputEl!:  HTMLInputElement;
  private _valueEl: HTMLElement | null = null;
  private _opts:    SliderOptions;

  constructor(options: SliderOptions = {}) {
    injectStyles();
    this._opts   = { min: 0, max: 100, step: 1, value: 0, size: 'md', ...options };
    this.element = this.build();
  }

  private build(): HTMLElement {
    const {
      value = 0, min = 0, max = 100, step = 1,
      label, showValue, format, size = 'md', disabled = false,
    } = this._opts;

    const wrapper = document.createElement('div');
    wrapper.className = [
      'blob-slider',
      `blob-slider--${size}`,
      disabled ? 'blob-slider--disabled' : '',
    ].filter(Boolean).join(' ');

    // Header
    if (label || showValue) {
      const header = document.createElement('div');
      header.className = 'blob-slider__header';

      if (label) {
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        header.appendChild(labelEl);
      }

      if (showValue) {
        const valEl = document.createElement('span');
        valEl.className   = 'blob-slider__value';
        valEl.textContent = format ? format(value) : String(value);
        this._valueEl     = valEl;
        header.appendChild(valEl);
      }

      wrapper.appendChild(header);
    }

    // Range input
    const input = document.createElement('input');
    input.type      = 'range';
    input.className = 'blob-slider__input';
    input.min       = String(min);
    input.max       = String(max);
    input.step      = String(step);
    input.value     = String(value);
    input.disabled  = disabled;
    this.inputEl    = input;

    // Set initial fill percentage
    this.updateFill(input, value, min, max);

    input.addEventListener('input', () => {
      const v = Number(input.value);
      this.updateFill(input, v, min, max);
      if (this._valueEl) {
        this._valueEl.textContent = format ? format(v) : String(v);
      }
      this._opts.onChange?.(v);
    });

    wrapper.appendChild(input);

    return wrapper;
  }

  private updateFill(input: HTMLInputElement, value: number, min: number, max: number): void {
    const pct = ((value - min) / (max - min)) * 100;
    input.style.setProperty('--pct', `${pct}%`);
  }

  public get value(): number { return Number(this.inputEl?.value ?? 0); }

  public setValue(value: number): void {
    const { min = 0, max = 100, format } = this._opts;
    this.inputEl.value = String(value);
    this.updateFill(this.inputEl, value, min, max);
    if (this._valueEl) {
      this._valueEl.textContent = format ? format(value) : String(value);
    }
  }

  public setDisabled(disabled: boolean): void {
    this._opts.disabled    = disabled;
    this.inputEl.disabled  = disabled;
    this.element.classList.toggle('blob-slider--disabled', disabled);
  }
}
