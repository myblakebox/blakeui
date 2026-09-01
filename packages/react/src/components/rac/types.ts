export type {
  Key,
  Direction,
  Orientation,
  PressEvent,
  PointerType,
  KeyboardEvent,
  HoverEvent,
  Selection,
  RangeValue,
  ValidationResult,
  RouterConfig,
} from "@react-types/shared";
export type {TimeValue, DateValue, DateRange, SortDescriptor} from "react-aria-components";
/* Sourced from react-aria-components rather than @react-types/color. Both re-export the same
   six types from react-stately, but @react-types/color@3.2.0 added a runtime dependency on
   @react-spectrum/color, which pulls the whole @adobe/react-spectrum tree — 119 MB of a
   competing design system installed into every consumer for six type aliases. */
export type {
  Color,
  ColorFormat,
  ColorSpace,
  ColorChannel,
  ColorChannelRange,
  ColorAxes,
} from "react-aria-components";
