/**
 * BHMUI Atoms — single-purpose UI primitives.
 * No dependencies on other BHMUI components.
 */

// Wave 0 — interaction
export { Button, type ButtonOptions, type ButtonVariant, type ButtonSize } from './button';
export { Input, type InputOptions, type InputSize, type InputType } from './input';
export { ChatInput, type ChatInputOptions } from './chat-input';
export { Tag, type TagOptions, type TagVariant, type TagSize } from './tag';
export { Switch, type SwitchOptions, type SwitchItem } from './switch';

// Wave 1 — display
export { Spinner, type SpinnerOptions, type SpinnerSize } from './spinner';
export { Divider, type DividerOptions, type DividerOrientation } from './divider';
export { Badge, type BadgeOptions, type BadgeVariant, type BadgeMode } from './badge';
export { Avatar, type AvatarOptions, type AvatarSize, type AvatarShape, type AvatarStatus } from './avatar';
export { Progress, type ProgressOptions, type ProgressSize, type ProgressVariant } from './progress';

// Wave 2 — form controls
export { Toggle, type ToggleOptions, type ToggleSize } from './toggle';
export { Checkbox, type CheckboxOptions } from './checkbox';
export { Radio, type RadioOptions } from './radio';
export { Slider, type SliderOptions, type SliderSize } from './slider';
export { Textarea, type TextareaOptions } from './textarea';
export { Tooltip, type TooltipOptions, type TooltipPlacement } from './tooltip';

// Wave 3 — typography + numeric
export { Text, type TextOptions, type TextVariant, type TextColor } from './text';
export { Counter, type CounterOptions, type CounterSize } from './counter';

// Data display primitive
export { TableCell, type TableCellOptions, type TableCellVariant, type TableCellAlign, type TableCellSortDir } from './table-cell';
