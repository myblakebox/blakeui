"use client";

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

const CARDS = {
  accountMenu: AccountMenuCard,
  actionBar: ActionBarCard,
  addTags: AddTagsCard,
  appliedFilters: AppliedFiltersCard,
  contact: ContactCard,
  contactInfo: ContactInfoCard,
  fileUpload: FileUploadCard,
  inviteToProject: InviteToProjectCard,
  resetPassword: ResetPasswordCard,
} as const;

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

/** Slight vertical stagger per desktop column so the grid reads as masonry. */
const COLUMN_STAGGER = ["lg:pt-0", "lg:pt-10", "lg:pt-5"];

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

export function ComponentShowcase() {
  const breakpoint = useBreakpoint();

  return (
    <div className="flex w-full justify-center gap-6 px-2">
      {COLUMNS[breakpoint].map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`flex w-full max-w-[360px] min-w-0 flex-col gap-6 ${COLUMN_STAGGER[columnIndex] ?? ""}`}
        >
          {column.map((cardId) => {
            const CardComponent = CARDS[cardId];

            return <CardComponent key={cardId} />;
          })}
        </div>
      ))}
    </div>
  );
}
