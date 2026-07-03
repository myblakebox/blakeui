"use client";

import type {ComponentType} from "react";

import {LazyMotion, domAnimation, m, useReducedMotion} from "motion/react";

import {DocsChip} from "./docs-chip";
import {AccountMenuTile} from "./tiles/t1-account-menu";
import {PayoutThresholdTile} from "./tiles/t2-payout-threshold";
import {NotificationPreferencesTile} from "./tiles/t3-notification-preferences";
import {TimezoneTile} from "./tiles/t4-timezone";
import {FaqTile} from "./tiles/t5-faq";
import {ProfileSkeletonTile} from "./tiles/t6-profile-skeleton";

import "./working-wall.css";

interface TileConfig {
  Component: ComponentType;
  /** Docs link surfaced by the tile's floating chip (primary component of the tile). */
  chip: {href: string; label: string};
  id: string;
  /** Content width cap — complete class names so Tailwind detects them. */
  maxWidth: string;
}

/**
 * Gate order T1 → T10 (T1–T6 built). Tiles flow into the 12-col grid three-up
 * on lg (each spans 4 cols), two-up on md (span 6), one-up below (span 12).
 * Row order is balanced by eye: the tall payout tile gets the shortest
 * second-row neighbour (skeleton) in its column.
 * NOTE: Menu's docs live under the `dropdown` slug (no menu.mdx exists).
 */
const TILES: TileConfig[] = [
  {
    Component: AccountMenuTile,
    chip: {href: "/docs/react/components/dropdown", label: "Menu"},
    id: "account-menu",
    maxWidth: "max-w-[300px]",
  },
  {
    Component: PayoutThresholdTile,
    chip: {href: "/docs/react/components/slider", label: "Slider"},
    id: "payout-threshold",
    maxWidth: "max-w-[360px]",
  },
  {
    Component: NotificationPreferencesTile,
    chip: {href: "/docs/react/components/switch", label: "Switch"},
    id: "notification-preferences",
    maxWidth: "max-w-[360px]",
  },
  {
    Component: TimezoneTile,
    chip: {href: "/docs/react/components/combo-box", label: "ComboBox"},
    id: "timezone",
    maxWidth: "max-w-[360px]",
  },
  {
    Component: ProfileSkeletonTile,
    chip: {href: "/docs/react/components/skeleton", label: "Skeleton"},
    id: "profile-skeleton",
    maxWidth: "max-w-[360px]",
  },
  {
    Component: FaqTile,
    chip: {href: "/docs/react/components/accordion", label: "Accordion"},
    id: "faq",
    maxWidth: "max-w-[360px]",
  },
];

/**
 * Column offsets for the lg three-column wall — the middle column floats up ~24px,
 * the outer columns sit down ~12px (complete class names so Tailwind detects them).
 * Applied only at lg; md and mobile render flat per the locked layout decisions.
 * Tailwind v4 translate-* uses the `translate` property, so it stacks cleanly
 * with the motion-driven `transform` on the same element.
 */
const COLUMN_OFFSET = ["lg:translate-y-3", "lg:-translate-y-6", "lg:translate-y-3"];

/**
 * The homepage "Working Wall" — a bento of small, fully-functional BlakeUI
 * compositions on a muted canvas. Every tile is a real Card of real components;
 * the floating chip in each tile's corner deep-links to the component's docs.
 * Motion: one LazyMotion root, m.* only; everything collapses to instant
 * states under prefers-reduced-motion (entrance, lift, chip, thumb, badge).
 */
export function WorkingWall() {
  const reducedMotion = useReducedMotion();

  return (
    <LazyMotion strict features={domAnimation}>
      <div className="working-wall flex w-full max-w-[1200px] flex-1 flex-col py-6 lg:py-10">
        <div className="rounded-3xl bg-muted/10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid w-full grid-cols-12 items-start gap-3 text-left lg:gap-4">
            {TILES.map(({Component, chip, id, maxWidth}, index) => (
              <m.div
                key={id}
                className={`group relative col-span-12 w-full justify-self-center md:col-span-6 lg:col-span-4 ${maxWidth} ${COLUMN_OFFSET[index % 3]}`}
                data-tile=""
                initial={reducedMotion ? false : {opacity: 0, scale: 0.98, y: 12}}
                viewport={{amount: 0.2, once: true}}
                whileHover={reducedMotion ? undefined : {y: -4}}
                whileInView={reducedMotion ? undefined : {opacity: 1, scale: 1, y: 0}}
                transition={{
                  damping: 26,
                  delay: index * 0.05,
                  mass: 0.9,
                  stiffness: 320,
                  type: "spring",
                }}
              >
                <DocsChip href={chip.href} label={chip.label} />
                <Component />
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
