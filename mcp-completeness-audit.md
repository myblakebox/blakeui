# MCP completeness audit — blakeui (free)

_Run 2026-08-28 against `main` at `5acd62b46`, `@blakeui/react` 1.3.0 / `@blakeui/styles` 1.3.0, React Aria Components 1.17.0._

An agent building in vanilla JavaScript pulled `get_component_source_styles("Tabs")` plus
`get_theme_variables()`, de-Tailwinded the CSS into a local stylesheet, kept the BEM class
names, and hand-wrote the interaction layer. The call succeeded. The tabs were broken. This
audit answers the question that call should have been asked: **is the stylesheet the whole
component?**

---

## Stylesheet ownership

**`@blakeui/styles` owns every component stylesheet.** All 82 component CSS files live in
`packages/styles/components/`. `@blakeui/react` ships exactly one CSS file,
`packages/react/src/styles.css`, whose entire contents are:

```
/* Placeholder file for build process */
@import "@blakeui/styles";
```

There are no `.styles.ts` files left in `packages/react` — every component maps variant props
to BEM class names through `tv()` definitions that also live in `@blakeui/styles`
(`packages/styles/src/components/*/`). The split is clean: **no stylesheet fix can be made
outside `@blakeui/styles`.**

Consequence for this session's standing rule: every CSS fix below is written to
`proposed-styles-patch.diff` at the repo root and is **not applied**.

---

## Method

Every component exposed through the MCP data layer was scored against four criteria. Any one
of them makes the component `behavior-required`:

1. **`runtime-data-attribute`** — the CSS depends on a `[data-*]` attribute set by JavaScript
   at runtime.
2. **`keyboard`** — the keyboard map goes beyond Enter/Space on the element itself.
3. **`focus-management`** — focus is managed across more than one element (roving tabindex,
   trap, restore).
4. **`aria-cross-reference`** — it carries an ARIA attribute pointing at another node
   (`aria-controls`, `aria-owns`, `aria-activedescendant`, or `aria-expanded` on a different
   element).

Otherwise `styles-sufficient`. Ambiguous resolves to `behavior-required`.

**Catalog.** 70 components, derived the same way the extractor derives it: every
`apps/docs/content/docs/en/react/components/**/*.mdx` carrying a `links.source` frontmatter
key. `index.mdx` is a landing page, not an entry.

**Criterion 1 scan.** Each component's stylesheet was parsed into selector blocks (nested
rules included, declarations stripped) and every `[data-*]` compound recorded, then bucketed:

- **hard** — a runtime state with no native pseudo-class in the same selector list. The rule
  cannot fire without code.
- **paired** — the stylesheet writes the attribute alongside its native equivalent in the same
  selector list (`data-hovered` with `:hover`, `data-pressed` with `:active`,
  `data-focus-visible` with `:focus-visible`, `data-focus-within` with `:focus-within`). These
  degrade correctly without JavaScript and are **not** counted as a hard dependency, per the
  brief. `[aria-invalid]` and `[aria-disabled]` are *not* treated as native fallbacks — they
  are attributes a JavaScript layer sets, same as the data attribute beside them.
- **configuration** — the value is a fixed function of the author's own markup and can be
  written once by hand: `data-slot`, `data-orientation`, `data-size`, `data-variant`,
  `data-placement` on Modal/Drawer (a prop, not a measurement), `data-pending`, `data-current`,
  `data-active` on Pagination, `data-hide-separator`, `data-default-icon`, `data-required` and
  `data-disabled` on Label, `data-allows-sorting`, `data-tree-column`. Recorded, not decisive.

The operative line: **an attribute is a runtime dependency when its value changes in response
to interaction, or is derived from measurement or async state — i.e. it cannot be written once
in static markup and left alone.** `data-placement` on a *positioned* overlay (Popover,
Tooltip, Select, ComboBox, Autocomplete, the date pickers, ColorPicker, Dropdown) is a
measurement and counts; `data-placement` on Modal and Drawer is a prop and does not.

`.stories.tsx` was excluded from every scan. Attributes appearing only inside `closest()`
selector strings were excluded — reading a host attribute is not setting one.

**Criteria 2–4 scan.** These are load-bearing, not a backstop. BlakeUI components are thin
wrappers over React Aria Components, so their keyboard maps, focus models and ARIA wiring live
in RAC, not in the BlakeUI source — grepping the wrapper for `onKeyDown` finds nothing. Each
component's RAC primitives were enumerated from its imports and scored against the ARIA APG
and the installed RAC/react-aria sources.

**Five components have zero hard `[data-*]` selectors and are still behavior-required:**

| Component | Why |
|---|---|
| **Form** | Ships no stylesheet at all. Its whole contribution is validation orchestration and moving focus to the first invalid field (criterion 3). |
| **ListBox** | Arrow/Home/End/PageUp/PageDown/type-ahead, a roving tabindex, and `aria-activedescendant` (2, 3, 4). Its state styling lives in `list-box-item.css`, which fetching the ListBox styles does not return. |
| **TagGroup** | Arrow navigation, Backspace/Delete removal, a roving tabindex, and focus recovery after a tag is removed (2, 3). Its state styling lives in `tag.css`. |
| **Toolbar** | The point of a toolbar is that many controls become one tab stop: roving tabindex plus arrow navigation (2, 3). `toolbar.css` has no runtime state whatsoever. |
| **ToggleButtonGroup** | Built on `useToolbar` — arrow navigation and a roving tabindex (2, 3). Its selected styling lives in `toggle-button.css`. |

---

## Verdicts

**42 behavior-required, 28 styles-sufficient, 70 total.**

Criteria column: 1 = runtime data attribute, 2 = keyboard, 3 = focus management,
4 = ARIA cross-reference.

| Component | Stylesheet | Completeness | Criteria | Hard `[data-*]` | Paired (degrades) |
|---|---|---|---|---|---|
| Accordion | `accordion.css` | **behavior-required** | 1,4 | `data-expanded` `data-hide-separator` `data-pressed` | `data-hovered` `data-focus-visible` |
| Alert | `alert.css` | styles-sufficient | — | — | — |
| AlertDialog | `alert-dialog.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-exiting` `data-placement="auto"` `data-placement="top"` `data-placement="center"` `data-placement="bottom"` | `data-focus-visible` `data-pressed` |
| Autocomplete | `autocomplete.css` | **behavior-required** | 1,2,3,4 | `data-focus` `data-invalid` `data-placeholder` `data-open` `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` `data-empty` | `data-hovered` `data-focus-visible` `data-disabled` `data-pressed` |
| Avatar | `avatar.css` | styles-sufficient | — | — | — |
| Badge | `badge.css` | styles-sufficient | — | — | — |
| Breadcrumbs | `breadcrumbs.css` | styles-sufficient | — | `data-current` | `data-hovered` |
| Button | `button.css` | styles-sufficient | — | `data-pending` | `data-focus-visible` `data-pressed` `data-hovered` |
| ButtonGroup | `button-group.css` | styles-sufficient | — | — | `data-pressed` `data-focus-visible` |
| Calendar | `calendar.css` | **behavior-required** | 1,2,3,4 | `data-open` `data-today` `data-selected` `data-outside-month` `data-unavailable` | `data-hovered` `data-pressed` `data-focus-visible` `data-disabled` |
| Card | `card.css` | styles-sufficient | — | — | — |
| Checkbox | `checkbox.css` | **behavior-required** | 1 | `data-selected` `data-indeterminate` `data-invalid` | `data-disabled` `data-focus-visible` `data-hovered` `data-pressed` |
| CheckboxGroup | `checkbox-group.css` | styles-sufficient | — | — | — |
| Chip | `chip.css` | styles-sufficient | — | — | — |
| CloseButton | `close-button.css` | styles-sufficient | — | `data-pending` | `data-focus-visible` `data-pressed` `data-hovered` |
| ColorArea | `color-area.css` | **behavior-required** | 1,2,3 | `data-disabled` `data-focus-visible` `data-dragging` | — |
| ColorField | `color-field.css` | **behavior-required** | 1,2 | `data-invalid` | — |
| ColorPicker | `color-picker.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` `data-disabled` |
| ColorSlider | `color-slider.css` | **behavior-required** | 1,2 | `data-dragging` `data-focus-visible` `data-disabled` | `data-disabled` |
| ColorSwatch | `color-swatch.css` | styles-sufficient | — | — | — |
| ColorSwatchPicker | `color-swatch-picker.css` | **behavior-required** | 1,2,3 | `data-disabled` `data-selected` `data-light-color` | `data-focus-visible` |
| ComboBox | `combo-box.css` | **behavior-required** | 1,2,3,4 | `data-invalid` `data-focus` `data-pressed` `data-open` `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-disabled` `data-hovered` `data-focus-visible` |
| DateField | `date-field.css` | **behavior-required** | 1,2,3 | `data-invalid` | — |
| DatePicker | `date-picker.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` `data-disabled` |
| DateRangePicker | `date-range-picker.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` `data-disabled` |
| Description | `description.css` | styles-sufficient | — | — | — |
| Drawer | `drawer.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-exiting` `data-placement="bottom"` `data-placement="top"` `data-placement="left"` `data-placement="right"` | `data-focus-visible` `data-pressed` |
| Dropdown | `dropdown.css` | **behavior-required** | 1,2,3,4 | `data-pending` `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` `data-pressed` |
| ErrorMessage | `error-message.css` | styles-sufficient | — | — | — |
| FancyButton | `fancy-button.css` | styles-sufficient | — | `data-pending` | `data-focus-visible` `data-pressed` `data-hovered` |
| FieldError | `field-error.css` | styles-sufficient | — | — | — |
| Fieldset | `fieldset.css` | styles-sufficient | — | — | — |
| Form | `—` | **behavior-required** | 3 | — | — |
| Input | `input.css` | **behavior-required** | 1 | `data-invalid` | `data-hovered` `data-focused` `data-focus-visible` `data-disabled` |
| InputGroup | `input-group.css` | **behavior-required** | 1 | `data-invalid` `data-disabled` | `data-hovered` `data-focus-within` |
| InputOTP | `input-otp.css` | **behavior-required** | 1,2,3 | `data-disabled` `data-active` `data-filled` `data-invalid` | `data-hovered` |
| Kbd | `kbd.css` | styles-sufficient | — | — | — |
| Label | `label.css` | styles-sufficient | — | `data-required` `data-disabled` `data-invalid` | — |
| Link | `link.css` | styles-sufficient | — | `data-default-icon` | `data-hovered` `data-pressed` `data-focus-visible` |
| ListBox | `list-box.css` | **behavior-required** | 2,3,4 | — | — |
| Meter | `meter.css` | styles-sufficient | — | — | `data-disabled` |
| Modal | `modal.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-exiting` `data-placement="auto"` `data-placement="top"` `data-placement="center"` `data-placement="bottom"` | `data-focus-visible` `data-pressed` |
| NumberField | `number-field.css` | **behavior-required** | 1,2,3 | `data-invalid` `data-disabled` | `data-hovered` `data-focus-within` `data-focus-visible` `data-pressed` `data-disabled` |
| Pagination | `pagination.css` | styles-sufficient | — | `data-active` | `data-focus-visible` `data-hovered` `data-pressed` |
| Popover | `popover.css` | **behavior-required** | 1,2,3,4 | `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` |
| ProgressBar | `progress-bar.css` | styles-sufficient | — | — | `data-disabled` |
| ProgressCircle | `progress-circle.css` | styles-sufficient | — | — | `data-disabled` |
| RadioGroup | `radio-group.css` | **behavior-required** | 1,2,3 | `data-selected` | `data-hovered` |
| RangeCalendar | `range-calendar.css` | **behavior-required** | 1,2,3,4 | `data-open` `data-today` `data-selected` `data-outside-month` `data-selection-start` `data-selection-end` `data-unavailable` | `data-hovered` `data-pressed` `data-focus-visible` `data-disabled` |
| ScrollShadow | `scroll-shadow.css` | **behavior-required** | 1 | `data-top-scroll` `data-bottom-scroll` `data-top-bottom-scroll` `data-left-scroll` `data-right-scroll` `data-left-right-scroll` | — |
| SearchField | `search-field.css` | **behavior-required** | 1,2,3 | `data-invalid` `data-empty` `data-disabled` | `data-hovered` `data-focus-within` |
| Select | `select.css` | **behavior-required** | 1,2,3,4 | `data-invalid` `data-focus` `data-placeholder` `data-open` `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-hovered` `data-focus-visible` `data-disabled` |
| Separator | `separator.css` | styles-sufficient | — | — | — |
| Skeleton | `skeleton.css` | styles-sufficient | — | — | — |
| Slider | `slider.css` | **behavior-required** | 1,2,3 | `data-dragging` `data-focus-visible` `data-disabled` `data-fill-start` `data-fill-end` | `data-disabled` |
| Spinner | `spinner.css` | styles-sufficient | — | — | — |
| Surface | `surface.css` | styles-sufficient | — | — | — |
| Switch | `switch.css` | **behavior-required** | 1 | `data-selected` | `data-disabled` `data-focus-visible` `data-hovered` `data-pressed` |
| Table | `table.css` | **behavior-required** | 1,2,3,4 | `data-selected` `data-allows-sorting` `data-disabled` `data-dragging` `data-drop-target` `data-tree-column` `data-resizing` | `data-hovered` `data-focus-visible` |
| Tabs | `tabs.css` | **behavior-required** | 1,2,3,4 | `data-selected` `data-disabled` `data-entering` `data-exiting` | `data-disabled` `data-hovered` `data-focus-visible` |
| TagGroup | `tag-group.css` | **behavior-required** | 2,3 | — | — |
| TextArea | `textarea.css` | **behavior-required** | 1 | `data-invalid` | `data-hovered` `data-focused` `data-focus-visible` `data-disabled` |
| TextField | `textfield.css` | **behavior-required** | 1 | `data-invalid` | — |
| TimeField | `time-field.css` | **behavior-required** | 1,2,3 | `data-invalid` | — |
| Toast | `toast.css` | **behavior-required** | 1,3,4 | `data-frontmost` `data-hidden` | `data-hovered` |
| ToggleButton | `toggle-button.css` | **behavior-required** | 1 | `data-selected` | `data-focus-visible` `data-hovered` `data-pressed` |
| ToggleButtonGroup | `toggle-button-group.css` | **behavior-required** | 2,3 | — | `data-pressed` `data-focus-visible` |
| Toolbar | `toolbar.css` | **behavior-required** | 2,3 | — | — |
| Tooltip | `tooltip.css` | **behavior-required** | 1,2,4 | `data-entering` `data-placement="top"` `data-placement="bottom"` `data-placement="left"` `data-placement="right"` `data-exiting` | `data-focus-visible` |
| Typography | `typography.css` | styles-sufficient | — | — | — |
### Judgement calls worth naming

- **Breadcrumbs → styles-sufficient.** `breadcrumbs.css` keys on `[data-current="true"]`, which
  React Aria computes from the item's position in the collection. But the value is fixed for a
  given markup: a hand-written port marks its last item and is done. No keyboard map beyond the
  browser's link handling, no focus management, no ARIA cross-reference.
- **Pagination → styles-sufficient.** Same shape. `data-active` is the caller's own routing
  state, and each link is its own tab stop.
- **Button / FancyButton / CloseButton → styles-sufficient.** `data-pending` is a pass-through
  of a caller-supplied boolean, not something the component computes.
- **Input, TextArea, TextField, InputGroup, SearchField, NumberField, ColorField, DateField,
  TimeField → behavior-required on `data-invalid` alone** (plus more, for several of them).
  The invalid ring is keyed on `[data-invalid="true"]` with no `:invalid` or `:user-invalid`
  arm anywhere in the stylesheet, so a CSS-only port silently loses validation styling. This
  is the smallest defensible reason on the list, and it is a real one.
- **CheckboxGroup → styles-sufficient.** A `role="group"` around checkboxes that are each their
  own tab stop. No roving tabindex, no arrow map, no runtime state in `checkbox-group.css`.
  (The individual **Checkbox** is behavior-required, on `data-selected` / `data-indeterminate` —
  and `indeterminate` has no HTML attribute at all, only a DOM property.)
- **RadioGroup → behavior-required**, in contrast, because a radio group is a single tab stop
  with a roving tabindex and selection-follows-focus.
- **Meter, ProgressBar, ProgressCircle → styles-sufficient.** The fill geometry is an inline
  style the author computes; that is not a `[data-*]` dependency and none of the other three
  criteria fire.
- **Avatar → styles-sufficient.** The image/fallback swap is an `onerror` handler, and no CSS
  rule keys on it.

---

## §1 — Build integrity

**Not broken. No copy fix is needed.** The failure the Pro repo hit — `buildStyles()` byte-copying
the source CSS entry into `dist/` without copying the component stylesheets, leaving 39 dangling
relative `@import`s — does not exist here. `packages/styles/scripts/copy-css.mjs` copies
`index.css` *and* recursively copies `base/`, `components/`, `themes/`, `utilities/` and
`variants/`, so the imports resolve.

### (a) Local build

```
dist/index.css → 92 relative @imports across 93 files → 0 dangling
```

Every relative `@import` was resolved against its own location, recursively, in both the source
tree and `dist/`. Both clean.

### (b) Published tarballs

Every published version of both packages was fetched from the npm registry, extracted, and put
through the same resolution check.

| Package | Versions checked | CSS files in `dist` | Dangling `@import`s |
|---|---|---|---|
| `@blakeui/styles` | 1.0.0, 1.0.1, 1.1.0, 1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.2.0, 1.3.0 | 94–96 | **0** in every version |
| `@blakeui/react` | 1.0.0, 1.0.1, 1.1.0, 1.1.1, 1.1.2, 1.1.3, 1.1.4, 1.2.0, 1.3.0 | 1 (`dist/styles.css`) | **0** in every version |

`@blakeui/react`'s CSS entry is a single bare `@import "@blakeui/styles"`, which resolves
through package exports to `@blakeui/styles`'s `dist/index.css` (clean-package rewrites the
`style` condition from `./index.css` to `./dist/index.css` at pack time). End-to-end check:
installing `@blakeui/react@1.3.0` from the registry into an empty project and compiling
`@import "@blakeui/react/styles"` with the Tailwind CLI produced a 417 KB stylesheet containing
`.tabs`, `.button`, `.accordion`, `.calendar` and `.combo-box`. **The published packages work.**

### How the free docs site consumes the CSS: **source, not dist**

`apps/docs/src/app/global.css` line 8 is `@import "@blakeui/styles";`. Resolution:

- `apps/docs/package.json` lists `@blakeui/styles: workspace:*`;
- `apps/docs/node_modules/@blakeui/styles` is a symlink to `packages/styles`;
- the *unpacked* `packages/styles/package.json` maps the `style` condition to `./index.css` —
  the source entry. `clean-package` only rewrites that to `./dist/index.css` at pack time;
- `next.config.ts`'s `transpilePackages: ["@blakeui/react", "@blakeui/styles"]` affects JS/TS
  only, and `tsconfig.json` declares no path aliases for either package.

Confirmed against the built docs CSS, not inferred: a sentinel rule appended to
`packages/styles/components/button.css` (source) appears in the compiled docs stylesheet; the
same sentinel appended to `packages/styles/dist/components/button.css` does not. Both were
reverted.

**So a working docs site proves nothing about the tarball.** The dist tree is exercised only by
consumers installing from npm — which is exactly how the Pro failure stayed invisible.

### The guard (proposed, not applied)

`proposed-styles-patch.diff` adds `packages/styles/scripts/assert-css-imports.mjs`, wired into
`scripts/build.mjs` between the CSS copy step and minification — inside the normal build, not as
a separate script. It resolves every relative `@import` reachable from `dist/index.css` and exits
non-zero listing any that dangle.

Verified by temporarily skipping the copy of `components/tabs.css`:

```
❌ 1 unresolved relative @import in dist:
   dist/components/index.css  →  ./tabs.css
❌ Build failed
Exit status 1
```

Restoring the copy made the build pass again.

**This lands in `@blakeui/styles`, so it is written to `proposed-styles-patch.diff` and not
applied.** No published version is affected — the assertion is a guard against a regression, not
a fix for one.

---

## §2 — CSS defects

Both patterns from the Pro audit appear here. Both fixes land in `@blakeui/styles` and are in
`proposed-styles-patch.diff`, **not applied**.

### (a) `:focus-visible:not(:focus)` — unsatisfiable

**38 occurrences across 27 component stylesheets.** A `:focus-visible` element always also
matches `:focus`, so `:not(:focus)` can never hold and the arm is dead. Every affected rule is
of the shape:

```css
&:focus-visible:not(:focus),
&[data-focus-visible="true"] {
  @apply status-focused;
}
```

Only the data-attribute arm ever fires — so the package focus ring appears when React Aria is
driving the component and never in a CSS-only port. `popover.css` already carries the corrected
form and a comment explaining exactly this; the fix applies the same correction everywhere else.

Affected: `accordion` `alert-dialog` `autocomplete`(3) `button` `button-group` `calendar`
`close-button` `color-picker`(2) `combo-box`(2) `date-picker`(2) `date-range-picker`(2) `drawer`
`dropdown`(2) `fancy-button` `input`(2) `link` `list-box-item` `menu-item` `modal` `number-field`
`range-calendar` `select`(3) `tabs` `textarea`(2) `toggle-button` `toggle-button-group`
`tooltip`. (`popover.css` was already correct and is untouched.)

Verified in Chrome against a compiled bundle. With the old selector, a keyboard-focused
`.button` reports `--tw-ring-shadow: 0 0 #0000` — no ring. With the fix it reports
`0 0 0 calc(2px + 2px) oklch(0.4863 0.0647 250.76)` and the ring renders.

### (b) `:focus-visible` on a `<label>` root

**3 occurrences:** `checkbox.css:123`, `switch.css:69`, `radio.css:51`.

React Aria Components renders `Checkbox`, `Switch` and `Radio` roots as `<label>` elements
wrapping a visually hidden `<input>` — confirmed in the installed RAC 1.17.0 source, where each
returns `createElement(…​.label, …)` with a `VisuallyHidden` input inside. Focus lands on the
input. `:focus-visible` matches the focused element only and does not propagate to ancestors, so:

```css
.checkbox:focus-visible &,          /* never matches */
.checkbox[data-focus-visible="true"] & {
  @apply status-focused;
}
```

The fix replaces the dead arm with `:has(:focus-visible)`, which reaches up from the focused
input.

Verified in Chrome with a real Tab keypress on markup replicating the RAC DOM and no data
attributes at all:

| | `root.matches(':focus-visible')` | `root.matches(':has(:focus-visible)')` | control ring |
|---|---|---|---|
| Checkbox | `false` | `true` | renders |
| Switch | `false` | `true` | renders |
| Radio | `false` | `true` | renders |

Only component stylesheets were touched. No docs overrides were changed.

---

## §11 — Cross-repo check (read-only, nothing changed in Pro)

Read `~/Projects/blakeui-pro/apps/docs/content/docs/components/meta.json` and the 40 component
MDX files beside it.

**No completeness verdicts are recorded anywhere in the Pro repo.** Searching the whole tree
(excluding `node_modules` and its own worktrees) for `completeness`, `behavior-required`,
`styles-sufficient`, `behaviorRequired` and `stylesSufficient` returns nothing. The Pro audit's
verdicts were not written back into the repository, so there is nothing to disagree *with* —
this section reports the comparison surface rather than a set of conflicts.

### Components listed in both catalogs

One name overlaps: **`tooltip`**. It is **not the same component**. Pro's `tooltip` is filed
under *Utility* alongside `chart-chrome` and `legend`, and its own description names it "the
panel every chart shows on hover" — a chart tooltip panel, driven from a data payload. Free's
`Tooltip` is the hover/focus hint built on RAC `TooltipTrigger`. Shared slug, different widget;
**no verdict conflict.**

### Free components that Pro components wrap

Derived from `@blakeui/react` imports in `~/Projects/blakeui-pro/packages/react/src/components/*`:

| Pro component | Wraps (free) | Free verdicts |
|---|---|---|
| `cell-color-picker` | ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker | all behavior-required except ColorSwatch (styles-sufficient) |
| `cell-select` | ListBox, Select | both behavior-required |
| `cell-slider` | Slider | behavior-required |
| `cell-switch` | Switch | behavior-required |
| `checkbox-button-group` | Checkbox, CheckboxGroup, Description, Label | Checkbox behavior-required; CheckboxGroup, Description, Label styles-sufficient |
| `data-grid` | Button, Checkbox, Input, Popover, Table | Checkbox, Input, Popover, Table behavior-required; Button styles-sufficient |
| `dock` | Toolbar | behavior-required |
| `drop-zone` | Button | styles-sufficient |
| `file-tree` | Checkbox | behavior-required |
| `inline-select` | Description, Header, ListBox, Select | ListBox, Select behavior-required; Description styles-sufficient (Header is not a catalog entry) |
| `kpi` | Button, Card, ProgressBar, Separator | all styles-sufficient |
| `legend` | ProgressBar | styles-sufficient |
| `list-view` | Checkbox | behavior-required |
| `number-stepper` | Button | styles-sufficient |
| `radio-button-group` | Description, Label, Radio, RadioGroup | RadioGroup behavior-required; Description, Label styles-sufficient (Radio is not a catalog entry) |
| `rich-text-editor` | Button, Input, Label, Popover, Separator, TextField, ToggleButton, Toolbar, Tooltip | Input, Popover, TextField, ToggleButton, Toolbar, Tooltip behavior-required; Button, Label, Separator styles-sufficient |
| `trend-chip` | Chip | styles-sufficient |

**Disagreements found: none** — because Pro records no verdicts to disagree with.

**Two observations worth carrying back to Pro, changing nothing here:**

1. Nine of the seventeen wrapping Pro components pull in at least one behavior-required free
   component. A Pro component that wraps ListBox, Select, Table, Toolbar or Popover inherits
   that component's keyboard map, roving tabindex and ARIA wiring — which means it cannot be
   `styles-sufficient` either, whatever its own stylesheet looks like. When Pro adopts a
   `completeness` field, wrapping a behavior-required component should force the wrapper to
   behavior-required.
2. `Header` and `Radio` are imported from `@blakeui/react` by Pro components but are not
   catalog entries in the free docs, so the MCP cannot classify them. `Radio` in particular has
   the same `<label>`-root focus defect as Checkbox and Switch — §2(b) fixes `radio.css`
   alongside them even though RadioGroup is the catalog-facing entry.

---

## What shipped in this repo

Everything below is outside `@blakeui/styles` and was applied.

- **`completeness` on every catalog entry.** Source of truth:
  `apps/react-mcp/src/shared/behavior/contracts.ts` — 70 entries, each with its verdict, the
  criteria that fired, and a full interaction contract for the behavior-required ones. Stamped
  into `components.json` and `ctx.json` at extraction time, returned by every API endpoint and
  every MCP tool that returns component metadata, and mirrored into each component page's MDX
  frontmatter. A test fails if any entry lacks it, and a second test fails if the docs and the
  MCP disagree.
- **`get_component_behavior(component)`** — a new MCP tool returning the framework-neutral
  contract: roles and ARIA per element, the complete keyboard map, focus rules including roving
  tabindex, activation mode and its default, DOM state reflection, and the data-attribute
  contract. For `styles-sufficient` components it returns a short answer saying the CSS is the
  whole component.
- **The gate.** `get_component_source_styles` errors for behavior-required components unless
  `behavior_source` is passed: `"blake"` returns the styles, `"self"` returns the contract first
  and the styles after it. The gate is on the `/v1/components/styles` endpoint as well as the
  tool wrapper, so the Pro Worker's proxied calls hit it too. `styles-sufficient` stays ungated.
  The legacy `/components/styles` route is deliberately left ungated — published MCP clients on
  the old API do not know the parameter, and breaking them would trade one silent failure for a
  loud one.
- **Regression fixture.** `apps/react-mcp/src/mcp/tools/get-component-source-styles.test.ts`
  with the incident write-up beside it in
  `apps/react-mcp/src/mcp/tools/fixtures/tabs-css-only-port-incident.md`.
- **Version stamping.** Every MCP response ends with the BlakeUI version the data was generated
  from plus the MCP server version, both read from `package.json` — `packages/react`'s version
  via the extractor and the API, and `@blakeui/react-mcp`'s via the tsup build define. The
  development fallback now reads `package.json` too, so no version literal is written by hand.
- **Server instructions** rewritten around the styles-vs-behavior distinction.
- **MDX assertion.** No component MDX served through the docs tool may contain a ` ```css `
  fence. 72 existed, in 70 files: 66 identical "Customizing the component classes" blocks whose
  content the [Styling handbook](apps/docs/content/docs/en/react/getting-started/(handbook)/styling.mdx)
  already documents, and 6 in `skeleton.mdx` and `card.mdx` that were paste-ups of the package's
  own stylesheet. All removed; the sections now point at the handbook, and Skeleton's animation
  and global-configuration sections were rewritten as tables. Those blocks were the hazard in
  miniature — `.checkbox__control { … data-[selected=true]:bg-blue-500 }` in a docs page reads
  like an implementation and is not one.
