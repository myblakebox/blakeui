# Incident: the Tabs CSS-only port

The regression this fixture guards is real. It is described here so the test
beside it keeps its meaning after everyone who remembers it has moved on.

## What happened

An agent was building a page in vanilla JavaScript and plain CSS — no React, no
`@blakeui/react`. It wanted BlakeUI's tabs.

It called two tools:

1. `get_component_source_styles({components: ["Tabs"]})`
2. `get_theme_variables()`

Both calls succeeded. It took the returned CSS, resolved the Tailwind utilities
into plain declarations, substituted the theme variables, and wrote the result
into a local stylesheet. It kept the BEM class names — `.tabs`, `.tabs__list`,
`.tabs__tab`, `.tabs__panel` — because keeping them looked like the careful
thing to do. Then it hand-wrote the interaction layer: a click handler that
swapped an `is-active` class and toggled `hidden` on the panels.

Everything rendered. The tabs were broken.

## Why

The stylesheet was never the whole component. What the agent could not see in
the CSS it was handed:

- **`data-selected`.** The entire selected treatment — the pill background, the
  raised `z-index`, the hidden separators either side — hangs off
  `[data-selected="true"]`. Nothing in the CSS sets it. The agent's `is-active`
  class matched no rule, so no tab ever looked selected.
- **`data-disabled`.** Used negatively, as
  `:not([data-disabled="true"]):hover`. Leaving it unset made disabled tabs
  light up on hover.
- **`data-entering` / `data-exiting`.** The outgoing panel has to stay mounted
  until its transition finishes. Toggling `hidden` removed it immediately, so
  the transition never ran.
- **The roving tabindex.** A tab list is one tab stop: the selected tab carries
  `tabindex="0"` and every other tab `tabindex="-1"`. The port left every tab
  focusable, so Tab walked through all of them and the arrow keys did nothing.
- **`aria-controls` and `aria-labelledby`.** Each tab points at the panel it
  controls, and each panel points back at its tab. Neither existed, so a screen
  reader announced a row of unrelated buttons.
- **Activation mode.** Tabs default to automatic activation — arrowing selects.
  There was no arrow handling at all.

None of that is visible in a stylesheet, and none of it can be reconstructed
from the ARIA APG either: the APG describes the roles, the keyboard map and the
focus model, but it has nothing to say about which `[data-*]` attributes *this*
stylesheet keys on.

## What the gate does

`get_component_source_styles` now refuses to answer for a `behavior-required`
component until the caller says where the behaviour is coming from:

- `behavior_source: "blake"` — `@blakeui/react` is driving it; return the styles.
- `behavior_source: "self"` — the caller is writing the interaction layer, so
  return the interaction contract *first*, then the styles.

The error is written to be sufficient on its own. It names the component, names
what a CSS-only port of that specific component loses, and states both parameter
values. Free is the correctness floor, not a nag.

## The test

`get-component-source-styles.test.ts` asserts three things about `Tabs`:

1. calling without `behavior_source` errors;
2. the error names the missing behaviour, not just that something is missing;
3. `behavior_source: "self"` returns the contract ahead of the styles.

If any of those stop holding, the incident can happen again.
