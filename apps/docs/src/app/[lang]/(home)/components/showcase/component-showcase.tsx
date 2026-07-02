"use client";

import type {ComponentType} from "react";

import {LazyMotion, domAnimation, m, useReducedMotion} from "motion/react";
import {useEffect, useState} from "react";

import {AccountMenuCard} from "./cards/account-menu-card";
import {ActionBarCard} from "./cards/action-bar-card";
import {AddTagsCard} from "./cards/add-tags-card";
import {AppliedFiltersCard} from "./cards/applied-filters-card";
import {ContactCard} from "./cards/contact-card";
import {ContactInfoCard} from "./cards/contact-info-card";
import {FileUploadCard} from "./cards/file-upload-card";
import {InviteToProjectCard} from "./cards/invite-to-project-card";
import {ResetPasswordCard} from "./cards/reset-password-card";
import {DocsChip} from "./docs-chip";

import "./showcase.css";

interface CardConfig {
  Component: ComponentType;
  /** Docs link surfaced by the card's floating chip (primary component of the card). */
  chip: {href: string; label: string};
  /** CARD = elevated surface with hover lift; NAKED = loose element on the canvas. */
  kind?: "naked";
}

/**
 * NOTE: Menu's docs live under the `dropdown` slug (no menu.mdx exists);
 * every other slug matches its component docs page 1:1.
 */
const CARDS: Record<string, CardConfig> = {
  accountMenu: {
    Component: AccountMenuCard,
    chip: {href: "/docs/react/components/dropdown", label: "Menu"},
  },
  actionBar: {
    Component: ActionBarCard,
    chip: {href: "/docs/react/components/tabs", label: "Tabs"},
    kind: "naked",
  },
  addTags: {
    Component: AddTagsCard,
    chip: {href: "/docs/react/components/tag-group", label: "TagGroup"},
  },
  appliedFilters: {
    Component: AppliedFiltersCard,
    chip: {href: "/docs/react/components/tag-group", label: "TagGroup"},
  },
  contact: {
    Component: ContactCard,
    chip: {href: "/docs/react/components/fancy-button", label: "FancyButton"},
  },
  contactInfo: {
    Component: ContactInfoCard,
    chip: {href: "/docs/react/components/tooltip", label: "Tooltip"},
  },
  fileUpload: {
    Component: FileUploadCard,
    chip: {href: "/docs/react/components/progress-bar", label: "ProgressBar"},
  },
  inviteToProject: {
    Component: InviteToProjectCard,
    chip: {href: "/docs/react/components/select", label: "Select"},
  },
  resetPassword: {
    Component: ResetPasswordCard,
    chip: {href: "/docs/react/components/text-field", label: "TextField"},
  },
};

type CardId = keyof typeof CARDS;
type Breakpoint = "desktop" | "mobile" | "tablet";

/**
 * Manual column assignment per breakpoint. A three-track layout (instead of
 * CSS `columns`) keeps tab order logical — down each column, left to right —
 * and lets mobile lead with the strongest hooks once all cards exist.
 */
const COLUMNS: Record<Breakpoint, CardId[][]> = {
  desktop: [
    ["accountMenu", "actionBar", "contact", "appliedFilters"],
    ["fileUpload", "inviteToProject", "contactInfo"],
    ["resetPassword", "addTags"],
  ],
  // Reset password and file upload lead on mobile as the strongest hooks.
  mobile: [
    [
      "resetPassword",
      "fileUpload",
      "accountMenu",
      "actionBar",
      "contact",
      "appliedFilters",
      "inviteToProject",
      "contactInfo",
      "addTags",
    ],
  ],
  tablet: [
    ["accountMenu", "resetPassword", "fileUpload", "contactInfo"],
    ["inviteToProject", "addTags", "actionBar", "contact", "appliedFilters"],
  ],
};

/** Bento alignment: all three columns start flush at the same top edge. */
const COLUMN_STAGGER = ["", "", ""];

/**
 * lg: explicit asymmetric AlignUI grid — 300 / 432 / 300, centered as a unit.
 * Below lg the middle column loses its extra width and every card caps at
 * 300px (complete class strings so Tailwind detects them).
 */
const DESKTOP_COLUMN_WIDTHS = [
  "w-full max-w-[300px]",
  "w-full max-w-[432px]",
  "w-full max-w-[300px]",
];

function useBreakpoint(): Breakpoint {
  // Default to desktop so SSR/first paint matches the most common viewport.
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const tabletQuery = window.matchMedia("(min-width: 640px)");

    const update = () => {
      setBreakpoint(desktopQuery.matches ? "desktop" : tabletQuery.matches ? "tablet" : "mobile");
    };

    update();
    desktopQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);

    return () => {
      desktopQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
    };
  }, []);

  return breakpoint;
}

/**
 * Motion: one LazyMotion root, m.* only. Entrance stagger runs once per card;
 * hover lifts the card while the scoped CSS blooms its shadow. Everything
 * collapses to instant states under prefers-reduced-motion.
 */
export function ComponentShowcase() {
  const breakpoint = useBreakpoint();
  const reducedMotion = useReducedMotion();

  return (
    <LazyMotion strict features={domAnimation}>
      <div className="component-showcase flex w-full items-start justify-center gap-4 px-2">
        {COLUMNS[breakpoint].map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={`flex min-w-0 flex-col gap-3 ${
              breakpoint === "desktop"
                ? (DESKTOP_COLUMN_WIDTHS[columnIndex] ?? "w-full max-w-[300px]")
                : "w-full max-w-[300px]"
            } ${COLUMN_STAGGER[columnIndex] ?? ""}`}
          >
            {column.map((cardId, rowIndex) => {
              const {Component, chip, kind} = CARDS[cardId] as CardConfig;
              const isNaked = kind === "naked";

              return (
                <m.div
                  key={cardId}
                  className="group relative w-full"
                  data-tile=""
                  initial={reducedMotion ? false : {opacity: 0, scale: 0.98, y: 12}}
                  viewport={{amount: 0.2, once: true}}
                  whileInView={reducedMotion ? undefined : {opacity: 1, scale: 1, y: 0}}
                  // Hover lift rides its own slower tween (280ms, soft ease-out
                  // cubic) both directions; the entrance keeps the spring.
                  transition={{
                    damping: 26,
                    delay: columnIndex * 0.06 + rowIndex * 0.07,
                    mass: 0.9,
                    stiffness: 320,
                    type: "spring",
                    y: reducedMotion ? undefined : {duration: 0.28, ease: [0.33, 1, 0.68, 1]},
                  }}
                  whileHover={
                    isNaked || reducedMotion
                      ? undefined
                      : {transition: {duration: 0.28, ease: [0.33, 1, 0.68, 1]}, y: -4}
                  }
                >
                  <DocsChip
                    href={chip.href}
                    label={chip.label}
                    placement={isNaked ? "naked" : "card"}
                  />
                  <Component />
                </m.div>
              );
            })}
          </div>
        ))}
      </div>
    </LazyMotion>
  );
}
