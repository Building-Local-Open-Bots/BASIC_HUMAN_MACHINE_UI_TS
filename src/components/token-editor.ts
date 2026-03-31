import type { widgetmeta } from './widget-meta';

export interface tokenfield {
  key: string;
  value: string;
  type: 'color' | 'text' | 'select';
  options?: string[];
}

export interface tokeneditorsection {
  title: string;
  tokens: tokenfield[];
}

export interface tokenediteroptions {
  sections?: tokeneditorsection[];
}

type ChangeCallback = (key: string, value: string) => void;

export class tokeneditor {
  static meta: widgetmeta = {
    name: 'tokeneditor',
    description: 'Visual editor for design token values grouped by section',
    category: 'tools',
    defaultOptions: {},
  };

  private container: HTMLElement;
  private changeCallbacks: ChangeCallback[] = [];

  constructor(options: tokenediteroptions = {}) {
    this.container = document.createElement('div');
    this.container.className = 'tokeneditor';
    this.container.style.cssText = 'display:flex;flex-direction:column;gap:16px;padding:8px 0;';
    if (options.sections) {
      this.setSections(options.sections);
    }
  }

  setSections(sections: tokeneditorsection[]): void {
    this.container.innerHTML = '';
    for (const section of sections) {
      this.container.appendChild(this.buildSection(section));
    }
    if (sections.length === 0 || sections.every(s => s.tokens.length === 0)) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:16px 8px;font-size:12px;color:var(--color-text-subtle,#6b7280);font-family:var(--font-human,sans-serif);text-align:center;';
      empty.textContent = 'No tokens loaded. Open a project first.';
      this.container.appendChild(empty);
    }
  }

  private buildSection(section: tokeneditorsection): HTMLElement {
    const wrap = document.createElement('div');

    const heading = document.createElement('div');
    heading.style.cssText = [
      'font-size:10px',
      'font-weight:600',
      'text-transform:uppercase',
      'letter-spacing:0.07em',
      'color:var(--color-text-subtle,#6b7280)',
      'font-family:var(--font-display,sans-serif)',
      'padding:4px 0 6px',
      'border-bottom:1px solid var(--color-border-default,#e5e7eb)',
      'margin-bottom:8px',
    ].join(';');
    heading.textContent = section.title;
    wrap.appendChild(heading);

    for (const token of section.tokens) {
      wrap.appendChild(this.buildField(token));
    }

    return wrap;
  }

  private buildField(token: tokenfield): HTMLElement {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:column;gap:2px;margin-bottom:8px;';

    const label = document.createElement('label');
    label.style.cssText = 'font-size:11px;color:var(--color-text-subtle,#6b7280);font-family:var(--font-human,sans-serif);';
    label.textContent = token.key;

    let input: HTMLElement;

    if (token.type === 'color') {
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = token.value.startsWith('#') ? token.value : '#000000';
      colorInput.style.cssText = 'width:100%;height:36px;border:1px solid var(--color-border-default,#e5e7eb);border-radius:6px;cursor:pointer;padding:2px;box-sizing:border-box;';
      colorInput.addEventListener('input', () => this.emit(token.key, colorInput.value));
      input = colorInput;
    } else if (token.type === 'select' && token.options) {
      const sel = document.createElement('select');
      sel.style.cssText = 'width:100%;padding:6px 8px;font-size:12px;border:1px solid var(--color-border-default,#e5e7eb);border-radius:6px;background:#fff;font-family:var(--font-human,sans-serif);box-sizing:border-box;';
      for (const opt of token.options) {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === token.value) option.selected = true;
        sel.appendChild(option);
      }
      sel.addEventListener('change', () => this.emit(token.key, sel.value));
      input = sel;
    } else {
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.value = String(token.value);
      textInput.style.cssText = 'width:100%;padding:6px 8px;font-size:12px;border:1px solid var(--color-border-default,#e5e7eb);border-radius:6px;font-family:var(--font-human,sans-serif);box-sizing:border-box;';
      textInput.addEventListener('change', () => this.emit(token.key, textInput.value));
      input = textInput;
    }

    row.appendChild(label);
    row.appendChild(input);
    return row;
  }

  private emit(key: string, value: string): void {
    this.changeCallbacks.forEach(cb => cb(key, value));
  }

  onChange(callback: ChangeCallback): void {
    this.changeCallbacks.push(callback);
  }

  get element(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
    this.changeCallbacks = [];
  }
}
