/**
 * Widget metadata interface.
 * Add a static `meta: widgetmeta` property to every component class so the
 * webbuilder can discover and display it in the widget palette.
 *
 * @example
 * class mybutton {
 *   static meta: widgetmeta = {
 *     name: 'mybutton',
 *     description: 'A simple button',
 *     category: 'inputs',
 *   };
 * }
 */
export interface widgetmeta {
  name: string;
  description: string;
  category: string;
  defaultOptions?: Record<string, unknown>;
}
