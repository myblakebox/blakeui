"use client";

import LinkRoot from "fumadocs-core/link";

interface DocsChipProps {
  /** Docs page for the card's primary component, e.g. `/docs/react/components/select`. */
  href: string;
  /** Primary component name shown in the chip, e.g. "Select". */
  label: string;
  /**
   * Card tiles anchor the chip inside the card padding; naked clusters float
   * it just above their top-right corner so it never overlaps loose content.
   */
  placement?: "card" | "naked";
  /**
   * Positioning override for cards whose top-right corner is occupied by a
   * control (close buttons, header links) — the chip must never overlap them.
   */
  offsetClassName?: string;
}

/**
 * Both placements straddle the tile's top edge (half in, half out — the naked
 * tabs chip set the reference); cards are overflow-visible so nothing clips.
 */
const PLACEMENT_CLASSES: Record<NonNullable<DocsChipProps["placement"]>, string> = {
  card: "-top-4 right-4",
  // Naked tiles have no padding cushion — mostly above, ~6px straddle.
  naked: "-top-6 right-0",
};

/**
 * Floating docs link anchored to a tile's top-right corner, styled as a white
 * outlined pill (surface bg, 1px border) so it reads as intentional UI when
 * revealed. Hidden until the tile is hovered or focus moves anywhere inside it
 * (the `group-*` classes read the tile wrapper's `group`), so it is fully
 * keyboard-reachable: tabbing to the link reveals it and shows a visible focus
 * ring. Pointer events stay off while invisible so the hidden link never
 * swallows clicks meant for tile content.
 */
export function DocsChip({href, label, offsetClassName, placement = "card"}: DocsChipProps) {
  return (
    <LinkRoot
      aria-label={`${label} documentation`}
      className={`pointer-events-none absolute ${offsetClassName ?? PLACEMENT_CLASSES[placement]} z-20 rounded-full border border-accent bg-surface px-3 py-1 text-sm font-medium text-foreground opacity-0 shadow-surface transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)] motion-reduce:transition-none`}
      data-docs-chip=""
      href={href}
    >
      {label}
    </LinkRoot>
  );
}
