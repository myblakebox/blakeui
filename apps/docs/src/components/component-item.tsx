"use client";

import type {ComponentInfo} from "../components-registry";
import type {StatusChipStatus} from "./status-chip";

import {Link} from "@blakeui/react";
import LinkRoot from "fumadocs-core/link";
import Image from "next/image";

import {cn} from "@/utils/cn";
import {CDN_URL} from "@/utils/constants";

import StatusChip from "./status-chip";

// Maps a component name (kebab, last path segment) to its local preview image
// in /public/images/components. Components missing here fall back to the CDN pair.
const COMPONENT_IMAGE_MAP: Record<string, string> = {
  accordion: "accordion.png",
  alert: "alert.png",
  "alert-dialog": "alertDialog.png",
  autocomplete: "autocomplete.png",
  avatar: "avatar.png",
  badge: "badge.png",
  breadcrumbs: "breadcrumbs.png",
  button: "button.png",
  "button-group": "buttongroup.png",
  calendar: "calendar.png",
  card: "card.png",
  checkbox: "checkbox.png",
  "checkbox-group": "checkboxGroup.png",
  chip: "chip.png",
  "close-button": "close.png",
  "color-area": "ColorArea.png",
  "color-field": "ColorField.png",
  "color-picker": "ColorPicker.png",
  "color-slider": "ColorSlider.png",
  "color-swatch": "ColorSwatch.png",
  "color-swatch-picker": "ColorSwatchPicker.png",
  "combo-box": "combobox.png",
  "date-field": "Date-Time-DateField.png",
  "date-picker": "DatePicker.png",
  "date-range-picker": "DateRangePicker.png",
  description: "description.png",
  disclosure: "disclosure.png",
  "disclosure-group": "disclosureGroup.png",
  drawer: "drawer.png",
  dropdown: "dropdown.png",
  "error-message": "errormessage.png",
  input: "input.png",
  "input-group": "inputgroup.png",
  "input-otp": "otpField.png",
  kbd: "kbd.png",
  label: "label.png",
  link: "link.png",
  "list-box": "listBox.png",
  meter: "meter.png",
  modal: "modal.png",
  "number-field": "numberfield.png",
  pagination: "pagination.png",
  popover: "popover.png",
  "progress-bar": "progressbar.png",
  "progress-circle": "progresscircle.png",
  "radio-group": "radioGroup.png",
  "range-calendar": "RangeCalendar.png",
  "scroll-shadow": "scrollShadow.png",
  "search-field": "searchfield.png",
  select: "select.png",
  separator: "separator.png",
  skeleton: "skeleton.png",
  slider: "slider.png",
  spinner: "spinner.png",
  surface: "surface.png",
  switch: "switch.png",
  table: "table.png",
  tabs: "tabs.png",
  "tag-group": "taggroup.png",
  "text-area": "textArea.png",
  "text-field": "textField.png",
  "time-field": "Date-Time-TimeField.png",
  toast: "toast.png",
  "toggle-button": "ToggleButton.png",
  "toggle-button-group": "ToggleButtonGroup.png",
  toolbar: "toolbar.png",
  tooltip: "tooltip.png",
};

function ComponentImagePair({
  alt,
  darkSrc,
  height = 594,
  lightSrc,
  width = 874,
}: {
  alt: string;
  darkSrc: string;
  height?: number;
  lightSrc: string;
  width?: number;
}) {
  return (
    <>
      <Image
        alt={alt}
        className="absolute inset-0 block h-full w-full scale-[1.01] object-cover dark:hidden"
        height={height}
        src={lightSrc}
        width={width}
      />
      <Image
        alt={alt}
        className="absolute inset-0 hidden h-full w-full scale-[1.01] object-cover dark:block"
        height={height}
        src={darkSrc}
        width={width}
      />
    </>
  );
}

function ComponentTitleContent({status, title}: {status?: StatusChipStatus; title: string}) {
  return (
    <div className="flex items-center gap-2">
      {title}
      {status ? <StatusChip className="w-fit" status={status} /> : null}
    </div>
  );
}

function ConditionalLink({
  children,
  className,
  href,
  openInNewTab,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  openInNewTab: boolean;
}) {
  const linkProps = openInNewTab
    ? {rel: "noopener noreferrer" as const, target: "_blank" as const}
    : {};

  if (openInNewTab) {
    return (
      <Link className={cn(className, "no-underline")} href={href} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <LinkRoot className={className} href={href}>
      {children}
    </LinkRoot>
  );
}

interface ComponentItemProps extends React.ComponentProps<"div"> {
  component: ComponentInfo;
  className?: string;
  imageContainerClassName?: string;
  status?: StatusChipStatus;
  openInNewTab?: boolean;
}

export function ComponentItem({
  className,
  component,
  imageContainerClassName,
  openInNewTab = false,
  status,
}: ComponentItemProps) {
  const {href, name, title} = component;
  const localImage = COMPONENT_IMAGE_MAP[name];
  // to cater chinese component title: <English> <Chinese>
  const imageName = title.toLowerCase().split(" ")[0];
  const lightSrc = `${CDN_URL}/docs/related-components/light-${imageName}.png`;
  const darkSrc = `${CDN_URL}/docs/related-components/dark-${imageName}.png`;

  return (
    <div className={cn("flex flex-col gap-[9px]", className)}>
      {/* Title first on mobile, image first on desktop */}
      <div className="order-1 sm:order-2">
        {openInNewTab ? (
          <Link className="no-underline" href={href} rel="noopener noreferrer" target="_blank">
            <ComponentTitleContent status={status} title={title} />
            <Link.Icon />
          </Link>
        ) : (
          <ConditionalLink className="link no-underline" href={href} openInNewTab={openInNewTab}>
            <ComponentTitleContent status={status} title={title} />
          </ConditionalLink>
        )}
      </div>
      <div
        className={cn(
          "relative order-2 h-[198px] overflow-hidden rounded-xl border border-separator sm:order-1",
          imageContainerClassName,
        )}
      >
        <ConditionalLink className="h-full w-full" href={href} openInNewTab={openInNewTab}>
          {localImage ? (
            <Image
              alt={title}
              className="absolute inset-0 block h-full w-full scale-[1.01] object-cover"
              height={594}
              src={`/images/components/${localImage}`}
              width={874}
            />
          ) : (
            <ComponentImagePair alt={title} darkSrc={darkSrc} lightSrc={lightSrc} />
          )}
        </ConditionalLink>
      </div>
    </div>
  );
}
