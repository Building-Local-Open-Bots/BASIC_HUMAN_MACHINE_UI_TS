# Token System (Draft)

This document captures the intended token model for BASIC_HUMAN_MACHINE_UI_TS. It is a living spec and will be refined through iterations.

## Goals
- Create a stable, product-agnostic token system.
- Keep tokens readable and maintainable by humans.
- Support theming and future expansion without breaking existing contracts.

## Token Taxonomy (Proposed)
**Foundation tokens** (raw values)
- Color
- Typography
- Spacing
- Sizing
- Radius
- Elevation
- Motion
- Opacity
- Z-index

**Semantic tokens** (meaningful roles)
- Text
- Background
- Border
- Icon
- State (hover, active, disabled, focus)

**Component tokens** (optional, later)
- Component-specific overrides built from semantic tokens.

## Naming Conventions (Proposed)
- Use dot-separated namespaces: `category.subcategory.role.state`
- Examples:
  - `color.neutral.500`
  - `text.primary.default`
  - `background.surface.hover`
  - `border.subtle.disabled`

## Token Types (Proposed)
- **Primitive**: literal values (e.g., hex, number, ms)
- **Alias**: reference to another token
- **Derived**: calculated value (if needed later)

## Theming Strategy (Proposed)
- Base theme defines all foundation tokens.
- Semantic tokens map to foundation tokens per theme.
- New themes override only foundation/semantic layers, not component tokens.

## Format (TBD)
We need to decide the authoring format:
- TS objects only
- JSON files with TS wrappers
- Hybrid (JSON for primitives, TS for composition)

## Open Questions
1. Do we want separate files per token group (e.g., `color.ts`, `type.ts`)?
2. Should aliases be enforced or allowed to resolve at runtime?
3. How strict should token validation be in early iterations?

---
Please confirm what is correct and what needs adjustment.
