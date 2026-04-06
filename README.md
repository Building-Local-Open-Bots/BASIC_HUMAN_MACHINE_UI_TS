# BASIC_HUMAN_MACHINE_UI_TS (BHMUI)

_Last updated: 2026-04-06_

## Purpose

BHMUI is the design-token and primitive-component library for the BLOB ecosystem. It is the **single source of truth** for all visual styling across BLOB Browser, blob-tools, and user-created projects built with the webbuilder.

## Principles

- **Source of truth**: All token definitions live here. Apps never modify their local copy.
- **No design-source coupling**: No Figma plugin exports, no build-time generation. Tokens are authored directly as TypeScript.
- **Incremental growth**: Add tokens and components only when they're actually needed. No speculative tokens.
- **Stability**: Token keys are a public contract. Rename or remove only in a deliberate breaking-change iteration.
- **Token-only styling**: Every component uses `var(--token-key)` exclusively. No hardcoded colors, fonts, or sizes anywhere.

## How it is used

Each BLOB frontend contains a **frozen snapshot copy** of BHMUI at `BASIC_HUMAN_MACHINE_UI_TS/` within its own repo. Apps update this copy manually when ready — never automatically.

All imports use the `@ui` alias: `import { applyTheme } from '@ui/tokens'`.

Full usage rules → see `.github/FRONTEND-FRAMEWORK.md` in the monorepo.

## Structure

```
docs/
  token-system.md        # Full token spec: keys, CSS vars, themes, rules
src/
  tokens/
    theme-tokens.ts      # All 6 themes — fonts, colors, radius, shadow per theme
    theme-table.csv      # Canonical list of all token keys (source of truth for which keys exist)
    color-variables.ts   # Maps CSS property names → token keys per mode (light/dark)
    color-variables-table.csv
    font-variables.ts    # Font role definitions
    scaling-tokens.ts    # Type scale + spacing scale
    device-tokens.ts     # Responsive per-device overrides
    apply-theme.ts       # The write function: resolves tokens → CSS custom properties
    index.ts
  components/
    sidebar.ts           # ✅ Primitive: sticky sidebar shell
    top-nav.ts           # ✅ Primitive: fixed top navigation bar
    file-tree.ts         # ✅ Primitive: VS Code-style file tree
    token-editor.ts      # ✅ Primitive: visual token override panel
    index.ts
  index.ts
```

## Component model

### Vocabulary

| Term | Scope | What it is |
|------|-------|-----------|
| **Token** | Layer 0 — BHMUI | Named design variable. The only valid source of styling values. |
| **Primitive** | Layer 1 — BHMUI | Single, self-contained UI element. Stateless or minimally stateful. Always token-aware. This repo. |
| **Widget** | Layer 2/3 — webbuilder | Composition of one or more primitives assembled for a specific purpose. Has exposed props the user can configure. |
| **Widget template** | Layer 2 — webbuilder | Default definition of a widget: structure, default prop values, suggested primitives. A `ComponentDefinition` JSON. |
| **Widget instance** | Layer 3 — user project | A placed widget on a page. Carries instance-level prop overrides on top of the template defaults. |

### Primitive contract

Every component in BHMUI **must**:

1. Accept a typed `props` object in its constructor
2. Expose `.element: HTMLElement`
3. Export a `meta: WidgetMeta` object describing its name, category, and prop schema
4. Reference styling only via `var(--token-key)` — no inline values, no hardcoded strings
5. Work correctly in any theme and in both light and dark mode

### Current primitives

| Primitive | Status | Notes |
|-----------|--------|-------|
| `Sidebar` | ✅ | Sticky left panel, collapsible |
| `TopNav` | ✅ | Fixed top bar, logo + links + CTA slot |
| `FileTree` | ✅ | VS Code-style expandable tree |
| `TokenEditor` | ✅ | Visual token override panel |
| `Button` | ❌ Not yet | Needed before webbuilder rebuild |
| `Input` | ❌ Not yet | |
| `Modal` | ❌ Not yet | |
| `Card` | ❌ Not yet | |
| `Badge` | ❌ Not yet | |
| `Dropdown` | ❌ Not yet | |
| `Divider` | ❌ Not yet | |

### Adding a new primitive

1. Create `src/components/{name}.ts`
2. Implement the primitive contract above
3. Add a `meta` export with name, category, and prop schema
4. Export from `src/components/index.ts`
5. Add to the primitives table in this README

## Themes

Six built-in themes. See `docs/token-system.md` for the full per-theme value table.

`classic` is the BLOB house style. It is the default theme for all BLOB products.

## Token rights

| Actor | Can do |
|-------|--------|
| BHMUI maintainer | Add/remove/rename token keys. Update default theme values. |
| Product owner | Choose which theme each BLOB product uses. Hard-codes the `applyTheme()` call. |
| End user | Override token VALUES (not keys) for their project, via `.blob/project.json → themeOverrides`. |