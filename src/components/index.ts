/**
 * BASIC HUMAN MACHINE UI Components
 *
 * Flat re-export of every component across all tiers.
 * Import from here to stay tier-agnostic:
 *   import { Button, Card, TopNav } from '@ui/components';
 *
 * Or import from a specific tier for explicit dependencies:
 *   import { Button } from '@ui/components/atoms';
 *   import { Card }   from '@ui/components/molecules';
 *   import { TopNav } from '@ui/components/widgets';
 *
 * Tiers (from smallest to largest):
 *   atoms/     — single-purpose primitives (no BHMUI deps)
 *   molecules/ — composed components + visualizations
 *   widgets/   — full standalone feature components
 *   sections/  — (future) page-level layout sections
 */

export * from './atoms';
export * from './molecules';
export * from './widgets';
