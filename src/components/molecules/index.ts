/**
 * BHMUI Molecules — composed components built from atoms.
 * Also contains visualization components and widget-chrome bars.
 */

// Wave 1 — layout + navigation
export { ListItem, type ListItemOptions, type ListItemVariant } from './list-item';
export { Tabs, type TabsOptions, type TabItem, type TabVariant } from './tabs';
export { Dropdown, type DropdownOptions, type DropdownItemDef, type DropdownPlacement } from './dropdown';
export { Card, type CardOptions, type CardVariant, type CardFooterAlign } from './card';
export { Modal, type ModalOptions, type ModalSize, type ModalFooterAlign } from './modal';

// Wave 2 — feedback + forms
export { Alert, type AlertOptions, type AlertVariant } from './alert';
export { Toast, ToastManager, getToastManager, type ToastOptions, type ToastVariant, type ToastPosition } from './toast';
export { Select, type SelectOptions, type SelectOptionItem, type SelectOptionGroup, type SelectOptionDef, type SelectSize } from './select';
export { Accordion, type AccordionOptions, type AccordionItem } from './accordion';
export { Breadcrumb, type BreadcrumbOptions, type BreadcrumbItem } from './breadcrumb';
export { Pagination, type PaginationOptions } from './pagination';
export { EmptyState, type EmptyStateOptions } from './empty-state';
export { SearchBar, type SearchBarOptions, type SearchResultItem } from './search-bar';

// Data display
export { Table, type TableOptions, type TableColumn, type TableDensity } from './table';

// Widget chrome
export { TopBar, type TopBarOptions, type TopBarVariant } from './top-bar';
export { ActionBar, type ActionBarOptions, type ActionBarVariant, type ActionBarAlign } from './action-bar';

// Visualization
export { Sparkline, type SparklineOptions, type SparklineVariant } from './sparkline';
export { DonutChart, type DonutChartOptions, type DonutSegment } from './donut-chart';
export { LineChart, type LineChartOptions, type LineChartSeries, type LineChartPoint } from './line-chart';
export { BarChart, type BarChartOptions, type BarChartDataPoint, type BarChartGroup, type BarChartOrientation } from './bar-chart';
