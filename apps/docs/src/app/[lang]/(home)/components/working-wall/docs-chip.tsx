"use client";

import {Chip} from "@blakeui/react";
import LinkRoot from "fumadocs-core/link";

interface DocsChipProps {
  /** Docs page for the tile's primary component, e.g. `/docs/react/components/slider`. */
  href: string;
  /** Primary component name shown in the chip, e.g. "Slider". */
  label: string;
}

/**
 * Floating docs link anchored to a tile's top-right corner. Hidden until the tile is
 * hovered or focus moves anywhere inside it (the `group-*` classes read the tile
 * wrapper's `group`), so it is fully keyboard-reachable: tabbing to the link reveals
 * it and shows a visible focus ring. Pointer events stay off while invisible so the
 * hidden link never swallows clicks meant for tile content.
 */
export function DocsChip({href, label}: DocsChipProps) {
  return (
    <LinkRoot
      aria-label={`${label} documentation`}
      className="pointer-events-none absolute top-3 right-3 z-10 rounded-full opacity-0 transition-opacity duration-150 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)] motion-reduce:transition-none"
      data-docs-chip=""
      href={href}
    >
      <Chip color="accent" size="sm" variant="soft">
        {label}
      </Chip>
    </LinkRoot>
  );
}
