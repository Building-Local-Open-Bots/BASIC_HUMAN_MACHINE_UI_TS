# Tasks — BHMUI (BASIC_HUMAN_MACHINE_UI_TS)

_Last updated: 2026-03-21_

> **Role**: Foundation component library for the entire BLOB ecosystem. Every blob-tool is built with BHMUI. Each tool installs BHMUI locally (not shared) so it can deploy as a standalone webserver.
>
> **Priority (2026-03-21)**: 🔴 Sprint 2 — BHMUI must be inventory-complete and convention-documented before blob-webbuilder can build on it. This is the **design system foundation sprint** — target completion 2026-03-28.

## 🔴 High Priority
- [x] UI-001 · Audit current component inventory — document what exists vs what's needed · **Done**: 2026-03-21
  - `docs/COMPONENT-INVENTORY.md` written: 5 token files documented, Sidebar documented, 12 gaps listed for webbuilder
- [x] UI-002 · Define and document component API conventions · **Done**: 2026-03-21
  - `docs/CONVENTIONS.md` written: class API shape, props naming, event callbacks, token usage, export rules, a11y
- [x] UI-005 · npm package setup — define `package.json` `exports` for clean imports · **Done**: 2026-03-21
  - `package.json` + `tsconfig.json` + `tsup.config.ts` created
  - `npm run build` ✔ — ESM + CJS + `.d.ts` all generated in `dist/`
  - Tools can now: `import { Sidebar, themeTokens } from 'bhmui'`
  - Sub-path imports: `import { themeTokens } from 'bhmui/tokens'`

## 🟡 In Progress

## 🟢 Backlog
- [ ] UI-003 · Set up Storybook or equivalent component playground · **Owner**: frontend-developer
  - Visual testing + documentation for each component
  - Runnable standalone as a webserver
- [ ] UI-004 · Theming system — support light/dark + custom brand tokens · **Owner**: frontend-developer
  - Each blob-tool can override tokens without forking the library
- [ ] UI-006 · Define MCP widget component spec · **Owner**: TBD
  - MCP widgets built with BHMUI must follow a standard interface so blob-mcp-builder can render them
  - Inputs, outputs, sizing, theming must all be standardized

## ✅ Completed
