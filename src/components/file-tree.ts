import type { widgetmeta } from './widget-meta';

export interface filetreenode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: filetreenode[];
}

export interface filetreeoptions {
  rootLabel?: string;
  files?: filetreenode[];
}

export class filetree {
  static meta: widgetmeta = {
    name: 'filetree',
    description: 'Hierarchical file/folder navigator with expand-collapse and selection',
    category: 'navigation',
    defaultOptions: { rootLabel: 'Project' },
  };

  private container: HTMLElement;
  private nodesContainer: HTMLElement;
  private selectedPath: string | null = null;
  private expandedPaths: Set<string> = new Set();
  private selectCallbacks: ((path: string) => void)[] = [];

  constructor(options: filetreeoptions = {}) {
    this.container = document.createElement('div');
    this.container.className = 'filetree';
    this.container.style.cssText = `
      font-family: var(--font-machine, monospace);
      font-size: 13px;
      user-select: none;
      overflow-y: auto;
      overflow-x: hidden;
    `;

    if (options.rootLabel) {
      const label = document.createElement('div');
      label.style.cssText = `
        padding: 6px 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-subtle, currentColor);
        opacity: 0.5;
      `;
      label.textContent = options.rootLabel;
      this.container.appendChild(label);
    }

    this.nodesContainer = document.createElement('div');
    this.container.appendChild(this.nodesContainer);

    if (options.files) {
      this.renderNodes(options.files, this.nodesContainer, 0);
    }
  }

  private renderNodes(nodes: filetreenode[], parent: HTMLElement, depth: number): void {
    for (const node of nodes) {
      if (node.type === 'folder') {
        parent.appendChild(this.createFolderRow(node, depth));
        const childContainer = document.createElement('div');
        childContainer.dataset.folderChildren = node.path;
        childContainer.style.display = this.expandedPaths.has(node.path) ? 'block' : 'none';
        if (node.children) {
          this.renderNodes(node.children, childContainer, depth + 1);
        }
        parent.appendChild(childContainer);
      } else {
        parent.appendChild(this.createFileRow(node, depth));
      }
    }
  }

  private createFolderRow(node: filetreenode, depth: number): HTMLElement {
    const row = document.createElement('div');
    row.dataset.path = node.path;
    row.dataset.type = 'folder';
    const isExpanded = this.expandedPaths.has(node.path);
    this.applyRowStyles(row, depth, false);

    const arrow = document.createElement('span');
    arrow.dataset.arrow = node.path;
    arrow.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      transition: transform 0.15s ease;
      transform: ${isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
    `;
    arrow.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2L7 5L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const name = document.createElement('span');
    name.textContent = node.name;
    name.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

    row.appendChild(arrow);
    row.appendChild(name);

    row.addEventListener('click', () => {
      const expanded = this.expandedPaths.has(node.path);
      if (expanded) {
        this.expandedPaths.delete(node.path);
        arrow.style.transform = 'rotate(0deg)';
      } else {
        this.expandedPaths.add(node.path);
        arrow.style.transform = 'rotate(90deg)';
      }
      const childContainer = this.container.querySelector(`[data-folder-children="${CSS.escape(node.path)}"]`) as HTMLElement | null;
      if (childContainer) {
        childContainer.style.display = expanded ? 'none' : 'block';
      }
    });

    return row;
  }

  private createFileRow(node: filetreenode, depth: number): HTMLElement {
    const row = document.createElement('div');
    row.dataset.path = node.path;
    row.dataset.type = 'file';
    const isSelected = this.selectedPath === node.path;
    this.applyRowStyles(row, depth, isSelected);

    const spacer = document.createElement('span');
    spacer.style.cssText = 'display: inline-block; width: 16px; flex-shrink: 0;';

    const name = document.createElement('span');
    name.textContent = node.name;
    name.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';

    row.appendChild(spacer);
    row.appendChild(name);

    row.addEventListener('click', () => {
      const prev = this.container.querySelector(`[data-path].selected`) as HTMLElement | null;
      if (prev) {
        prev.classList.remove('selected');
        this.applyRowStyles(prev, parseInt(prev.dataset.depth ?? '0'), false);
      }
      this.selectedPath = node.path;
      row.classList.add('selected');
      this.applyRowStyles(row, depth, true);
      this.selectCallbacks.forEach(cb => cb(node.path));
    });

    row.addEventListener('mouseenter', () => {
      if (this.selectedPath !== node.path) {
        row.style.backgroundColor = 'var(--color-surface-hover, rgba(0,0,0,0.05))';
      }
    });
    row.addEventListener('mouseleave', () => {
      if (this.selectedPath !== node.path) {
        row.style.backgroundColor = 'transparent';
      }
    });

    return row;
  }

  private applyRowStyles(row: HTMLElement, depth: number, selected: boolean): void {
    row.dataset.depth = String(depth);
    row.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px 3px ${8 + depth * 16}px;
      cursor: pointer;
      border-radius: 4px;
      color: ${selected ? 'var(--color-text-primary, #000)' : 'var(--color-text-default, inherit)'};
      background-color: ${selected ? 'var(--color-surface-selected, rgba(59,130,246,0.15))' : 'transparent'};
      font-weight: ${selected ? '500' : '400'};
    `;
  }

  setFiles(nodes: filetreenode[]): void {
    this.selectedPath = null;
    this.expandedPaths.clear();
    this.nodesContainer.innerHTML = '';
    this.renderNodes(nodes, this.nodesContainer, 0);
  }

  onSelect(callback: (path: string) => void): void {
    this.selectCallbacks.push(callback);
  }

  get element(): HTMLElement {
    return this.container;
  }

  destroy(): void {
    this.container.remove();
    this.selectCallbacks = [];
  }
}
