/**
 * Types for the framework-neutral interaction contract that accompanies every
 * catalog component.
 *
 * `completeness` answers one question: is the stylesheet the whole component?
 * For a `styles-sufficient` component the CSS reproduces it. For a
 * `behavior-required` component the CSS is the visible half of something that
 * also has a keyboard map, focus rules, ARIA wiring, or runtime state that
 * nothing in the stylesheet can set on its own.
 */

export type Completeness = "styles-sufficient" | "behavior-required";

/**
 * Which of the four audit criteria put a component in `behavior-required`.
 * Recorded so a consumer can see *why*, not just *that*.
 */
export type CompletenessCriterion =
  /** The CSS keys on a [data-*] attribute that only running JavaScript sets. */
  | "runtime-data-attribute"
  /** The keyboard map goes beyond Enter/Space on the element itself. */
  | "keyboard"
  /** Focus is managed across more than one element (roving, trap, restore). */
  | "focus-management"
  /** An ARIA attribute points at another node (controls/owns/activedescendant/expanded). */
  | "aria-cross-reference";

/** A role or ARIA attribute requirement, tied to the element that carries it. */
export interface AriaRule {
  /** The element, described structurally (e.g. "the tab list", "each tab"). */
  element: string;
  /** The ARIA role the element must expose, if any. */
  role?: string;
  /** ARIA attributes the element must carry. */
  attributes?: string[];
  /** Anything a port would get wrong without being told. */
  note?: string;
}

/** One row of the keyboard map. */
export interface KeyBinding {
  /** Key names as reported by `KeyboardEvent.key`. */
  keys: string[];
  /** Which element must have focus for the binding to apply. */
  on: string;
  /** What the binding does. */
  action: string;
  /** Modifier behaviour, when a modifier changes the action. */
  modifiers?: string;
}

/** A piece of state that must be reflected into the DOM, and how. */
export interface StateRule {
  /** The state being reflected (e.g. "selected", "open"). */
  state: string;
  /** How it must appear in the DOM (attribute, class, or property). */
  reflectedAs: string;
  /** The element that carries the reflection. */
  on: string;
}

/**
 * One entry of the data-attribute contract: what the stylesheet keys on, who
 * sets it, what values it takes, and when it changes.
 *
 * This is the part that cannot be reconstructed from the ARIA APG.
 */
export interface DataAttributeRule {
  /** The attribute name, e.g. "data-selected". */
  attribute: string;
  /** The element it lands on. */
  element: string;
  /** What sets it. */
  setBy: string;
  /** The values it takes. Absence is expressed as "(absent)". */
  values: string[];
  /** The moment it changes. */
  changesWhen: string;
  /**
   * When the stylesheet pairs the attribute with a native pseudo-class in the
   * same selector list, the rule still fires without JavaScript. Named here so
   * a port knows which attributes it can skip.
   */
  nativeFallback?: string;
  /**
   * True when the value is a fixed function of the author's own markup and can
   * be written once by hand — configuration, not runtime state.
   */
  authorable?: boolean;
}

/** How a selection is committed relative to focus. */
export interface ActivationRule {
  /** The supported modes. */
  modes: string[];
  /** The mode in effect when the author does not choose. */
  default: string;
  /** Anything the modes do not say on their own. */
  note?: string;
}

export interface BehaviorContract {
  /** Catalog name, as returned by `list_components`. */
  component: string;
  completeness: Completeness;
  /** Empty for `styles-sufficient`. */
  criteria: CompletenessCriterion[];
  /** One or two sentences: what the behaviour layer is responsible for. */
  summary: string;
  /** Short phrase naming what a CSS-only port loses. Used in the styles gate. */
  missingWithoutBehavior?: string;
  aria: AriaRule[];
  keyboard: KeyBinding[];
  /** Focus management rules, including roving tabindex where applicable. */
  focus: string[];
  activation?: ActivationRule;
  states: StateRule[];
  dataAttributes: DataAttributeRule[];
}
