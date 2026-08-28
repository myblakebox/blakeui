/**
 * The interaction contract for every component in the BlakeUI React catalog.
 *
 * Derived from the completeness audit at `mcp-completeness-audit.md`. Each
 * component was scored against four criteria; any one of them makes it
 * `behavior-required`:
 *
 *   1. the CSS keys on a [data-*] attribute that only running JavaScript sets
 *   2. the keyboard map goes beyond Enter/Space on the element itself
 *   3. focus is managed across more than one element (roving, trap, restore)
 *   4. an ARIA attribute points at another node (aria-controls, aria-owns,
 *      aria-activedescendant, or aria-expanded on a different element)
 *
 * The contracts are framework-neutral on purpose: no React, no hooks, no
 * component names from any library. They describe what the DOM has to do.
 */

import type {
  AriaRule,
  BehaviorContract,
  Completeness,
  DataAttributeRule,
  KeyBinding,
  StateRule,
} from "./types";

/* -------------------------------------------------------------------------------------------------
 * Shared fragments
 *
 * Several components share the same overlay, collection, or field mechanics.
 * Expressing them once keeps the contracts consistent and honest.
 * -----------------------------------------------------------------------------------------------*/

const PLACEMENTS = ["top", "bottom", "left", "right"];

function overlayTransitionAttributes(element: string): DataAttributeRule[] {
  return [
    {
      attribute: "data-entering",
      element,
      setBy: "the overlay controller, for one frame after the overlay is inserted",
      values: ["true", "(absent)"],
      changesWhen:
        "set as the overlay mounts, removed on the next frame so the entry transition runs",
    },
    {
      attribute: "data-exiting",
      element,
      setBy: "the overlay controller, while the close transition plays",
      values: ["true", "(absent)"],
      changesWhen:
        "set when a close is requested; the element stays in the DOM until the transition ends, then is removed",
    },
  ];
}

function placementAttribute(element: string, values = PLACEMENTS): DataAttributeRule {
  return {
    attribute: "data-placement",
    element,
    setBy: "the positioning engine, after measuring the trigger and the viewport",
    values: [...values],
    changesWhen:
      "recomputed on open, on scroll, and on resize; flips to the opposite side when the preferred side does not fit",
  };
}

const OVERLAY_KEYS: KeyBinding[] = [
  {keys: ["Escape"], on: "any element inside the overlay", action: "closes the overlay"},
  {
    keys: ["Tab"],
    on: "any element inside the overlay",
    action: "moves to the next focusable element inside the overlay, wrapping at the end",
    modifiers: "Shift+Tab moves backwards and wraps at the start",
  },
];

const MODAL_FOCUS = [
  'On open, move focus into the overlay: to the element marked for initial focus, else the first focusable element, else the overlay container itself (which needs tabindex="-1").',
  "While open, contain focus: Tab and Shift+Tab must cycle within the overlay and never reach the page behind it.",
  "Content behind the overlay must be inert to pointer, keyboard, and assistive technology.",
  "On close, return focus to the element that opened the overlay — not to the document body.",
];

const NON_MODAL_FOCUS = [
  "On open, move focus into the overlay only when it was opened from the keyboard; a pointer-opened overlay leaves focus on the trigger.",
  "On close, return focus to the trigger.",
  "Tab out of the overlay closes it and continues into the page in document order.",
];

function triggerAria(element: string, popupType: string, controls: string): AriaRule {
  return {
    element,
    attributes: [
      'aria-expanded ("true" while open, "false" while closed)',
      `aria-haspopup="${popupType}"`,
      `aria-controls pointing at the id of ${controls}, while it is present in the DOM`,
    ],
  };
}

const COLLECTION_KEYS = (item: string, list: string): KeyBinding[] => [
  {keys: ["ArrowDown"], on: list, action: `moves focus to the next ${item}`},
  {keys: ["ArrowUp"], on: list, action: `moves focus to the previous ${item}`},
  {keys: ["Home"], on: list, action: `moves focus to the first ${item}`},
  {keys: ["End"], on: list, action: `moves focus to the last ${item}`},
  {keys: ["PageDown"], on: list, action: `moves focus one visible page of ${item}s forward`},
  {keys: ["PageUp"], on: list, action: `moves focus one visible page of ${item}s backward`},
  {
    keys: ["printable characters"],
    on: list,
    action: `type-ahead: jumps to the next ${item} whose text starts with the typed string; the buffer resets after roughly one second of no typing`,
  },
];

const INTERACTION_STATE_ATTRS = (element: string): DataAttributeRule[] => [
  {
    attribute: "data-hovered",
    element,
    setBy: "the pointer-interaction layer",
    values: ["true", "(absent)"],
    changesWhen: "the pointer enters or leaves; suppressed for touch so a tap does not stick",
    nativeFallback: ":hover",
  },
  {
    attribute: "data-pressed",
    element,
    setBy: "the pointer-interaction layer",
    values: ["true", "(absent)"],
    changesWhen: "a press starts and ends, including presses that leave the element and return",
    nativeFallback: ":active",
  },
  {
    attribute: "data-focus-visible",
    element,
    setBy: "the focus-visibility layer",
    values: ["true", "(absent)"],
    changesWhen: "the element takes focus from the keyboard rather than from a pointer",
    nativeFallback: ":focus-visible",
  },
  {
    attribute: "data-disabled",
    element,
    setBy: "the component, from its disabled prop",
    values: ["true", "(absent)"],
    changesWhen: "the disabled prop changes",
    nativeFallback: ":disabled",
    authorable: true,
  },
];

const VALIDATION_ATTR = (element: string): DataAttributeRule => ({
  attribute: "data-invalid",
  element,
  setBy: "the field's validation layer",
  values: ["true", "(absent)"],
  changesWhen:
    "native constraint validation or a custom validator reports an error — on submit by default, and on change once the field has been marked invalid; cleared when the value becomes valid",
});

const SLIDER_KEYS = (thumb: string, quantity: string): KeyBinding[] => [
  {keys: ["ArrowRight", "ArrowUp"], on: thumb, action: `increases ${quantity} by one step`},
  {keys: ["ArrowLeft", "ArrowDown"], on: thumb, action: `decreases ${quantity} by one step`},
  {
    keys: ["PageUp"],
    on: thumb,
    action: `increases ${quantity} by a large step (ten steps, or 10% of the range when no step is set)`,
  },
  {keys: ["PageDown"], on: thumb, action: `decreases ${quantity} by a large step`},
  {keys: ["Home"], on: thumb, action: `sets ${quantity} to the minimum`},
  {keys: ["End"], on: thumb, action: `sets ${quantity} to the maximum`},
];

const SPINBUTTON_KEYS = (input: string, quantity: string): KeyBinding[] => [
  {keys: ["ArrowUp"], on: input, action: `increments ${quantity} by one step`},
  {keys: ["ArrowDown"], on: input, action: `decrements ${quantity} by one step`},
  {keys: ["PageUp"], on: input, action: `increments ${quantity} by a large step`},
  {keys: ["PageDown"], on: input, action: `decrements ${quantity} by a large step`},
  {keys: ["Home"], on: input, action: `sets ${quantity} to the minimum, when one is defined`},
  {keys: ["End"], on: input, action: `sets ${quantity} to the maximum, when one is defined`},
];

const DATE_SEGMENT_KEYS: KeyBinding[] = [
  {
    keys: ["ArrowUp"],
    on: "the focused segment",
    action: "increments that segment, wrapping around",
  },
  {
    keys: ["ArrowDown"],
    on: "the focused segment",
    action: "decrements that segment, wrapping around",
  },
  {
    keys: ["ArrowLeft"],
    on: "any segment",
    action: "moves focus to the previous segment (reversed under right-to-left)",
  },
  {
    keys: ["ArrowRight"],
    on: "any segment",
    action: "moves focus to the next segment (reversed under right-to-left)",
  },
  {keys: ["Home"], on: "any segment", action: "moves focus to the first segment"},
  {keys: ["End"], on: "any segment", action: "moves focus to the last segment"},
  {keys: ["PageUp"], on: "the focused segment", action: "increments that segment by a large step"},
  {
    keys: ["PageDown"],
    on: "the focused segment",
    action: "decrements that segment by a large step",
  },
  {
    keys: ["0-9"],
    on: "a numeric segment",
    action:
      "types the value digit by digit and advances to the next segment once the segment cannot take another digit",
  },
  {
    keys: ["a", "p"],
    on: "the day-period segment",
    action: "selects AM or PM in locales that use a 12-hour clock",
  },
  {
    keys: ["Backspace", "Delete"],
    on: "the focused segment",
    action: "clears that segment and puts the field back into its placeholder state",
  },
];

const DATE_SEGMENT_FOCUS = [
  'The field is a single tab stop. Exactly one segment carries tabindex="0"; every other segment carries tabindex="-1".',
  'Arrow Left/Right move the tabindex="0" marker along with focus — this is a roving tabindex.',
  "Tab leaves the whole field rather than stepping between segments.",
  "Typing a complete value in one segment advances focus to the next segment automatically.",
];

const CALENDAR_KEYS: KeyBinding[] = [
  {keys: ["ArrowLeft"], on: "the focused day cell", action: "moves one day earlier"},
  {keys: ["ArrowRight"], on: "the focused day cell", action: "moves one day later"},
  {keys: ["ArrowUp"], on: "the focused day cell", action: "moves one week earlier"},
  {keys: ["ArrowDown"], on: "the focused day cell", action: "moves one week later"},
  {keys: ["Home"], on: "the focused day cell", action: "moves to the first day of the week"},
  {keys: ["End"], on: "the focused day cell", action: "moves to the last day of the week"},
  {
    keys: ["PageUp"],
    on: "the focused day cell",
    action: "moves back one month",
    modifiers: "Shift+PageUp moves back one year",
  },
  {
    keys: ["PageDown"],
    on: "the focused day cell",
    action: "moves forward one month",
    modifiers: "Shift+PageDown moves forward one year",
  },
  {keys: ["Enter", " "], on: "the focused day cell", action: "selects that date"},
];

const CALENDAR_FOCUS = [
  'The grid is a single tab stop: the focused date carries tabindex="0" and every other cell carries tabindex="-1" — a roving tabindex.',
  "Moving past the edge of the visible month advances the grid and keeps focus on the newly focused date.",
  "When the visible month changes, focus must land on a date in the new month, never be dropped to the body.",
  "Disabled and unavailable dates are still reachable by arrow keys so a keyboard user can tell why they cannot be picked.",
];

const CALENDAR_DATA = (cell: string): DataAttributeRule[] => [
  {
    attribute: "data-today",
    element: cell,
    setBy: "the calendar, comparing the cell's date to the current date in the active time zone",
    values: ["true", "(absent)"],
    changesWhen: "the rendered month changes, or the day rolls over",
  },
  {
    attribute: "data-selected",
    element: cell,
    setBy: "the calendar, from the selected value",
    values: ["true", "(absent)"],
    changesWhen: "the selection changes",
  },
  {
    attribute: "data-outside-month",
    element: cell,
    setBy: "the calendar, for padding days that belong to the neighbouring month",
    values: ["true", "(absent)"],
    changesWhen: "the rendered month changes",
  },
  {
    attribute: "data-unavailable",
    element: cell,
    setBy: "the calendar, from the availability predicate",
    values: ["true", "(absent)"],
    changesWhen:
      "the rendered month changes, or the predicate changes; distinct from disabled — an unavailable date is focusable but not selectable",
  },
];

/* -------------------------------------------------------------------------------------------------
 * Styles-sufficient entries
 *
 * The stylesheet is the whole component. Nothing sets state at runtime that the
 * CSS keys on, the keyboard map is whatever the native element already does,
 * focus stays where the browser puts it, and no ARIA attribute points anywhere.
 * -----------------------------------------------------------------------------------------------*/

function stylesSufficient(
  component: string,
  summary: string,
  dataAttributes: DataAttributeRule[] = [],
): BehaviorContract {
  return {
    component,
    completeness: "styles-sufficient",
    criteria: [],
    summary,
    aria: [],
    keyboard: [],
    focus: [],
    states: [],
    dataAttributes,
  };
}

const STYLES_SUFFICIENT: BehaviorContract[] = [
  stylesSufficient(
    "Alert",
    'A static status region. Give the root role="alert" for errors that appear after load, or role="status" for anything less urgent; everything else is markup and CSS.',
  ),
  stylesSufficient(
    "Avatar",
    "An image with a text fallback. Swapping to the fallback when the image fails is an onerror handler on the image, not something the stylesheet keys on.",
  ),
  stylesSufficient("Badge", "A positioned marker on an anchor element. Pure markup and CSS."),
  stylesSufficient(
    "Breadcrumbs",
    "A nav landmark wrapping an ordered list of links. Keyboard behaviour is the browser's link handling.",
    [
      {
        attribute: "data-current",
        element: "the last breadcrumb",
        setBy: "the author, or a router that knows which crumb is the current page",
        values: ["true", "(absent)"],
        changesWhen:
          'the current page changes; in static markup it is written once on the last item. Pair it with aria-current="page" on the same element.',
        authorable: true,
      },
    ],
  ),
  stylesSufficient(
    "Button",
    "A native button. Enter and Space activate it because it is a button, not because anything wires them up.",
    [
      {
        attribute: "data-pending",
        element: "the button",
        setBy: "the caller, from its own async state",
        values: ["true", "(absent)"],
        changesWhen:
          "the caller's pending flag changes; the component only passes it through. Also set aria-disabled and keep the accessible name stable while pending.",
        authorable: true,
      },
    ],
  ),
  stylesSufficient(
    "ButtonGroup",
    "A group wrapper. The joined corners come from :first-child / :last-child structural selectors, not from runtime state.",
  ),
  stylesSufficient("Card", "A surface with slots. Pure markup and CSS."),
  stylesSufficient(
    "CheckboxGroup",
    'A labelled group of checkboxes. Each checkbox is its own tab stop, so there is no roving tabindex and no arrow-key map. Give the wrapper role="group" and point aria-labelledby at the group label.',
  ),
  stylesSufficient("Chip", "A small static badge. Pure markup and CSS."),
  stylesSufficient("CloseButton", "A native button with an icon and an accessible name.", [
    {
      attribute: "data-pending",
      element: "the button",
      setBy: "the caller, from its own async state",
      values: ["true", "(absent)"],
      changesWhen: "the caller's pending flag changes",
      authorable: true,
    },
  ]),
  stylesSufficient(
    "ColorSwatch",
    'A presentational block filled with a colour. Give it role="img" and an aria-label naming the colour, since a colour has no text.',
  ),
  stylesSufficient(
    "Description",
    "Help text for a field. The field points at it with aria-describedby; the description itself needs an id and nothing else.",
  ),
  stylesSufficient(
    "ErrorMessage",
    "Static error text. The field points at it with aria-describedby.",
  ),
  stylesSufficient("FancyButton", "A native button with decorative layers.", [
    {
      attribute: "data-pending",
      element: "the button",
      setBy: "the caller, from its own async state",
      values: ["true", "(absent)"],
      changesWhen: "the caller's pending flag changes",
      authorable: true,
    },
  ]),
  stylesSufficient(
    "FieldError",
    "Validation text that is rendered only while the field is invalid. Deciding when to render it belongs to the field; the element itself is static.",
  ),
  stylesSufficient(
    "Fieldset",
    "A native fieldset and legend. A disabled fieldset already disables its controls without any JavaScript.",
  ),
  stylesSufficient("Kbd", "Static markup for a key cap. No stylesheet state at all."),
  stylesSufficient(
    "Label",
    "A native label. Its `for` attribute must match the control's id — that is HTML, not ARIA.",
    [
      {
        attribute: "data-required",
        element: "an ancestor of the label",
        setBy: "the field wrapper, from its required prop",
        values: ["true", "(absent)"],
        changesWhen:
          "the required prop changes; the stylesheet also accepts a plain .label--required class, so a hand-written port needs no attribute at all",
        authorable: true,
      },
      {
        attribute: "data-disabled",
        element: "an ancestor of the label",
        setBy: "the field wrapper, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: "the disabled prop changes; .label--disabled is the class equivalent",
        authorable: true,
      },
      {
        attribute: "data-invalid",
        element: "an ancestor of the label",
        setBy: "the field wrapper's validation layer",
        values: ["true", "(absent)"],
        changesWhen:
          'validation state changes; the stylesheet also matches [aria-invalid="true"] and .label--invalid, so either is enough',
        nativeFallback: "the .label--invalid class or aria-invalid on the ancestor",
        authorable: true,
      },
    ],
  ),
  stylesSufficient("Link", "A native anchor. Enter activates it because it is an anchor.", [
    {
      attribute: "data-default-icon",
      element: "the link icon",
      setBy: "the component, when it renders its own external-link icon rather than one you passed",
      values: ["true", "(absent)"],
      changesWhen: "never after render — it marks which icon is in the slot",
      authorable: true,
    },
  ]),
  stylesSufficient(
    "Meter",
    'A gauge. Give the root role="meter" with aria-valuenow/valuemin/valuemax and an accessible name; the fill width is an inline style the author computes.',
  ),
  stylesSufficient(
    "Pagination",
    "A nav landmark of links. Each link is its own tab stop and the browser handles activation.",
    [
      {
        attribute: "data-active",
        element: "the link for the current page",
        setBy: "the author, or a router",
        values: ["true", "(absent)"],
        changesWhen:
          'the current page changes; write aria-current="page" on the same element so it is announced',
        authorable: true,
      },
    ],
  ),
  stylesSufficient(
    "ProgressBar",
    'Give the root role="progressbar" with aria-valuenow/valuemin/valuemax, or omit aria-valuenow for an indeterminate bar. The fill width is an inline style.',
  ),
  stylesSufficient(
    "ProgressCircle",
    "The circular form of ProgressBar. Same roles and attributes; the arc length is an inline style on the SVG.",
  ),
  stylesSufficient(
    "Separator",
    'A divider. Give it role="separator", or aria-hidden when it is purely decorative.',
  ),
  stylesSufficient(
    "Skeleton",
    'A loading placeholder. The animation is CSS; the only decision is when to render it. Mark the region aria-busy="true" while it is showing.',
  ),
  stylesSufficient(
    "Spinner",
    'A CSS animation. Give it role="status" with an accessible name, or aria-hidden when a nearby element already announces the loading state.',
  ),
  stylesSufficient("Surface", "A background primitive other components build on. Pure CSS."),
  stylesSufficient("Typography", "Text styling. Pure CSS."),
];

/* -------------------------------------------------------------------------------------------------
 * Behavior-required entries
 * -----------------------------------------------------------------------------------------------*/

const BEHAVIOR_REQUIRED: BehaviorContract[] = [
  {
    component: "Accordion",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "aria-cross-reference"],
    summary:
      "Each item is a button that expands and collapses a panel it points at. The open/closed state has to reach both the ARIA attribute and the data attribute the stylesheet animates on.",
    missingWithoutBehavior:
      "the expand/collapse state, the trigger-to-panel ARIA wiring, and the height animation",
    aria: [
      {
        element: "the trigger",
        role: "button",
        attributes: [
          'aria-expanded ("true" while the panel is open, "false" while closed)',
          "aria-controls pointing at the panel's id",
        ],
        note: "The trigger must be wrapped in a heading element at the right level for the page outline.",
      },
      {
        element: "the panel",
        role: "region",
        attributes: ["aria-labelledby pointing at the trigger's id"],
        note: "A collapsed panel must be removed from the accessibility tree — hidden, or display:none.",
      },
    ],
    keyboard: [{keys: ["Enter", " "], on: "the trigger", action: "toggles the panel it controls"}],
    focus: [
      "Focus stays on the trigger through the toggle; it must not jump into the panel.",
      "Each trigger is its own tab stop. There is no roving tabindex.",
    ],
    activation: {
      modes: ["single (one panel at a time)", "multiple (independent panels)"],
      default: "multiple",
      note: "In single mode, opening one item closes the currently open one; the closing item still needs its exit state before its panel is removed.",
    },
    states: [
      {state: "expanded", reflectedAs: "aria-expanded + data-expanded", on: "the trigger"},
      {
        state: "panel height",
        reflectedAs: "the --disclosure-panel-height custom property",
        on: "the panel",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-expanded",
        element: "the trigger and the panel",
        setBy: "the accordion, when an item opens or closes",
        values: ["true", "(absent)"],
        changesWhen:
          "the item is toggled. The panel's height transition runs off this attribute together with --disclosure-panel-height, which must be measured and written as a pixel value — a panel left at height:auto will not animate.",
      },
      {
        attribute: "data-hide-separator",
        element: "an accordion item",
        setBy: "the author",
        values: ["true", "(absent)"],
        changesWhen: "never after render",
        authorable: true,
      },
      ...INTERACTION_STATE_ATTRS("the trigger").filter((a) => a.attribute !== "data-disabled"),
    ],
  },

  {
    component: "AlertDialog",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A modal dialog that interrupts. It traps focus, makes the rest of the page inert, closes on Escape, and returns focus to whatever opened it.",
    missingWithoutBehavior:
      "the focus trap, Escape-to-close, focus restore, and the enter/exit transitions",
    aria: [
      triggerAria("the trigger", "dialog", "the dialog"),
      {
        element: "the dialog",
        role: "alertdialog",
        attributes: [
          'aria-modal="true"',
          "aria-labelledby pointing at the title's id",
          "aria-describedby pointing at the description's id",
        ],
      },
      {
        element: "everything outside the dialog",
        attributes: ['aria-hidden="true" or the inert attribute, while the dialog is open'],
      },
    ],
    keyboard: OVERLAY_KEYS,
    focus: [
      ...MODAL_FOCUS,
      "An alert dialog should open with focus on the least destructive action, not on the confirm button.",
    ],
    activation: {
      modes: ["explicit dismissal only"],
      default: "explicit dismissal only",
      note: "Unlike a plain modal, an alert dialog must not close on an outside click — only on Escape or an explicit action.",
    },
    states: [
      {
        state: "open",
        reflectedAs: "presence in the DOM + aria-expanded on the trigger",
        on: "the dialog and its trigger",
      },
      {
        state: "entering / exiting",
        reflectedAs: "data-entering / data-exiting",
        on: "the overlay and the dialog",
      },
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the overlay backdrop and the dialog"),
      placementAttribute("the dialog", ["auto", "top", "center", "bottom"]),
      ...INTERACTION_STATE_ATTRS("the dialog's action buttons").filter((a) =>
        ["data-pressed", "data-focus-visible"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "Autocomplete",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A search field that filters a list in an overlay. Focus never leaves the input; the arrow keys move an active-descendant marker through the list instead.",
    missingWithoutBehavior:
      "the filtering, the active-descendant keyboard model, the overlay positioning, and every open/empty/placement state the stylesheet keys on",
    aria: [
      {
        element: "the input",
        role: "combobox",
        attributes: [
          "aria-expanded",
          "aria-controls pointing at the list's id",
          "aria-activedescendant pointing at the id of the currently active option, or absent when none is active",
          'aria-autocomplete="list"',
        ],
      },
      {element: "the list", role: "listbox", attributes: ["an id the input can point at"]},
      {
        element: "each option",
        role: "option",
        attributes: ["aria-selected", "a stable id"],
      },
    ],
    keyboard: [
      ...COLLECTION_KEYS("option", "the input"),
      {keys: ["Enter"], on: "the input", action: "commits the active option and closes the list"},
      {
        keys: ["Escape"],
        on: "the input",
        action: "closes the list; a second Escape clears the query",
      },
      {keys: ["Tab"], on: "the input", action: "commits the active option and moves on"},
    ],
    focus: [
      "DOM focus stays on the input for the whole interaction. The list is never focused.",
      "The active option is tracked with aria-activedescendant, not with tabindex — the option that looks focused does not have focus.",
      "The active option must be scrolled into view as the marker moves.",
      "On close, focus is already on the input; nothing needs restoring.",
    ],
    activation: {
      modes: ["manual (Enter or click commits)", "automatic (the first match is active on open)"],
      default: "manual",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded + data-open", on: "the input and the wrapper"},
      {
        state: "active option",
        reflectedAs: "aria-activedescendant + data-focused",
        on: "the input and the option",
      },
      {state: "empty selection", reflectedAs: "data-empty", on: "the wrapper"},
    ],
    dataAttributes: [
      {
        attribute: "data-open",
        element: "the wrapper and the trigger",
        setBy: "the autocomplete, from its open state",
        values: ["true", "(absent)"],
        changesWhen: "the list opens or closes",
      },
      {
        attribute: "data-empty",
        element: "the wrapper",
        setBy: "the autocomplete, from the size of the selection",
        values: ["true", "(absent)"],
        changesWhen: "the selection becomes empty or non-empty",
      },
      {
        attribute: "data-placeholder",
        element: "the value display",
        setBy: "the autocomplete, while no value has been chosen",
        values: ["true", "(absent)"],
        changesWhen: "a value is selected or cleared",
      },
      {
        attribute: "data-focus",
        element: "the field wrapper",
        setBy: "the field, while focus is anywhere inside it",
        values: ["true", "(absent)"],
        changesWhen: "focus enters or leaves the field",
        nativeFallback: ":focus (the stylesheet pairs the two, so this one degrades)",
      },
      VALIDATION_ATTR("the field wrapper"),
      ...overlayTransitionAttributes("the list overlay"),
      placementAttribute("the list overlay"),
      ...INTERACTION_STATE_ATTRS("each option"),
    ],
  },

  {
    component: "Calendar",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A date grid with a roving tabindex. Every visual state on a cell — today, selected, outside the month, unavailable — is computed from a date model that only code can hold.",
    missingWithoutBehavior:
      "the date model, the arrow-key grid navigation, the roving tabindex, and every per-cell state the stylesheet keys on",
    aria: [
      {
        element: "the grid",
        role: "grid",
        attributes: ["aria-labelledby pointing at the visible month heading"],
      },
      {element: "each week", role: "row"},
      {
        element: "each day cell",
        role: "gridcell",
        attributes: [
          "aria-selected",
          "aria-disabled for dates outside the allowed range",
          "an aria-label carrying the full, localised date",
        ],
      },
      {
        element: "the month heading",
        attributes: ['aria-live="polite" so the month change is announced'],
      },
    ],
    keyboard: CALENDAR_KEYS,
    focus: CALENDAR_FOCUS,
    activation: {
      modes: ["manual (Enter or Space selects)"],
      default: "manual",
      note: "Moving the focused date must not select it — arrowing through a calendar is browsing, not choosing.",
    },
    states: [
      {state: "focused date", reflectedAs: 'tabindex="0" + DOM focus', on: "one day cell"},
      {state: "selected date", reflectedAs: "aria-selected + data-selected", on: "a day cell"},
      {
        state: "visible month",
        reflectedAs: "the heading text and the set of rendered cells",
        on: "the grid",
      },
    ],
    dataAttributes: [
      ...CALENDAR_DATA("a day cell"),
      {
        attribute: "data-open",
        element: "the year picker",
        setBy: "the calendar header, when the year picker is toggled",
        values: ["true", "(absent)"],
        changesWhen:
          "the year picker opens or closes; it also swaps tabindex so only the visible view is reachable",
      },
      ...INTERACTION_STATE_ATTRS("a day cell"),
    ],
  },

  {
    component: "Checkbox",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "A label wrapping a visually hidden input and a styled control. Checked and indeterminate reach the stylesheet as data attributes, and indeterminate cannot be expressed in HTML at all — it is a DOM property.",
    missingWithoutBehavior: "the checked and indeterminate state the control's CSS keys on",
    aria: [
      {
        element: "the input",
        attributes: [
          "aria-describedby pointing at the description and error ids",
          "aria-invalid while the field is invalid",
        ],
        note: 'Use a real input[type=checkbox]; do not rebuild it with role="checkbox" on a div.',
      },
      {element: "the styled control", attributes: ['aria-hidden="true"']},
    ],
    keyboard: [{keys: [" "], on: "the input", action: "toggles the checkbox"}],
    focus: [
      "Focus lands on the visually hidden input, not on the label root. Keep the input in the layout (opacity/clip, not display:none) so it stays focusable.",
      "Because focus is on a descendant, a focus ring on the label root has to be written as :has(:focus-visible) — :focus-visible does not propagate to ancestors.",
    ],
    states: [
      {
        state: "checked",
        reflectedAs: "the input's checked property + data-selected",
        on: "the input and the label root",
      },
      {
        state: "indeterminate",
        reflectedAs: "the input's indeterminate DOM property + data-indeterminate",
        on: "the input and the label root",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "the label root",
        setBy: "the checkbox, mirroring the input's checked state",
        values: ["true", "(absent)"],
        changesWhen:
          'the checkbox is toggled. The stylesheet also matches [aria-checked="true"], so either attribute will drive the indicator.',
      },
      {
        attribute: "data-indeterminate",
        element: "the label root",
        setBy: "the checkbox, from its indeterminate prop",
        values: ["true", "(absent)"],
        changesWhen:
          "the indeterminate prop changes. There is no HTML attribute for this — it must be assigned to the input's `indeterminate` DOM property from script.",
      },
      VALIDATION_ATTR("the label root"),
      ...INTERACTION_STATE_ATTRS("the label root"),
    ],
  },

  {
    component: "ColorArea",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A two-dimensional colour picker. Two range inputs behind one thumb, arrow keys on both axes, and a dragging state the stylesheet keys on.",
    missingWithoutBehavior: "the two-axis keyboard map, the drag handling, and the dragging state",
    aria: [
      {element: "the area", role: "group", attributes: ["an accessible name"]},
      {
        element: "each hidden input",
        role: "slider",
        attributes: [
          "aria-label naming its channel",
          "aria-valuetext carrying the channel value in a form a screen reader can read",
        ],
      },
      {
        element: "the thumb",
        attributes: ["aria-hidden is wrong here — the thumb holds the inputs"],
      },
    ],
    keyboard: [
      {
        keys: ["ArrowLeft", "ArrowRight"],
        on: "the thumb",
        action: "moves along the horizontal channel by one step",
      },
      {
        keys: ["ArrowUp", "ArrowDown"],
        on: "the thumb",
        action: "moves along the vertical channel by one step",
      },
      {
        keys: ["PageUp", "PageDown"],
        on: "the thumb",
        action: "moves the vertical channel by a large step",
      },
      {
        keys: ["Home", "End"],
        on: "the thumb",
        action: "jumps the horizontal channel to its minimum or maximum",
      },
    ],
    focus: [
      "The thumb contains two inputs, one per channel. Focus moves between them with Tab, and both must be reachable.",
      "A pointer drag must not move focus away from the thumb.",
      "Pointer capture has to be released on pointerup even if the pointer left the area.",
    ],
    states: [
      {state: "dragging", reflectedAs: "data-dragging", on: "the thumb"},
      {state: "thumb position", reflectedAs: "inline left/top percentages", on: "the thumb"},
    ],
    dataAttributes: [
      {
        attribute: "data-dragging",
        element: "the thumb",
        setBy: "the drag handler",
        values: ["true", "(absent)"],
        changesWhen: "a pointer press starts and ends on the thumb or the area",
      },
      {
        attribute: "data-focus-visible",
        element: "the thumb",
        setBy: "the focus-visibility layer",
        values: ["true", "(absent)"],
        changesWhen:
          "an inner input takes focus from the keyboard. The stylesheet uses this attribute alone here, with no :focus-visible arm, so a port that skips it paints no ring.",
      },
      {
        attribute: "data-disabled",
        element: "the area and the thumb",
        setBy: "the component, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: "the disabled prop changes",
        authorable: true,
      },
    ],
  },

  {
    component: "ColorField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard"],
    summary:
      "A text input that parses colour values and steps them with the arrow keys. The keyboard map is a spin button's, not a text field's.",
    missingWithoutBehavior: "the arrow-key stepping, the colour parsing, and the validation state",
    aria: [
      {
        element: "the input",
        attributes: [
          "aria-describedby pointing at the description and error ids",
          "aria-invalid while the value cannot be parsed",
        ],
      },
    ],
    keyboard: [
      ...SPINBUTTON_KEYS("the input", "the colour channel"),
      {keys: ["Enter"], on: "the input", action: "commits the typed value"},
    ],
    focus: [
      "One tab stop. On blur the typed text is re-formatted to the canonical colour string, and focus must not move as a result.",
    ],
    states: [
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the field wrapper"},
    ],
    dataAttributes: [VALIDATION_ATTR("the field wrapper and the input")],
  },

  {
    component: "ColorPicker",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A swatch trigger that opens a dialog of colour controls. The overlay half is a popover: positioning, focus, dismissal.",
    missingWithoutBehavior:
      "the overlay positioning, dismissal, focus restore, and transition states",
    aria: [
      triggerAria("the swatch trigger", "dialog", "the colour dialog"),
      {element: "the dialog", role: "dialog", attributes: ["an accessible name"]},
    ],
    keyboard: OVERLAY_KEYS,
    focus: NON_MODAL_FOCUS,
    activation: {
      modes: ["click or Enter/Space on the trigger"],
      default: "click or Enter/Space on the trigger",
    },
    states: [
      {
        state: "open",
        reflectedAs: "aria-expanded on the trigger + the overlay's presence",
        on: "the trigger",
      },
      {state: "entering / exiting", reflectedAs: "data-entering / data-exiting", on: "the overlay"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the colour dialog overlay"),
      placementAttribute("the colour dialog overlay"),
      ...INTERACTION_STATE_ATTRS("the trigger").filter((a) =>
        ["data-focus-visible", "data-disabled"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "ColorSlider",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard"],
    summary:
      "A single-channel colour slider. Arrow, Page and Home/End all move the value, and the focus ring is painted from a data attribute with no pseudo-class fallback.",
    missingWithoutBehavior: "the slider keyboard map, the drag handling, and the focus ring",
    aria: [
      {
        element: "the hidden input",
        role: "slider",
        attributes: [
          "aria-label naming the channel",
          "aria-valuetext carrying a readable channel value",
          "aria-orientation for a vertical slider",
        ],
      },
      {element: "the track and the gradient", attributes: ['aria-hidden="true"']},
    ],
    keyboard: SLIDER_KEYS("the thumb", "the channel value"),
    focus: [
      "Focus lands on the hidden range input inside the thumb.",
      "The ring is painted from data-focus-visible on the thumb with no :focus-visible arm in the same rule, so a CSS-only port must add one.",
      "A drag keeps focus on the thumb and captures the pointer until pointerup.",
    ],
    states: [
      {state: "dragging", reflectedAs: "data-dragging", on: "the thumb"},
      {state: "value", reflectedAs: "an inline offset percentage", on: "the thumb"},
    ],
    dataAttributes: [
      {
        attribute: "data-dragging",
        element: "the thumb",
        setBy: "the drag handler",
        values: ["true", "(absent)"],
        changesWhen: "a pointer press starts and ends",
      },
      {
        attribute: "data-focus-visible",
        element: "the thumb",
        setBy: "the focus-visibility layer",
        values: ["true", "(absent)"],
        changesWhen:
          "the inner input takes focus from the keyboard; no pseudo-class fallback in this stylesheet",
      },
      {
        attribute: "data-disabled",
        element: "the slider root and the thumb",
        setBy: "the component, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: "the disabled prop changes",
        authorable: true,
      },
      {
        attribute: "data-orientation",
        element: "the slider root",
        setBy: "the author, from the orientation prop",
        values: ["horizontal", "vertical"],
        changesWhen: "never after render",
        authorable: true,
      },
    ],
  },

  {
    component: "ColorSwatchPicker",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A grid of swatches with a roving tabindex. One of its attributes is computed from the colour itself, which no static markup can know.",
    missingWithoutBehavior:
      "the roving tabindex, the arrow-key navigation, and the computed contrast attribute",
    aria: [
      {element: "the container", role: "listbox", attributes: ["an accessible name"]},
      {
        element: "each swatch",
        role: "option",
        attributes: ["aria-selected", "an aria-label naming the colour"],
      },
    ],
    keyboard: [
      {keys: ["ArrowRight", "ArrowLeft"], on: "a swatch", action: "moves focus along the row"},
      {keys: ["ArrowUp", "ArrowDown"], on: "a swatch", action: "moves focus between rows"},
      {keys: ["Home", "End"], on: "a swatch", action: "moves focus to the first or last swatch"},
      {keys: ["Enter", " "], on: "a swatch", action: "selects that colour"},
    ],
    focus: [
      'The picker is a single tab stop: the selected swatch carries tabindex="0", every other swatch tabindex="-1" — a roving tabindex.',
      'When the selection changes, the tabindex="0" marker moves with it.',
    ],
    activation: {
      modes: ["manual (Enter, Space, or click selects)"],
      default: "manual",
    },
    states: [
      {state: "selected", reflectedAs: "aria-selected + data-selected", on: "a swatch"},
      {state: "light colour", reflectedAs: "data-light-color", on: "a swatch"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "a swatch",
        setBy: "the picker, from the selected colour",
        values: ["true", "(absent)"],
        changesWhen: "the selection changes",
      },
      {
        attribute: "data-light-color",
        element: "a swatch",
        setBy: "the picker, after computing the swatch colour's luminance",
        values: ["true", "(absent)"],
        changesWhen:
          "the swatch colour changes. It flips the checkmark to a dark ink so the indicator stays visible on pale swatches — a port has to compute luminance itself.",
      },
      {
        attribute: "data-disabled",
        element: "a swatch",
        setBy: "the picker, from the disabled set",
        values: ["true", "(absent)"],
        changesWhen: "the disabled set changes",
        authorable: true,
      },
    ],
  },

  {
    component: "ComboBox",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "An editable input with a popup list. Focus stays on the input; the arrow keys move an active-descendant marker; the popup is positioned at runtime.",
    missingWithoutBehavior:
      "the active-descendant keyboard model, the open state, the filtering, and the popup positioning",
    aria: [
      {
        element: "the input",
        role: "combobox",
        attributes: [
          "aria-expanded",
          "aria-controls pointing at the list's id",
          "aria-activedescendant pointing at the active option's id",
          'aria-autocomplete ("list" or "both")',
        ],
      },
      {
        element: "the trigger button",
        attributes: [
          'aria-haspopup="listbox"',
          "aria-expanded",
          'tabindex="-1" so it is not a second tab stop',
        ],
      },
      {element: "the list", role: "listbox", attributes: ["an id the input points at"]},
      {element: "each option", role: "option", attributes: ["aria-selected", "a stable id"]},
    ],
    keyboard: [
      ...COLLECTION_KEYS("option", "the input"),
      {
        keys: ["ArrowDown"],
        on: "the closed input",
        action: "opens the list and activates the first option",
      },
      {
        keys: ["Alt+ArrowDown"],
        on: "the input",
        action: "opens the list without changing the active option",
      },
      {keys: ["Alt+ArrowUp"], on: "the open input", action: "closes the list"},
      {keys: ["Enter"], on: "the input", action: "commits the active option"},
      {
        keys: ["Escape"],
        on: "the input",
        action: "closes the list and reverts the input to the committed value",
      },
      {keys: ["Tab"], on: "the input", action: "commits the active option and leaves the field"},
    ],
    focus: [
      "DOM focus never leaves the input. Options are highlighted through aria-activedescendant.",
      "The trigger button must not be a tab stop — the input is the single tab stop for the whole control.",
      "The active option is scrolled into view as the marker moves.",
    ],
    activation: {
      modes: [
        "manual (Enter, Tab, or click commits)",
        "automatic (first match becomes active as you type)",
      ],
      default: "manual",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded + data-open", on: "the input and the trigger"},
      {state: "active option", reflectedAs: "aria-activedescendant", on: "the input"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the field wrapper"},
    ],
    dataAttributes: [
      {
        attribute: "data-open",
        element: "the field wrapper and the trigger",
        setBy: "the combo box, from its open state",
        values: ["true", "(absent)"],
        changesWhen: "the list opens or closes; it also rotates the trigger icon",
      },
      {
        attribute: "data-focus",
        element: "the field wrapper",
        setBy: "the field, while focus is inside",
        values: ["true", "(absent)"],
        changesWhen: "focus enters or leaves",
        nativeFallback: ":focus (paired in the stylesheet)",
      },
      VALIDATION_ATTR("the field wrapper"),
      ...overlayTransitionAttributes("the list popup"),
      placementAttribute("the list popup"),
      ...INTERACTION_STATE_ATTRS("each option"),
    ],
  },

  {
    component: "DateField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A date split into editable segments. One tab stop, a roving tabindex between segments, and a full arrow/digit keyboard map.",
    missingWithoutBehavior:
      "the segment keyboard map, the roving tabindex, and the validation state",
    aria: [
      {element: "the field", role: "group", attributes: ["aria-labelledby pointing at the label"]},
      {
        element: "each segment",
        role: "spinbutton",
        attributes: [
          "aria-valuenow, aria-valuemin, aria-valuemax",
          "aria-valuetext for the placeholder and for named months",
          'aria-label naming the segment ("month", "day", "year")',
        ],
      },
      {
        element: "a hidden input",
        attributes: ["the ISO value, so the field submits with a form"],
      },
    ],
    keyboard: DATE_SEGMENT_KEYS,
    focus: DATE_SEGMENT_FOCUS,
    states: [
      {state: "segment value", reflectedAs: "aria-valuenow + the segment's text", on: "a segment"},
      {state: "placeholder", reflectedAs: "data-placeholder", on: "an unfilled segment"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the field wrapper"},
    ],
    dataAttributes: [VALIDATION_ATTR("the field wrapper and the segment group")],
  },

  {
    component: "DatePicker",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A segmented date field plus a calendar in a popover. Both halves are behaviour: the segment keyboard map and the overlay's focus and positioning.",
    missingWithoutBehavior:
      "the segment keyboard map, the calendar grid navigation, the overlay focus handling, and the placement states",
    aria: [
      {element: "the field", role: "group", attributes: ["aria-labelledby pointing at the label"]},
      triggerAria("the calendar button", "dialog", "the calendar dialog"),
      {element: "the popover", role: "dialog", attributes: ["an accessible name"]},
      {
        element: "each segment",
        role: "spinbutton",
        attributes: ["aria-valuenow / valuemin / valuemax", "aria-valuetext", "aria-label"],
      },
    ],
    keyboard: [
      ...DATE_SEGMENT_KEYS,
      ...CALENDAR_KEYS.map((k) => ({...k, on: `${k.on} (inside the popover)`})),
      {
        keys: ["Escape"],
        on: "the popover",
        action: "closes the calendar and returns focus to the trigger",
      },
    ],
    focus: [
      ...DATE_SEGMENT_FOCUS,
      ...NON_MODAL_FOCUS,
      "Opening the calendar moves focus to the currently selected date, or to today when nothing is selected.",
      ...CALENDAR_FOCUS,
    ],
    activation: {
      modes: ["manual (Enter or Space on a date selects and closes)"],
      default: "manual",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded on the trigger", on: "the calendar button"},
      {state: "entering / exiting", reflectedAs: "data-entering / data-exiting", on: "the popover"},
      {state: "selected date", reflectedAs: "aria-selected + data-selected", on: "a day cell"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the calendar popover"),
      placementAttribute("the calendar popover"),
      ...CALENDAR_DATA("a day cell inside the popover"),
      ...INTERACTION_STATE_ATTRS("the calendar button").filter((a) =>
        ["data-focus-visible", "data-disabled"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "DateRangePicker",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "Two segmented date fields plus a range calendar in a popover. Adds range anchoring on top of everything DatePicker does.",
    missingWithoutBehavior:
      "the segment keyboard map, the range anchoring, the overlay focus handling, and the range boundary states",
    aria: [
      {
        element: "the field",
        role: "group",
        attributes: ["aria-labelledby pointing at the label"],
        note: "The start and end halves are each their own group with their own accessible name.",
      },
      triggerAria("the calendar button", "dialog", "the calendar dialog"),
      {
        element: "each segment",
        role: "spinbutton",
        attributes: ["aria-valuenow / valuemin / valuemax", "aria-valuetext", "aria-label"],
      },
    ],
    keyboard: [
      ...DATE_SEGMENT_KEYS,
      ...CALENDAR_KEYS.map((k) => ({...k, on: `${k.on} (inside the popover)`})),
      {
        keys: ["Enter", " "],
        on: "a day cell",
        action:
          "first press anchors the range start, second press commits the end; while anchored, moving focus previews the range",
      },
      {keys: ["Escape"], on: "the popover", action: "cancels an in-progress range and closes"},
    ],
    focus: [
      ...DATE_SEGMENT_FOCUS,
      ...NON_MODAL_FOCUS,
      "Tab moves from the start field to the end field to the calendar button — three tab stops, each with its own roving segment set.",
      ...CALENDAR_FOCUS,
    ],
    activation: {
      modes: ["manual, two-step (anchor then commit)"],
      default: "manual, two-step (anchor then commit)",
    },
    states: [
      {state: "range anchor", reflectedAs: "data-selection-start", on: "a day cell"},
      {state: "range end", reflectedAs: "data-selection-end", on: "a day cell"},
      {state: "entering / exiting", reflectedAs: "data-entering / data-exiting", on: "the popover"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the calendar popover"),
      placementAttribute("the calendar popover"),
      ...CALENDAR_DATA("a day cell inside the popover"),
      {
        attribute: "data-selection-start",
        element: "the first day cell of the range",
        setBy: "the range calendar",
        values: ["true", "(absent)"],
        changesWhen: "the range is anchored or moved; it rounds the leading edge of the highlight",
      },
      {
        attribute: "data-selection-end",
        element: "the last day cell of the range",
        setBy: "the range calendar",
        values: ["true", "(absent)"],
        changesWhen: "the range is committed or previewed; it rounds the trailing edge",
      },
    ],
  },

  {
    component: "Drawer",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A modal panel that slides in from an edge. Focus trap, Escape, focus restore, and a slide transition driven from data attributes that also decide which edge it comes from.",
    missingWithoutBehavior:
      "the focus trap, Escape-to-close, focus restore, and the enter/exit slide states",
    aria: [
      triggerAria("the trigger", "dialog", "the drawer"),
      {
        element: "the drawer",
        role: "dialog",
        attributes: ['aria-modal="true"', "aria-labelledby pointing at the title"],
      },
      {element: "the backdrop", attributes: ['aria-hidden="true"']},
      {element: "the drag handle", attributes: ['aria-hidden="true" when it is decorative']},
    ],
    keyboard: OVERLAY_KEYS,
    focus: MODAL_FOCUS,
    activation: {
      modes: ["dismiss on Escape, backdrop click, or an explicit close"],
      default: "dismiss on Escape, backdrop click, or an explicit close",
    },
    states: [
      {
        state: "open",
        reflectedAs: "presence in the DOM + aria-expanded on the trigger",
        on: "the drawer",
      },
      {state: "edge", reflectedAs: "data-placement", on: "the drawer content"},
      {
        state: "entering / exiting",
        reflectedAs: "data-entering / data-exiting",
        on: "the backdrop and the panel",
      },
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the backdrop and the drawer panel"),
      {
        attribute: "data-placement",
        element: "the drawer content",
        setBy: "the author, from the placement prop",
        values: ["top", "bottom", "left", "right"],
        changesWhen:
          "never after render, but it selects which translate the enter/exit transition uses, so the transition breaks without it",
        authorable: true,
      },
      ...INTERACTION_STATE_ATTRS("the close button").filter((a) =>
        ["data-pressed", "data-focus-visible"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "Dropdown",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A button that opens a menu, optionally with submenus. Roving focus through the items, type-ahead, Escape, focus restore, and runtime positioning.",
    missingWithoutBehavior:
      "the menu keyboard map, focus movement into and out of the menu, submenu handling, and the placement states",
    aria: [
      triggerAria("the trigger", "menu", "the menu"),
      {element: "the menu", role: "menu", attributes: ["aria-labelledby pointing at the trigger"]},
      {
        element: "each item",
        role: "menuitem, menuitemcheckbox, or menuitemradio",
        attributes: ["aria-checked on checkbox and radio items", "aria-disabled on disabled items"],
      },
      {
        element: "a submenu trigger",
        attributes: [
          'aria-haspopup="menu"',
          "aria-expanded",
          "aria-controls pointing at the submenu",
        ],
      },
      {element: "a section", role: "group", attributes: ["aria-labelledby pointing at its header"]},
    ],
    keyboard: [
      {
        keys: ["ArrowDown", "ArrowUp"],
        on: "the trigger",
        action: "opens the menu and focuses the first or last item",
      },
      {
        keys: ["Enter", " "],
        on: "the trigger",
        action: "opens the menu and focuses the first item",
      },
      {keys: ["ArrowDown"], on: "an item", action: "moves to the next item, wrapping at the end"},
      {
        keys: ["ArrowUp"],
        on: "an item",
        action: "moves to the previous item, wrapping at the start",
      },
      {keys: ["Home", "End"], on: "an item", action: "moves to the first or last item"},
      {
        keys: ["printable characters"],
        on: "an item",
        action: "type-ahead to the next item whose label starts with the typed string",
      },
      {
        keys: ["ArrowRight"],
        on: "a submenu trigger",
        action: "opens the submenu and focuses its first item",
      },
      {
        keys: ["ArrowLeft"],
        on: "an item in a submenu",
        action: "closes the submenu and returns focus to its trigger",
      },
      {keys: ["Enter", " "], on: "an item", action: "activates it and closes the whole menu"},
      {
        keys: ["Escape"],
        on: "the menu",
        action: "closes the menu and returns focus to the trigger",
      },
      {keys: ["Tab"], on: "the menu", action: "closes the menu and continues into the page"},
    ],
    focus: [
      "Opening moves DOM focus into the menu; the menu is not an aria-activedescendant widget.",
      'The menu is one tab stop: the focused item carries tabindex="0" and the rest tabindex="-1" — a roving tabindex.',
      "Disabled items are skipped by arrow navigation.",
      "Closing returns focus to the trigger, including when the menu was closed by activating an item.",
      "A submenu keeps its parent menu open and returns focus to the submenu trigger when it closes.",
    ],
    activation: {
      modes: ["manual (Enter, Space, or click activates)"],
      default: "manual",
      note: "Moving through items must not activate them.",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded on the trigger", on: "the trigger"},
      {state: "focused item", reflectedAs: 'DOM focus + tabindex="0"', on: "one item"},
      {state: "checked item", reflectedAs: "aria-checked", on: "a checkbox or radio item"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the menu popover"),
      placementAttribute("the menu popover"),
      {
        attribute: "data-pending",
        element: "the trigger",
        setBy: "the caller, from its own async state",
        values: ["true", "(absent)"],
        changesWhen: "the caller's pending flag changes",
        authorable: true,
      },
      {
        attribute: "data-selection-mode",
        element: "the menu",
        setBy: "the author, from the selection mode",
        values: ["none", "single", "multiple"],
        changesWhen: "never after render; it reserves the indicator column",
        authorable: true,
      },
    ],
  },

  {
    component: "Form",
    completeness: "behavior-required",
    criteria: ["focus-management"],
    summary:
      "A form that runs validation and moves focus to the first field that failed. It ships no stylesheet at all — everything it contributes is behaviour.",
    missingWithoutBehavior: "validation orchestration and moving focus to the first invalid field",
    aria: [
      {
        element: "the form",
        attributes: ["aria-labelledby pointing at the form's heading, when it has one"],
      },
      {
        element: "an error summary, if you render one",
        role: "alert",
        attributes: ['aria-live="assertive"'],
      },
    ],
    keyboard: [
      {
        keys: ["Enter"],
        on: "a single-line field",
        action: "submits the form, unless the field opts out",
      },
    ],
    focus: [
      "On a failed submit, move focus to the first invalid field in document order — the browser does this for native validation, and a custom validator must do it explicitly.",
      "Do not move focus on a successful submit.",
      "When a field's error is announced, the error element must already exist and be referenced by aria-describedby before focus lands.",
    ],
    activation: {
      modes: ["native validation", 'custom validation (validationBehavior="aria")'],
      default: "native validation",
      note: "Under native validation the browser blocks submit and shows its own bubble; under aria validation the form submits nothing and you render the errors yourself.",
    },
    states: [
      {
        state: "invalid field",
        reflectedAs: "aria-invalid + data-invalid",
        on: "each failing field",
      },
      {state: "submitted", reflectedAs: "whatever your app renders", on: "the form"},
    ],
    dataAttributes: [],
  },

  {
    component: "Input",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "A native text input. Its invalid styling is keyed on a data attribute that only a validation layer sets — nothing in the stylesheet reads :invalid.",
    missingWithoutBehavior: "the invalid state the stylesheet keys on",
    aria: [
      {
        element: "the input",
        attributes: [
          "aria-describedby pointing at the description and error ids",
          "aria-invalid while the value fails validation",
        ],
      },
    ],
    keyboard: [],
    focus: ["One tab stop. The browser handles caret movement and selection."],
    states: [{state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the input"}],
    dataAttributes: [
      {
        ...VALIDATION_ATTR("the input"),
        changesWhen:
          "validation state changes. The stylesheet has no :invalid or :user-invalid arm, so a CSS-only port paints no invalid ring unless it adds one.",
      },
      ...INTERACTION_STATE_ATTRS("the input"),
      {
        attribute: "data-focused",
        element: "the input",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "the input takes or loses focus by any means",
        nativeFallback: ":focus",
      },
    ],
  },

  {
    component: "InputGroup",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "An input with prefix and suffix affordances sharing one border. The group's invalid and disabled rings are keyed on data attributes set from the field's validation state.",
    missingWithoutBehavior: "the invalid and disabled ring the group's CSS keys on",
    aria: [
      {
        element: "the group",
        role: "group",
        attributes: ["aria-labelledby pointing at the label"],
        note: "Prefix and suffix content that is purely decorative must be aria-hidden so it is not read as part of the value.",
      },
      {element: "the input", attributes: ["aria-describedby", "aria-invalid"]},
    ],
    keyboard: [],
    focus: [
      "The group is not focusable — the input inside it is. The group's ring is painted from :focus-within (and data-focus-within), not from :focus.",
    ],
    states: [
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the group"},
      {state: "disabled", reflectedAs: "aria-disabled + data-disabled", on: "the group"},
    ],
    dataAttributes: [
      VALIDATION_ATTR("the group and the input"),
      {
        attribute: "data-disabled",
        element: "the group",
        setBy: "the field, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen:
          'the disabled prop changes. The stylesheet pairs it with [aria-disabled="true"], so setting either is enough.',
        nativeFallback: '[aria-disabled="true"]',
        authorable: true,
      },
      {
        attribute: "data-focus-within",
        element: "the group",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "focus enters or leaves any descendant",
        nativeFallback: ":focus-within",
      },
    ],
  },

  {
    component: "InputOTP",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "One real input behind a row of fake slots. Which slot looks active, which look filled, and where the caret appears are all computed per keystroke.",
    missingWithoutBehavior:
      "the caret tracking, the per-slot active and filled states, and paste handling",
    aria: [
      {
        element: "the real input",
        attributes: [
          "an accessible name",
          'inputmode="numeric" and autocomplete="one-time-code" so platforms offer the code',
          "aria-describedby pointing at the description and error ids",
        ],
      },
      {
        element: "the slot row",
        attributes: ['aria-hidden="true" — the slots are a picture of the input\'s value'],
      },
    ],
    keyboard: [
      {
        keys: ["0-9", "printable characters"],
        on: "the input",
        action: "fills the active slot and advances",
      },
      {
        keys: ["Backspace"],
        on: "the input",
        action: "clears the active slot, or steps back and clears the previous one",
      },
      {keys: ["Delete"], on: "the input", action: "clears the active slot without stepping back"},
      {keys: ["ArrowLeft", "ArrowRight"], on: "the input", action: "moves the caret between slots"},
      {keys: ["Home", "End"], on: "the input", action: "moves the caret to the first or last slot"},
      {
        keys: ["Ctrl/Cmd+V"],
        on: "the input",
        action:
          "pastes a whole code, distributing one character per slot and moving the caret to the end",
      },
    ],
    focus: [
      "There is one tab stop: the hidden input. The slots are never focusable.",
      "The active slot is derived from the input's selectionStart/selectionEnd, so the caret position has to be tracked and mirrored onto the slots.",
      "Clicking a slot must move the real caret, not focus the slot.",
    ],
    states: [
      {state: "active slot", reflectedAs: "data-active", on: "one slot"},
      {state: "filled slot", reflectedAs: "data-filled", on: "each slot with a character"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the root and every slot"},
    ],
    dataAttributes: [
      {
        attribute: "data-active",
        element: "the slot under the caret",
        setBy: "the component, from the input's selection range",
        values: ["true", "(absent)"],
        changesWhen: "every keystroke, caret move, focus change, or paste",
      },
      {
        attribute: "data-filled",
        element: "each slot that holds a character",
        setBy: "the component, from the input's value",
        values: ["true", "(absent)"],
        changesWhen: "the value changes",
      },
      VALIDATION_ATTR("the root and each slot"),
      {
        attribute: "data-disabled",
        element: "the root and each slot",
        setBy: "the component, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: "the disabled prop changes",
        authorable: true,
      },
    ],
  },

  {
    component: "ListBox",
    completeness: "behavior-required",
    criteria: ["keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A selectable list. Its own stylesheet has no runtime state at all — everything that makes it a listbox is the keyboard map, the roving tabindex, and the ARIA wiring.",
    missingWithoutBehavior:
      "the arrow-key navigation, type-ahead, the roving tabindex, and the selection model",
    aria: [
      {
        element: "the list",
        role: "listbox",
        attributes: [
          "aria-label or aria-labelledby",
          'aria-multiselectable="true" when more than one option can be selected',
          "aria-orientation for a horizontal list",
        ],
      },
      {
        element: "each option",
        role: "option",
        attributes: ["aria-selected", "aria-disabled on disabled options", "a stable id"],
      },
      {element: "a section", role: "group", attributes: ["aria-labelledby pointing at its header"]},
    ],
    keyboard: [
      ...COLLECTION_KEYS("option", "the list"),
      {keys: [" "], on: "an option", action: "toggles selection in multiple-selection mode"},
      {
        keys: ["Enter"],
        on: "an option",
        action: "selects the option, or activates it in action mode",
      },
      {
        keys: ["ArrowUp", "ArrowDown"],
        on: "an option",
        action: "extends the selection while moving",
        modifiers: "with Shift held",
      },
      {
        keys: ["Ctrl/Cmd+A"],
        on: "the list",
        action: "selects everything in multiple-selection mode",
      },
      {keys: ["Escape"], on: "the list", action: "clears the selection in multiple-selection mode"},
    ],
    focus: [
      'The list is a single tab stop: the focused option carries tabindex="0" and every other option tabindex="-1" — a roving tabindex.',
      "The focused option must be scrolled into view as it moves.",
      "Returning to the list restores focus to the option that had it, not to the first option.",
      "Disabled options are skipped when the list is in selection mode.",
    ],
    activation: {
      modes: [
        "selection on focus (single-select lists, where arrowing changes the value)",
        "selection on Enter/Space (the safe default)",
      ],
      default: "selection on Enter/Space",
    },
    states: [
      {state: "selected", reflectedAs: "aria-selected + data-selected", on: "an option"},
      {state: "focused", reflectedAs: 'DOM focus + tabindex="0"', on: "one option"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "an option",
        setBy: "the selection manager",
        values: ["true", "(absent)"],
        changesWhen:
          "the selection changes. It lives in the list-box-item stylesheet rather than list-box.css, so fetching the ListBox styles alone does not show it.",
      },
      ...INTERACTION_STATE_ATTRS("an option"),
      {
        attribute: "data-orientation",
        element: "the list",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen: "never after render",
        authorable: true,
      },
    ],
  },

  {
    component: "Modal",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A modal dialog. Focus trap, inert background, Escape, focus restore, and enter/exit transitions driven from data attributes.",
    missingWithoutBehavior:
      "the focus trap, Escape-to-close, focus restore, and the enter/exit transitions",
    aria: [
      triggerAria("the trigger", "dialog", "the dialog"),
      {
        element: "the dialog",
        role: "dialog",
        attributes: ['aria-modal="true"', "aria-labelledby pointing at the title's id"],
      },
      {element: "everything outside the dialog", attributes: ["inert or aria-hidden while open"]},
    ],
    keyboard: OVERLAY_KEYS,
    focus: MODAL_FOCUS,
    activation: {
      modes: ["dismiss on Escape, backdrop click, or an explicit close"],
      default: "dismiss on Escape, backdrop click, or an explicit close",
    },
    states: [
      {
        state: "open",
        reflectedAs: "presence in the DOM + aria-expanded on the trigger",
        on: "the dialog",
      },
      {
        state: "entering / exiting",
        reflectedAs: "data-entering / data-exiting",
        on: "the backdrop and the dialog",
      },
      {state: "vertical placement", reflectedAs: "data-placement", on: "the dialog"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the backdrop and the dialog"),
      {
        attribute: "data-placement",
        element: "the dialog",
        setBy: "the author, from the placement prop",
        values: ["auto", "top", "center", "bottom"],
        changesWhen:
          "never after render, but it selects the transform the enter/exit transition uses",
        authorable: true,
      },
      ...INTERACTION_STATE_ATTRS("the close button").filter((a) =>
        ["data-pressed", "data-focus-visible"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "NumberField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A numeric input with stepper buttons. Arrow and Page keys step the value, the steppers must not steal focus, and the value is parsed and formatted per locale.",
    missingWithoutBehavior:
      "the stepper keyboard map, clamping to min/max, locale parsing, and the invalid state",
    aria: [
      {element: "the group", role: "group", attributes: ["aria-labelledby pointing at the label"]},
      {
        element: "the input",
        role: "spinbutton",
        attributes: [
          "aria-valuenow, aria-valuemin, aria-valuemax",
          "aria-valuetext when the displayed value is formatted (currency, percent)",
          "aria-describedby",
          "aria-invalid",
        ],
      },
      {
        element: "each stepper button",
        attributes: [
          'an aria-label ("Increase", "Decrease")',
          'tabindex="-1" so it is not a separate tab stop',
        ],
      },
    ],
    keyboard: [
      ...SPINBUTTON_KEYS("the input", "the value"),
      {keys: ["Enter"], on: "the input", action: "commits and re-formats the typed value"},
    ],
    focus: [
      'The input is the only tab stop; the stepper buttons carry tabindex="-1".',
      "Pressing a stepper must return focus to the input rather than leave it on the button.",
      "Holding a stepper repeats the step, and the repeat must stop on pointerup even outside the button.",
      "On blur the value is clamped and re-formatted without moving focus.",
    ],
    states: [
      {state: "value", reflectedAs: "aria-valuenow + the input's value", on: "the input"},
      {state: "at the limit", reflectedAs: "the disabled stepper button", on: "a stepper"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the group"},
    ],
    dataAttributes: [
      VALIDATION_ATTR("the field wrapper and the group"),
      {
        attribute: "data-disabled",
        element: "the group",
        setBy: "the field, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen:
          'the disabled prop changes; paired with [aria-disabled="true"] in the stylesheet',
        nativeFallback: '[aria-disabled="true"]',
        authorable: true,
      },
      {
        attribute: "data-focus-within",
        element: "the group",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "focus enters or leaves the group",
        nativeFallback: ":focus-within",
      },
    ],
  },

  {
    component: "Popover",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A non-modal overlay anchored to a trigger. Its side, its arrow position, and its enter/exit states are all measured at runtime.",
    missingWithoutBehavior:
      "the positioning, dismissal, focus restore, and the placement and transition states",
    aria: [
      triggerAria("the trigger", "dialog", "the popover"),
      {element: "the popover", role: "dialog", attributes: ["an accessible name"]},
      {element: "the arrow", attributes: ['aria-hidden="true"']},
    ],
    keyboard: OVERLAY_KEYS,
    focus: [
      ...NON_MODAL_FOCUS,
      "A click outside dismisses the popover; the click that dismisses it should not also activate what is underneath.",
    ],
    activation: {
      modes: ["click or Enter/Space on the trigger"],
      default: "click or Enter/Space on the trigger",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded on the trigger", on: "the trigger"},
      {state: "resolved side", reflectedAs: "data-placement", on: "the popover"},
      {state: "entering / exiting", reflectedAs: "data-entering / data-exiting", on: "the popover"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the popover"),
      {
        ...placementAttribute("the popover"),
        changesWhen:
          "recomputed on open, scroll, and resize. It picks both the entry translate direction and which edge the arrow sits on, so an unset data-placement leaves the arrow in the wrong place and the animation sliding the wrong way.",
      },
      {
        attribute: "data-focus-visible",
        element: "the trigger",
        setBy: "the focus-visibility layer",
        values: ["true", "(absent)"],
        changesWhen: "the trigger takes keyboard focus",
        nativeFallback: ":focus-visible",
      },
    ],
  },

  {
    component: "RadioGroup",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A radio group is one tab stop, not one per radio. The arrow keys move and select in the same motion, and the checked radio is the only tabbable one.",
    missingWithoutBehavior: "the roving tabindex, the arrow-key selection, and the checked state",
    aria: [
      {
        element: "the group",
        role: "radiogroup",
        attributes: [
          "aria-labelledby pointing at the group label",
          "aria-describedby pointing at the description and error ids",
          "aria-orientation for a horizontal group",
        ],
      },
      {
        element: "each radio input",
        attributes: [
          "a shared name attribute so the browser enforces exclusivity",
          "aria-disabled on disabled options",
        ],
        note: "Use real input[type=radio] elements; the browser already implements the arrow-key model for a named group.",
      },
    ],
    keyboard: [
      {
        keys: ["ArrowDown", "ArrowRight"],
        on: "a radio",
        action: "moves to and selects the next radio, wrapping",
      },
      {
        keys: ["ArrowUp", "ArrowLeft"],
        on: "a radio",
        action: "moves to and selects the previous radio, wrapping",
      },
      {keys: [" "], on: "a radio", action: "selects the focused radio"},
      {keys: ["Tab"], on: "a radio", action: "leaves the group entirely"},
    ],
    focus: [
      'The group is a single tab stop. The checked radio carries tabindex="0"; every other radio carries tabindex="-1" — a roving tabindex.',
      "When nothing is checked, the first enabled radio is the tab stop.",
      "Focus lands on the visually hidden input, so a ring on the label root needs :has(:focus-visible) — :focus-visible does not propagate to ancestors.",
      "Disabled radios are skipped by the arrow keys.",
    ],
    activation: {
      modes: ["selection follows focus"],
      default: "selection follows focus",
      note: "This is the one widget where moving focus is expected to change the value.",
    },
    states: [
      {
        state: "checked",
        reflectedAs: "the input's checked property + data-selected",
        on: "a radio",
      },
      {state: "tab stop", reflectedAs: 'tabindex="0"', on: "the checked radio"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "the radio label root",
        setBy: "the radio, mirroring the input's checked state",
        values: ["true", "(absent)"],
        changesWhen:
          'the selection changes. The stylesheet also matches [aria-checked="true"], so either will drive the indicator.',
      },
      {
        attribute: "data-hovered",
        element: "the radio label root",
        setBy: "the pointer-interaction layer",
        values: ["true", "(absent)"],
        changesWhen: "the pointer enters or leaves",
        nativeFallback: ":hover",
      },
      {
        attribute: "data-orientation",
        element: "the group",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen: "never after render",
        authorable: true,
      },
    ],
  },

  {
    component: "RangeCalendar",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A calendar that selects a span. On top of the grid model it tracks an anchor, previews the range as focus moves, and marks the two boundary cells.",
    missingWithoutBehavior:
      "the grid navigation, the range anchoring and preview, and the boundary states the stylesheet rounds the highlight from",
    aria: [
      {
        element: "the grid",
        role: "grid",
        attributes: ["aria-labelledby pointing at the month heading"],
      },
      {
        element: "each day cell",
        role: "gridcell",
        attributes: [
          "aria-selected for every date inside the range",
          "a full localised aria-label",
        ],
      },
      {element: "the month heading", attributes: ['aria-live="polite"']},
    ],
    keyboard: [
      ...CALENDAR_KEYS,
      {
        keys: ["Enter", " "],
        on: "the focused day cell",
        action: "anchors the range on the first press and commits it on the second",
      },
      {
        keys: ["Escape"],
        on: "the grid",
        action: "cancels an in-progress range and restores the previous one",
      },
    ],
    focus: [
      ...CALENDAR_FOCUS,
      "While a range is anchored, moving focus previews the range; the preview must be reflected in the DOM, not only drawn.",
    ],
    activation: {
      modes: ["manual, two-step (anchor then commit)"],
      default: "manual, two-step (anchor then commit)",
    },
    states: [
      {
        state: "in range",
        reflectedAs: "aria-selected + data-selected",
        on: "each day cell in the span",
      },
      {state: "range start", reflectedAs: "data-selection-start", on: "the first cell"},
      {state: "range end", reflectedAs: "data-selection-end", on: "the last cell"},
    ],
    dataAttributes: [
      ...CALENDAR_DATA("a day cell"),
      {
        attribute: "data-selection-start",
        element: "the first day cell of the range",
        setBy: "the range calendar",
        values: ["true", "(absent)"],
        changesWhen:
          "the anchor moves; it rounds the leading edge and is what separates the boundary from the middle",
      },
      {
        attribute: "data-selection-end",
        element: "the last day cell of the range",
        setBy: "the range calendar",
        values: ["true", "(absent)"],
        changesWhen: "the range end moves, including during preview",
      },
      {
        attribute: "data-open",
        element: "the year picker",
        setBy: "the calendar header",
        values: ["true", "(absent)"],
        changesWhen: "the year picker is toggled",
      },
      ...INTERACTION_STATE_ATTRS("a day cell"),
    ],
  },

  {
    component: "ScrollShadow",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "Edge fades that appear only when there is content to scroll to. A scroll listener measures the container and writes the attributes the fades are keyed on; without it the shadows never appear.",
    missingWithoutBehavior: "the scroll measurement that turns each edge fade on and off",
    aria: [
      {
        element: "the scroll container",
        attributes: [
          'tabindex="0" when it scrolls, so a keyboard user can reach and scroll it',
          'an accessible name and role="region" when it is a meaningful landmark',
        ],
      },
    ],
    keyboard: [],
    focus: [
      "A scrollable region must be focusable so it can be scrolled from the keyboard; the browser does not do this for you on a plain div.",
    ],
    states: [
      {state: "content above", reflectedAs: "data-top-scroll", on: "the container"},
      {state: "content below", reflectedAs: "data-bottom-scroll", on: "the container"},
      {
        state: "content on both sides",
        reflectedAs: "data-top-bottom-scroll / data-left-right-scroll",
        on: "the container",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-top-scroll",
        element: "the scroll container",
        setBy: "a scroll and resize listener, from scrollTop",
        values: ["true", "false", "(absent)"],
        changesWhen: "on every scroll, on resize, and when the content size changes",
      },
      {
        attribute: "data-bottom-scroll",
        element: "the scroll container",
        setBy: "the same listener, from scrollTop, clientHeight and scrollHeight",
        values: ["true", "false", "(absent)"],
        changesWhen: "on every scroll, on resize, and when the content size changes",
      },
      {
        attribute: "data-top-bottom-scroll",
        element: "the scroll container",
        setBy: "the same listener, when there is content in both directions",
        values: ["true", "(absent)"],
        changesWhen:
          "it replaces data-top-scroll and data-bottom-scroll, which are removed while it is present — the three are mutually exclusive",
      },
      {
        attribute: "data-left-scroll",
        element: "the scroll container",
        setBy: "the same listener, from scrollLeft",
        values: ["true", "false", "(absent)"],
        changesWhen: "on horizontal scroll and resize",
      },
      {
        attribute: "data-right-scroll",
        element: "the scroll container",
        setBy: "the same listener",
        values: ["true", "false", "(absent)"],
        changesWhen: "on horizontal scroll and resize",
      },
      {
        attribute: "data-left-right-scroll",
        element: "the scroll container",
        setBy: "the same listener, when there is content on both sides",
        values: ["true", "(absent)"],
        changesWhen: "it replaces data-left-scroll and data-right-scroll while present",
      },
      {
        attribute: "data-orientation",
        element: "the scroll container",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen: "never after render; it decides which pair of edges is measured",
        authorable: true,
      },
    ],
  },

  {
    component: "SearchField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A text field with a clear button. Escape clears it, the clear button hides itself when the value is empty, and clearing must not drop focus.",
    missingWithoutBehavior:
      "Escape-to-clear, the empty state that hides the clear button, and focus retention after clearing",
    aria: [
      {
        element: "the input",
        attributes: [
          'type="search"',
          "aria-describedby pointing at the description and error ids",
          "aria-invalid",
        ],
      },
      {
        element: "the clear button",
        attributes: ['an aria-label such as "Clear search"', 'type="button"'],
      },
      {element: "the search icon", attributes: ['aria-hidden="true"']},
    ],
    keyboard: [
      {keys: ["Escape"], on: "the input", action: "clears the value and keeps focus on the input"},
      {keys: ["Enter"], on: "the input", action: "submits the current query"},
    ],
    focus: [
      "Clearing — by Escape or by the clear button — must leave focus on the input, never on a button that has just been removed from the DOM.",
      "The clear button should not be a tab stop while the field is empty.",
    ],
    states: [
      {state: "empty", reflectedAs: "data-empty", on: "the field wrapper"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the field wrapper"},
    ],
    dataAttributes: [
      {
        attribute: "data-empty",
        element: "the field wrapper and the group",
        setBy: "the search field, from the input's value",
        values: ["true", "(absent)"],
        changesWhen: "the value becomes empty or non-empty; it is what hides the clear button",
      },
      VALIDATION_ATTR("the field wrapper and the group"),
      {
        attribute: "data-disabled",
        element: "the group",
        setBy: "the field, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: 'the disabled prop changes; paired with [aria-disabled="true"]',
        nativeFallback: '[aria-disabled="true"]',
        authorable: true,
      },
      {
        attribute: "data-focus-within",
        element: "the group",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "focus enters or leaves the group",
        nativeFallback: ":focus-within",
      },
    ],
  },

  {
    component: "Select",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A button that opens a listbox. Focus moves into the list, the list is positioned at runtime, and a closed select still has to answer the keyboard.",
    missingWithoutBehavior:
      "the listbox keyboard map, focus movement into and back from the list, the open state, and the popup positioning",
    aria: [
      triggerAria("the trigger button", "listbox", "the listbox"),
      {
        element: "the trigger button",
        attributes: ["aria-labelledby pointing at both the label and the value display"],
      },
      {
        element: "the listbox",
        role: "listbox",
        attributes: ["aria-labelledby pointing at the label"],
      },
      {element: "each option", role: "option", attributes: ["aria-selected", "a stable id"]},
      {
        element: "a hidden select or input",
        attributes: ["the current value, so the control submits with a form"],
      },
    ],
    keyboard: [
      {
        keys: ["Enter", " ", "ArrowDown", "ArrowUp"],
        on: "the trigger",
        action: "opens the listbox",
      },
      {
        keys: ["printable characters"],
        on: "the closed trigger",
        action: "type-ahead selects the next matching option without opening the list",
      },
      ...COLLECTION_KEYS("option", "the open listbox"),
      {
        keys: ["Enter", " "],
        on: "an option",
        action: "selects it, closes the list, and returns focus to the trigger",
      },
      {keys: ["Escape"], on: "the listbox", action: "closes without changing the selection"},
      {keys: ["Tab"], on: "the listbox", action: "closes the list and moves on"},
    ],
    focus: [
      "Opening moves DOM focus into the listbox and onto the selected option, or the first option when nothing is selected.",
      'Within the listbox the focused option carries tabindex="0" and the rest tabindex="-1" — a roving tabindex.',
      "Closing always returns focus to the trigger, whether the list was dismissed or an option was chosen.",
      "The focused option is scrolled into view as it moves.",
    ],
    activation: {
      modes: ["manual (Enter, Space, or click commits)"],
      default: "manual",
      note: "Arrowing through the open list must not commit the value.",
    },
    states: [
      {state: "open", reflectedAs: "aria-expanded + data-open", on: "the trigger"},
      {state: "no value chosen", reflectedAs: "data-placeholder", on: "the value display"},
      {state: "selected option", reflectedAs: "aria-selected + data-selected", on: "an option"},
    ],
    dataAttributes: [
      {
        attribute: "data-open",
        element: "the trigger and the field wrapper",
        setBy: "the select, from its open state",
        values: ["true", "(absent)"],
        changesWhen: "the list opens or closes; it also rotates the trigger's chevron",
      },
      {
        attribute: "data-placeholder",
        element: "the value display",
        setBy: "the select, while no option has been chosen",
        values: ["true", "(absent)"],
        changesWhen: "a value is selected or cleared",
      },
      {
        attribute: "data-focus",
        element: "the trigger",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "the trigger takes or loses focus",
        nativeFallback: ":focus (paired in the stylesheet)",
      },
      VALIDATION_ATTR("the field wrapper and the trigger"),
      ...overlayTransitionAttributes("the listbox popup"),
      placementAttribute("the listbox popup"),
      ...INTERACTION_STATE_ATTRS("each option"),
    ],
  },

  {
    component: "Slider",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A value picked by dragging or by keyboard. The fill, the thumb offset, the drag state and the focus ring all come from code — and the ring has no pseudo-class fallback.",
    missingWithoutBehavior:
      "the keyboard stepping, the drag handling, the fill geometry, and the focus ring",
    aria: [
      {
        element: "the slider root",
        role: "group",
        attributes: ["aria-labelledby pointing at the label"],
      },
      {
        element: "each thumb's input",
        role: "slider",
        attributes: [
          "aria-valuenow, aria-valuemin, aria-valuemax",
          "aria-valuetext when the raw number is not what should be read",
          "aria-orientation for a vertical slider",
          'aria-label naming the thumb in a multi-thumb slider ("minimum", "maximum")',
        ],
      },
      {element: "the track and the fill", attributes: ['aria-hidden="true"']},
    ],
    keyboard: SLIDER_KEYS("a thumb", "the value"),
    focus: [
      "Each thumb is its own tab stop and holds a real range input.",
      "In a range slider, a thumb must not be able to cross its neighbour; clamp the value rather than reordering the thumbs, so focus stays on the thumb the user is moving.",
      "The ring is painted from data-focus-visible on the thumb with no :focus-visible arm in the same rule — a CSS-only port must add one.",
      "A drag captures the pointer and keeps focus on the thumb until pointerup.",
    ],
    states: [
      {
        state: "value",
        reflectedAs: "aria-valuenow + an inline offset on the thumb",
        on: "each thumb",
      },
      {state: "dragging", reflectedAs: "data-dragging", on: "the thumb"},
      {
        state: "fill reaching an end",
        reflectedAs: "data-fill-start / data-fill-end",
        on: "the fill",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-dragging",
        element: "the thumb",
        setBy: "the drag handler",
        values: ["true", "(absent)"],
        changesWhen: "a pointer press starts and ends",
      },
      {
        attribute: "data-focus-visible",
        element: "the thumb",
        setBy: "the focus-visibility layer",
        values: ["true", "(absent)"],
        changesWhen:
          "the thumb's input takes keyboard focus; no pseudo-class fallback in this stylesheet",
      },
      {
        attribute: "data-fill-end",
        element: "the fill",
        setBy: "the slider, after computing the fill width",
        values: ["true", "(absent)"],
        changesWhen:
          "the fill reaches 100% of the track; it squares off the trailing corner so the fill meets the track end cleanly",
      },
      {
        attribute: "data-fill-start",
        element: "the fill",
        setBy: "the slider, when the fill starts at the track origin",
        values: ["true", "(absent)"],
        changesWhen: "the fill's start offset reaches zero",
      },
      {
        attribute: "data-disabled",
        element: "the slider root and each thumb",
        setBy: "the component, from its disabled prop",
        values: ["true", "(absent)"],
        changesWhen: "the disabled prop changes",
        authorable: true,
      },
      {
        attribute: "data-orientation",
        element: "the slider root",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen: "never after render",
        authorable: true,
      },
    ],
  },

  {
    component: "Switch",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "A label wrapping a hidden checkbox and a styled track. The on state reaches the stylesheet as a data attribute, and focus lands on the input rather than the label the ring is drawn on.",
    missingWithoutBehavior: "the on/off state the track and thumb are keyed on",
    aria: [
      {
        element: "the input",
        role: "switch",
        attributes: [
          "aria-checked (or a real checkbox input, whose checked state does the same job)",
          "aria-describedby pointing at the description id",
        ],
      },
      {element: "the track and the thumb", attributes: ['aria-hidden="true"']},
    ],
    keyboard: [{keys: [" "], on: "the input", action: "toggles the switch"}],
    focus: [
      "Focus lands on the visually hidden input inside the label. Keep it in the layout so it remains focusable.",
      "The ring is drawn on the track, a sibling of the input, so the selector has to reach up from the focused input — :has(:focus-visible) on the label root. :focus-visible does not propagate to ancestors, so a rule written on the label root alone never matches.",
    ],
    states: [
      {
        state: "on",
        reflectedAs: "the input's checked property + aria-checked + data-selected",
        on: "the input and the label root",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "the label root",
        setBy: "the switch, mirroring the input's checked state",
        values: ["true", "(absent)"],
        changesWhen:
          'the switch is toggled. The stylesheet also matches [aria-checked="true"], so setting either moves the thumb.',
      },
      ...INTERACTION_STATE_ATTRS("the label root"),
    ],
  },

  {
    component: "Table",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A grid with selection, sorting, and optionally resizing and dragging. Two-dimensional arrow navigation, a roving tabindex over cells, and a pile of runtime states.",
    missingWithoutBehavior:
      "the two-dimensional keyboard navigation, the roving tabindex, the selection model, and the sort, resize and drag states",
    aria: [
      {
        element: "the table",
        role: "grid",
        attributes: [
          "an accessible name",
          'aria-multiselectable="true" when more than one row can be selected',
          "aria-rowcount and aria-colcount when the grid is virtualised",
        ],
      },
      {
        element: "each row",
        role: "row",
        attributes: ["aria-selected", "aria-rowindex when virtualised"],
      },
      {
        element: "each column header",
        role: "columnheader",
        attributes: ['aria-sort ("ascending", "descending", or "none") on sortable columns'],
      },
      {element: "each cell", role: "gridcell", attributes: ["aria-colindex when virtualised"]},
      {
        element: "a column resizer",
        role: "slider",
        attributes: [
          "aria-valuenow / valuemin / valuemax in pixels",
          "an aria-label naming the column",
        ],
      },
    ],
    keyboard: [
      {keys: ["ArrowUp", "ArrowDown"], on: "a cell", action: "moves one row"},
      {keys: ["ArrowLeft", "ArrowRight"], on: "a cell", action: "moves one column"},
      {
        keys: ["Home", "End"],
        on: "a cell",
        action: "moves to the first or last cell in the row",
        modifiers: "with Ctrl/Cmd, to the first or last cell in the grid",
      },
      {keys: ["PageUp", "PageDown"], on: "a cell", action: "moves one visible page of rows"},
      {keys: [" "], on: "a row", action: "toggles selection of that row"},
      {
        keys: ["ArrowUp", "ArrowDown"],
        on: "a row",
        action: "extends the selection while moving",
        modifiers: "with Shift held",
      },
      {keys: ["Ctrl/Cmd+A"], on: "the grid", action: "selects every row"},
      {keys: ["Escape"], on: "the grid", action: "clears the selection"},
      {
        keys: ["Enter", " "],
        on: "a sortable column header",
        action: "cycles that column's sort direction",
      },
      {
        keys: ["ArrowLeft", "ArrowRight"],
        on: "a column resizer",
        action: "resizes the column by one step",
        modifiers: "with Shift, by a large step",
      },
      {
        keys: ["printable characters"],
        on: "the grid",
        action: "type-ahead to the next row whose text starts with the typed string",
      },
    ],
    focus: [
      'The grid is a single tab stop: one cell carries tabindex="0" and every other cell tabindex="-1" — a roving tabindex.',
      "Focusable content inside a cell is reached by pressing Enter to enter the cell, and Escape to return to cell navigation.",
      "Returning to the grid restores focus to the last focused cell.",
      "After a row is removed, focus must move to the nearest remaining row rather than fall to the body.",
    ],
    activation: {
      modes: ["selection on Space/click", "row action on Enter/double-click"],
      default: "selection on Space/click",
    },
    states: [
      {state: "selected row", reflectedAs: "aria-selected + data-selected", on: "a row"},
      {
        state: "sort direction",
        reflectedAs: "aria-sort + data-sort-direction",
        on: "a column header",
      },
      {state: "resizing", reflectedAs: "data-resizing", on: "the table and the resizer"},
      {state: "drop target", reflectedAs: "data-drop-target", on: "a row"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "a row",
        setBy: "the selection manager",
        values: ["true", "(absent)"],
        changesWhen: "the selection changes",
      },
      {
        attribute: "data-allows-sorting",
        element: "a column header",
        setBy: "the table, from the column definition",
        values: ["true", "(absent)"],
        changesWhen: "never after render; it is what makes the header show a sort affordance",
        authorable: true,
      },
      {
        attribute: "data-resizing",
        element: "the table and the active resizer",
        setBy: "the resize handler",
        values: ["true", "(absent)"],
        changesWhen: "a resize drag starts and ends",
      },
      {
        attribute: "data-dragging",
        element: "a row being dragged",
        setBy: "the drag-and-drop layer",
        values: ["true", "(absent)"],
        changesWhen: "a drag starts and ends",
      },
      {
        attribute: "data-drop-target",
        element: "the row under the pointer during a drag",
        setBy: "the drag-and-drop layer",
        values: ["true", "(absent)"],
        changesWhen: "the drop target changes during a drag",
      },
      {
        attribute: "data-tree-column",
        element: "the cell that owns the expand/collapse affordance",
        setBy: "the table, for tree grids",
        values: ["(present)", "(absent)"],
        changesWhen: "never after render",
        authorable: true,
      },
      {
        attribute: "data-disabled",
        element: "a row",
        setBy: "the table, from the disabled key set",
        values: ["true", "(absent)"],
        changesWhen: 'the disabled set changes; paired with [aria-disabled="true"]',
        nativeFallback: '[aria-disabled="true"]',
      },
      ...INTERACTION_STATE_ATTRS("a row").filter((a) =>
        ["data-hovered", "data-focus-visible"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "Tabs",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management", "aria-cross-reference"],
    summary:
      "A tab list and its panels. The arrow keys move between tabs, the tab list is one tab stop, and every tab points at the panel it controls. The stylesheet's selected and disabled rules key on attributes nothing sets on its own.",
    missingWithoutBehavior:
      "the arrow-key navigation, the roving tabindex, the tab-to-panel ARIA wiring, and the selected state the stylesheet keys on",
    aria: [
      {
        element: "the tab list",
        role: "tablist",
        attributes: [
          "aria-label or aria-labelledby",
          'aria-orientation="vertical" for a vertical tab list',
        ],
      },
      {
        element: "each tab",
        role: "tab",
        attributes: [
          'aria-selected ("true" on exactly one tab, "false" on the rest)',
          "aria-controls pointing at its panel's id",
          "aria-disabled on disabled tabs",
          "a stable id the panel can point back at",
        ],
      },
      {
        element: "each panel",
        role: "tabpanel",
        attributes: [
          "aria-labelledby pointing at its tab's id",
          'tabindex="0" when the panel holds no focusable content, so it can be reached from the keyboard',
        ],
      },
    ],
    keyboard: [
      {
        keys: ["ArrowRight"],
        on: "a tab in a horizontal tab list",
        action: "moves to the next tab, wrapping at the end (reversed under right-to-left)",
      },
      {
        keys: ["ArrowLeft"],
        on: "a tab in a horizontal tab list",
        action: "moves to the previous tab, wrapping at the start (reversed under right-to-left)",
      },
      {
        keys: ["ArrowDown"],
        on: "a tab in a vertical tab list",
        action: "moves to the next tab, wrapping",
      },
      {
        keys: ["ArrowUp"],
        on: "a tab in a vertical tab list",
        action: "moves to the previous tab, wrapping",
      },
      {keys: ["Home"], on: "a tab", action: "moves to the first tab"},
      {keys: ["End"], on: "a tab", action: "moves to the last tab"},
      {
        keys: ["Enter", " "],
        on: "a tab",
        action:
          "selects the focused tab; required in manual activation, a no-op in automatic activation",
      },
      {
        keys: ["Tab"],
        on: "a tab",
        action: "leaves the tab list and moves to the selected panel — not to the next tab",
      },
    ],
    focus: [
      'The tab list is a single tab stop. The selected tab carries tabindex="0"; every other tab carries tabindex="-1" — a roving tabindex. Giving every tab tabindex="0" is the most common way to get this wrong.',
      'Arrow keys move DOM focus between tabs and move the tabindex="0" marker with it.',
      "Disabled tabs are skipped by the arrow keys.",
      'Tab from the tab list goes to the active panel; if the panel has no focusable content it needs tabindex="0" so it is still reachable.',
      "Changing the selection must not move focus out of the tab list.",
    ],
    activation: {
      modes: ["automatic (selection follows focus)", "manual (Enter or Space commits)"],
      default: "automatic",
      note: "Use manual activation when showing a panel is expensive or has side effects; under manual activation the focused tab and the selected tab are different tabs, and both need to be visibly distinguishable.",
    },
    states: [
      {state: "selected", reflectedAs: "aria-selected + data-selected", on: "one tab"},
      {state: "focused", reflectedAs: 'DOM focus + tabindex="0"', on: "one tab"},
      {state: "disabled", reflectedAs: "aria-disabled + data-disabled", on: "a tab"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "the selected tab, and the selection indicator",
        setBy: "the tabs controller, when the selection changes",
        values: ["true", "(absent)"],
        changesWhen:
          "a tab is selected by click, by Enter/Space, or by arrowing under automatic activation. The stylesheet's entire selected treatment — the pill background, the raised z-index, the hidden neighbouring separators — hangs off this one attribute. Nothing in the CSS sets it.",
      },
      {
        attribute: "data-disabled",
        element: "a tab",
        setBy: "the tabs controller, from the disabled key set",
        values: ["true", "(absent)"],
        changesWhen:
          'the disabled set changes. It is also used negatively — the hover rule is written as :not([data-disabled="true"]) — so leaving it unset makes disabled tabs light up on hover.',
      },
      {
        attribute: "data-entering",
        element: "a tab panel",
        setBy: "the tabs controller, for one frame after the panel is shown",
        values: ["true", "(absent)"],
        changesWhen: "the selection changes and a new panel mounts",
      },
      {
        attribute: "data-exiting",
        element: "the outgoing tab panel",
        setBy: "the tabs controller, while the outgoing panel transitions away",
        values: ["true", "(absent)"],
        changesWhen:
          "the selection changes; the old panel stays mounted until its transition ends, so the panel cannot simply be removed on selection change",
      },
      {
        attribute: "data-orientation",
        element: "the tabs root and the tab list",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen:
          "never after render, but it decides both the layout and which arrow keys navigate — it must also be mirrored into aria-orientation",
        authorable: true,
      },
      ...INTERACTION_STATE_ATTRS("a tab").filter((a) =>
        ["data-hovered", "data-focus-visible"].includes(a.attribute),
      ),
    ],
  },

  {
    component: "TagGroup",
    completeness: "behavior-required",
    criteria: ["keyboard", "focus-management"],
    summary:
      "A list of removable tags with a roving tabindex. Its own stylesheet carries no runtime state — what makes it a tag group is the arrow navigation, the remove keys, and where focus goes after a tag disappears.",
    missingWithoutBehavior:
      "the arrow-key navigation, the roving tabindex, Backspace/Delete removal, and focus recovery after removal",
    aria: [
      {
        element: "the tag list",
        role: "listbox, or grid when tags have their own remove buttons",
        attributes: ["aria-label or aria-labelledby", "aria-multiselectable when applicable"],
      },
      {
        element: "each tag",
        role: "option or row",
        attributes: ["aria-selected when the group is selectable"],
      },
      {element: "a tag's remove button", attributes: ["an aria-label naming what it removes"]},
    ],
    keyboard: [
      {keys: ["ArrowRight", "ArrowLeft"], on: "a tag", action: "moves focus along the group"},
      {keys: ["ArrowUp", "ArrowDown"], on: "a tag", action: "moves focus between wrapped rows"},
      {keys: ["Home", "End"], on: "a tag", action: "moves focus to the first or last tag"},
      {keys: ["Backspace", "Delete"], on: "a tag", action: "removes that tag"},
      {keys: [" "], on: "a tag", action: "toggles selection when the group is selectable"},
      {
        keys: ["printable characters"],
        on: "the group",
        action: "type-ahead to the next tag whose label starts with the typed string",
      },
    ],
    focus: [
      'The group is a single tab stop: one tag carries tabindex="0" and the rest tabindex="-1" — a roving tabindex.',
      "Removing a tag must move focus to the next tag, or to the previous one when the removed tag was last; letting focus fall to the body is the classic bug here.",
      "When the last tag is removed, focus must move to a sensible anchor — the group itself or whatever follows it.",
    ],
    activation: {
      modes: ["selection on Space/click", "removal on Backspace/Delete or the remove button"],
      default: "selection on Space/click",
    },
    states: [
      {state: "selected", reflectedAs: "aria-selected + data-selected", on: "a tag"},
      {state: "focused", reflectedAs: 'DOM focus + tabindex="0"', on: "one tag"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "a tag",
        setBy: "the selection manager",
        values: ["true", "(absent)"],
        changesWhen:
          "the selection changes. It lives in the tag stylesheet rather than tag-group.css, so fetching the TagGroup styles alone does not show it.",
      },
      ...INTERACTION_STATE_ATTRS("a tag"),
    ],
  },

  {
    component: "TextArea",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "A native textarea. Its invalid styling is keyed on a data attribute a validation layer sets; the stylesheet has no :invalid arm.",
    missingWithoutBehavior: "the invalid state the stylesheet keys on",
    aria: [
      {
        element: "the textarea",
        attributes: ["aria-describedby pointing at the description and error ids", "aria-invalid"],
      },
    ],
    keyboard: [],
    focus: [
      "One tab stop. Auto-resizing, if you add it, must not move the caret or scroll the page.",
    ],
    states: [{state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the textarea"}],
    dataAttributes: [
      {
        ...VALIDATION_ATTR("the textarea"),
        changesWhen:
          "validation state changes. The stylesheet has no :invalid or :user-invalid arm, so a CSS-only port paints no invalid ring unless it adds one.",
      },
      ...INTERACTION_STATE_ATTRS("the textarea"),
      {
        attribute: "data-focused",
        element: "the textarea",
        setBy: "the focus layer",
        values: ["true", "(absent)"],
        changesWhen: "the textarea takes or loses focus",
        nativeFallback: ":focus",
      },
    ],
  },

  {
    component: "TextField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "The wrapper that ties a label, an input, a description and an error together. It generates the ids, wires aria-describedby, and is what puts the invalid state onto its descendants.",
    missingWithoutBehavior:
      "the generated id wiring and the invalid state it pushes onto the input and label",
    aria: [
      {
        element: "the label",
        attributes: ["a `for` attribute matching the input's id"],
      },
      {
        element: "the input",
        attributes: [
          "an id the label points at",
          "aria-describedby listing the description id and, while invalid, the error id",
          "aria-invalid while the field is invalid",
        ],
        note: "aria-describedby has to be rebuilt as the error appears and disappears — a static list is wrong half the time.",
      },
    ],
    keyboard: [],
    focus: [
      "Clicking the label focuses the input. That is the `for` attribute doing it, not script.",
    ],
    states: [
      {
        state: "invalid",
        reflectedAs: "aria-invalid + data-invalid",
        on: "the wrapper and the input",
      },
    ],
    dataAttributes: [
      {
        attribute: "data-invalid",
        element: "the field wrapper",
        setBy: "the field's validation layer",
        values: ["true", "(absent)"],
        changesWhen:
          'validation state changes. On the wrapper it hides the description so the error can take its place; the stylesheet pairs it with [aria-invalid="true"], so setting either works — but something has to set one of them.',
        nativeFallback: '[aria-invalid="true"]',
      },
    ],
  },

  {
    component: "TimeField",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "focus-management"],
    summary:
      "A time split into editable segments. One tab stop, a roving tabindex between segments, and a full arrow/digit keyboard map.",
    missingWithoutBehavior:
      "the segment keyboard map, the roving tabindex, and the validation state",
    aria: [
      {element: "the field", role: "group", attributes: ["aria-labelledby pointing at the label"]},
      {
        element: "each segment",
        role: "spinbutton",
        attributes: [
          "aria-valuenow, aria-valuemin, aria-valuemax",
          "aria-valuetext for the placeholder and for the day period",
          'aria-label naming the segment ("hour", "minute", "AM/PM")',
        ],
      },
    ],
    keyboard: DATE_SEGMENT_KEYS,
    focus: DATE_SEGMENT_FOCUS,
    states: [
      {state: "segment value", reflectedAs: "aria-valuenow + the segment's text", on: "a segment"},
      {state: "invalid", reflectedAs: "aria-invalid + data-invalid", on: "the field wrapper"},
    ],
    dataAttributes: [VALIDATION_ATTR("the field wrapper and the segment group")],
  },

  {
    component: "Toast",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "focus-management", "aria-cross-reference"],
    summary:
      "A queue of transient messages. Position in the stack, timers that pause on hover and focus, and focus that must survive a toast disappearing under it.",
    missingWithoutBehavior:
      "the queue, the auto-dismiss timers, the stacking states, and focus recovery when a toast is removed",
    aria: [
      {
        element: "the region",
        role: "region",
        attributes: [
          'an aria-label such as "Notifications"',
          'tabindex="-1" so focus can be moved to it programmatically',
        ],
      },
      {
        element: "each toast",
        role: "alert for errors, status otherwise",
        attributes: [
          "aria-labelledby pointing at the title",
          "aria-describedby pointing at the description",
        ],
      },
      {
        element: "a toast that is stacked out of view",
        attributes: ['aria-hidden="true", so a collapsed stack is not read out'],
      },
    ],
    keyboard: [
      {keys: ["F6"], on: "anywhere in the page", action: "moves focus to the toast region"},
      {keys: ["Escape"], on: "a focused toast", action: "dismisses it"},
    ],
    focus: [
      "Auto-dismiss timers must pause while the pointer is over the region and while focus is inside it, and resume when both leave.",
      "When a focused toast is removed, focus moves to the next toast, or back to where it came from when the queue empties.",
      "The region is not in the tab order until it holds a toast.",
    ],
    activation: {
      modes: ["auto-dismiss after a timeout", "manual dismissal only"],
      default: "auto-dismiss after a timeout",
      note: "A toast with an action or an error must not auto-dismiss.",
    },
    states: [
      {state: "front of the stack", reflectedAs: "data-frontmost", on: "one toast"},
      {state: "stacked out of view", reflectedAs: "data-hidden + aria-hidden", on: "a toast"},
      {state: "depth in the stack", reflectedAs: "data-index", on: "each toast"},
    ],
    dataAttributes: [
      {
        attribute: "data-frontmost",
        element: "the toast at the front of the stack",
        setBy: "the toast queue",
        values: ["true", "(absent)"],
        changesWhen:
          'a toast is added or removed. Only the frontmost toast shows its close button on hover; the rest are scaled and dimmed by :not([data-frontmost="true"]).',
      },
      {
        attribute: "data-hidden",
        element: "a toast pushed past the visible depth of the stack",
        setBy: "the toast queue",
        values: ["true", "(absent)"],
        changesWhen: "the queue grows past the visible limit; it must be paired with aria-hidden",
      },
      {
        attribute: "data-index",
        element: "each toast",
        setBy: "the toast queue",
        values: ["0", "1", "2", "…"],
        changesWhen: "the queue changes; it drives the stacked offset and scale",
      },
      {
        attribute: "data-hovered",
        element: "a toast",
        setBy: "the pointer-interaction layer",
        values: ["true", "(absent)"],
        changesWhen: "the pointer enters or leaves",
        nativeFallback: ":hover",
      },
    ],
  },

  {
    component: "ToggleButton",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute"],
    summary:
      "A button that stays pressed. The pressed state has to reach both aria-pressed and the data attribute the stylesheet keys on.",
    missingWithoutBehavior: "the pressed state the stylesheet keys on",
    aria: [
      {
        element: "the button",
        role: "button",
        attributes: [
          'aria-pressed ("true" or "false") — a toggle button is never missing this',
          'aria-checked="true"/"false" with role="radio" instead, when it sits inside a single-selection group',
        ],
      },
    ],
    keyboard: [{keys: ["Enter", " "], on: "the button", action: "toggles the pressed state"}],
    focus: [
      "One tab stop, unless it is inside a ToggleButtonGroup — see that component's roving tabindex.",
    ],
    states: [{state: "pressed", reflectedAs: "aria-pressed + data-selected", on: "the button"}],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "the button",
        setBy: "the toggle button, from its pressed state",
        values: ["true", "(absent)"],
        changesWhen:
          "the button is toggled; it is the only thing that paints the pressed treatment",
      },
      ...INTERACTION_STATE_ATTRS("the button").filter((a) => a.attribute !== "data-disabled"),
    ],
  },

  {
    component: "ToggleButtonGroup",
    completeness: "behavior-required",
    criteria: ["keyboard", "focus-management"],
    summary:
      "A toolbar of toggle buttons. Its own stylesheet carries no runtime state; what makes it a group is the arrow-key navigation, the roving tabindex, and the shared selection model.",
    missingWithoutBehavior:
      "the arrow-key navigation, the roving tabindex, and the shared selection model",
    aria: [
      {
        element: "the group",
        role: "toolbar for multiple selection, radiogroup for single selection",
        attributes: [
          "an accessible name",
          "aria-orientation for a vertical group",
          "aria-disabled when the whole group is disabled",
        ],
      },
      {
        element: "each button",
        role: "button for multiple selection, radio for single selection",
        attributes: [
          "aria-pressed in multiple-selection mode",
          "aria-checked in single-selection mode — and no aria-pressed alongside it",
        ],
      },
    ],
    keyboard: [
      {
        keys: ["ArrowRight", "ArrowLeft"],
        on: "a button in a horizontal group",
        action: "moves focus along the group (reversed under right-to-left)",
      },
      {
        keys: ["ArrowDown", "ArrowUp"],
        on: "a button in a vertical group",
        action: "moves focus along the group",
      },
      {keys: ["Enter", " "], on: "a button", action: "toggles it"},
      {keys: ["Tab"], on: "a button", action: "leaves the group entirely"},
    ],
    focus: [
      'The group is a single tab stop: one button carries tabindex="0" and the rest tabindex="-1" — a roving tabindex.',
      "Focus does not wrap at the ends of a toolbar; it stops.",
      "Disabled buttons are skipped by the arrow keys.",
    ],
    activation: {
      modes: ["manual (Enter, Space, or click toggles)", "single selection", "multiple selection"],
      default: "multiple selection, manual activation",
    },
    states: [
      {
        state: "selected",
        reflectedAs: "aria-pressed or aria-checked + data-selected",
        on: "a button",
      },
      {state: "focused", reflectedAs: 'DOM focus + tabindex="0"', on: "one button"},
    ],
    dataAttributes: [
      {
        attribute: "data-selected",
        element: "a button in the group",
        setBy: "the group's selection state",
        values: ["true", "(absent)"],
        changesWhen:
          "the selection changes. It lives in the toggle-button stylesheet, not in toggle-button-group.css.",
      },
      {
        attribute: "data-pressed",
        element: "a button in the group",
        setBy: "the pointer-interaction layer",
        values: ["true", "(absent)"],
        changesWhen: "a press starts and ends",
        nativeFallback: ":active",
      },
      {
        attribute: "data-focus-visible",
        element: "a button in the group",
        setBy: "the focus-visibility layer",
        values: ["true", "(absent)"],
        changesWhen: "the button takes keyboard focus",
        nativeFallback: ":focus-visible",
      },
    ],
  },

  {
    component: "Toolbar",
    completeness: "behavior-required",
    criteria: ["keyboard", "focus-management"],
    summary:
      "A toolbar collapses many controls into one tab stop. Its stylesheet has no runtime state at all — the whole component is the roving tabindex and the arrow-key map.",
    missingWithoutBehavior:
      "the roving tabindex and the arrow-key navigation that make it one tab stop",
    aria: [
      {
        element: "the toolbar",
        role: "toolbar",
        attributes: [
          "an accessible name",
          'aria-orientation="vertical" for a vertical toolbar (horizontal is the default)',
        ],
      },
      {
        element: "a separator inside the toolbar",
        role: "separator",
        attributes: ["aria-orientation perpendicular to the toolbar"],
      },
    ],
    keyboard: [
      {
        keys: ["ArrowRight", "ArrowLeft"],
        on: "a control in a horizontal toolbar",
        action: "moves focus to the next or previous control (reversed under right-to-left)",
      },
      {
        keys: ["ArrowDown", "ArrowUp"],
        on: "a control in a vertical toolbar",
        action: "moves focus along the toolbar",
      },
      {
        keys: ["Tab"],
        on: "a control",
        action: "leaves the toolbar; it does not step between controls",
      },
    ],
    focus: [
      'The toolbar is a single tab stop: one control carries tabindex="0" and every other control tabindex="-1" — a roving tabindex.',
      "Returning to the toolbar restores the control that last had focus, not the first one.",
      "Focus stops at the ends rather than wrapping.",
      "A text input inside a toolbar keeps the arrow keys for caret movement; the toolbar must not swallow them.",
      "Disabled controls are skipped.",
    ],
    states: [
      {state: "focused control", reflectedAs: 'DOM focus + tabindex="0"', on: "one control"},
    ],
    dataAttributes: [
      {
        attribute: "data-orientation",
        element: "the toolbar",
        setBy: "the author",
        values: ["horizontal", "vertical"],
        changesWhen:
          "never after render, but it decides which arrow keys navigate and must be mirrored into aria-orientation",
        authorable: true,
      },
    ],
  },

  {
    component: "Tooltip",
    completeness: "behavior-required",
    criteria: ["runtime-data-attribute", "keyboard", "aria-cross-reference"],
    summary:
      "A hint that appears on hover and on focus. Delays, a shared warm-up period, Escape, and a position measured at runtime — none of which the stylesheet can do.",
    missingWithoutBehavior:
      "the hover and focus delays, Escape-to-dismiss, the positioning, and the placement and transition states",
    aria: [
      {
        element: "the trigger",
        attributes: ["aria-describedby pointing at the tooltip's id while it is visible"],
        note: "The trigger must be focusable. A tooltip on a non-focusable element is unreachable from the keyboard.",
      },
      {element: "the tooltip", role: "tooltip", attributes: ["a stable id"]},
      {element: "the arrow", attributes: ['aria-hidden="true"']},
    ],
    keyboard: [
      {
        keys: ["Escape"],
        on: "the trigger",
        action: "dismisses the tooltip while focus stays on the trigger",
      },
    ],
    focus: [
      "The tooltip never takes focus and must contain no focusable content.",
      "Focusing the trigger from the keyboard shows the tooltip immediately, with no delay; hovering shows it after a warm-up delay.",
      "Blurring the trigger hides the tooltip at once.",
      "Once one tooltip in a group has warmed up, its neighbours appear without the delay until a cool-down passes.",
    ],
    activation: {
      modes: ["hover with a delay", "focus with no delay"],
      default: "hover with a delay",
    },
    states: [
      {
        state: "visible",
        reflectedAs: "presence in the DOM + aria-describedby on the trigger",
        on: "the trigger",
      },
      {state: "resolved side", reflectedAs: "data-placement", on: "the tooltip"},
      {state: "entering / exiting", reflectedAs: "data-entering / data-exiting", on: "the tooltip"},
    ],
    dataAttributes: [
      ...overlayTransitionAttributes("the tooltip"),
      {
        ...placementAttribute("the tooltip"),
        changesWhen:
          "recomputed each time the tooltip opens and on scroll. It selects the entry translate direction and the arrow's edge, so an unset value leaves the arrow on the wrong side.",
      },
    ],
  },
];

/* -------------------------------------------------------------------------------------------------
 * Registry
 * -----------------------------------------------------------------------------------------------*/

const ALL: BehaviorContract[] = [...STYLES_SUFFICIENT, ...BEHAVIOR_REQUIRED];

export const BEHAVIOR_CONTRACTS: Readonly<Record<string, BehaviorContract>> = Object.freeze(
  Object.fromEntries(ALL.map((c) => [c.component, c])),
);

/** Every catalog component name, sorted. */
export const CATALOG_COMPONENTS: readonly string[] = Object.freeze(
  ALL.map((c) => c.component).sort(),
);

export const COMPLETENESS_VALUES: readonly Completeness[] = Object.freeze([
  "styles-sufficient",
  "behavior-required",
]);

export type {AriaRule, BehaviorContract, DataAttributeRule, KeyBinding, StateRule};
