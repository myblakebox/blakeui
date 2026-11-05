# Upstream: HeroUI

BlakeUI's `@blakeui/react` and `@blakeui/styles` are a fork of HeroUI v3
(`heroui-inc/heroui`, branch `v3`, Apache-2.0). This file records where the fork
started, what has been synced since, and where BlakeUI deliberately differs, so a
future sync can start from facts instead of archaeology.

## Baseline

| | Tag | Commit | Date |
|---|---|---|---|
| **Forked from** | `v3.1.0` | `03dc5eec4` | 2026-05-25 |
| **Sync target** | `v3.2.7` | `7cb164260` | 2026-10-28 |

The fork landed in BlakeUI as a single squashed commit (`da40096`, 2026-06-07), so
the baseline was recovered by comparison rather than read from history:

- The dependency pins in that commit match `v3.1.0` exactly
  (`react-aria-components` 1.17.0, `tailwind-variants` 3.2.2, `tailwindcss` 4.3.0 in
  styles, `@react-types/color` 3.2.0).
- After name normalization, `packages/react/src` + `packages/styles` differ from
  `v3.1.0` by 67 source lines, all of them BlakeUI branding. `v3.0.5` differs by 787;
  every commit between `v3.1.0` and `v3.2.0` differs by 112 or more.

## Method

1. Clone `heroui-inc/heroui` and export `packages/react` + `packages/styles` at the
   baseline tag and the target tag.
2. Normalize both snapshots with `scripts/upstream/normalize.sed`
   (`scripts/upstream/rename-map.tsv` is the same map as a table).
3. Commit both normalized snapshots in a scratch repository and diff them with
   `--full-index`, so `git apply --3way` has real preimage blobs. Point
   `GIT_ALTERNATE_OBJECT_DIRECTORIES` at the scratch repository's objects instead
   of writing them into this repository.
4. Redirect the patch for
   `disclosure-group/use-disclosure-group-navigation.ts` to
   `accordion/use-disclosure-group-navigation.ts` (BlakeUI moved the hook when it
   removed Disclosure).
5. Apply per file, classify each change, and land it in buckets:
   - **A**: dependencies and build
   - **B**: fixes and performance
   - **C**: breaking API
   - **D**: new features
   - **E**: `@blakeui/styles` only (needs sign-off)
   - **F**: conflicts with an intentional BlakeUI divergence

### Rename map (summary)

| HeroUI | BlakeUI |
|---|---|
| `@heroui/*`, `heroui` | `@blakeui/*`, `blakeui` |
| `HeroUI` (brand, `displayName`, types) | `BlakeUI` |
| `HEROUI_*` | `BLAKEUI_*` |
| `heroui-assets.nyc3.cdn.digitaloceanspaces.com/` | `cdn.blakeui.com/` |
| `img.heroui.chat/image/avatar?…&u=N` | `cdn.blakeui.com/avatars/users/N.jpg` |
| `github.com/heroui-inc/heroui` | `github.com/myblakebox/BlakeUI` |
| `import {Icon} from "@iconify/react"` (stories) | `import {Icon} from "../iconify"` |

BEM classes, `data-slot` values, CSS custom properties, file names and export
names are identical and need no transform.

## Sync log

| Branch | Upstream range | Buckets | BlakeUI version |
|---|---|---|---|
| `sync/upstream-deps-fixes` | `v3.1.0..v3.2.7` | A (partial), B (partial) | 1.5.0 |

Still to sync from `v3.1.0..v3.2.7`:

- **Bucket B, deferred:** overlay exit-hold and the overlay-motion fixes. They are
  coupled to styles and to reduced motion.
- **Bucket C:** the breaking changes, including the toggle `*.Content` composition.
- **Bucket D:** the new components and features.
- **Bucket E:** the styles changes.
- **Tests:** upstream's behavioural test suite and its `packages/testing` harness.
- **Blocked dependency removals:** drop `tailwind-merge` once `@blakeui/styles` moves to
  tailwind-variants ≥3.3 (3.2.2 imports it at runtime). Drop `@react-aria/i18n` once the
  calendar year picker is rewritten onto `react-aria/useCalendar`.

## BlakeUI-only

| Kind | Item |
|---|---|
| Component | `FancyButton` (`@blakeui/react` + `@blakeui/styles`) |
| Icons | `components/iconify.tsx`, `components/icon-map.ts` (stories use these instead of `@iconify/react`) |
| Font | `styles/base/fonts.css`, `styles/fonts/figtree-*.woff2`, Figtree `--font-sans` in `themes/shared/theme.css` |
| Build | `styles/scripts/assert-css-imports.mjs`, `styles/scripts/sync-readme-theme-vars.mjs` |
| Dependency | `@iconify-json/ic` |
| Removed | `Disclosure` and `DisclosureGroup` (the navigation hook now lives in `accordion/`) |
| Removed | `@react-types/color` (types come from `react-aria-components`) |

## Intentional divergences

When a sync touches one of these, the column on the right decides the merge.

| Divergence | Winner | Why |
|---|---|---|
| `@react-types/color` removed (PR #46) | **BlakeUI** | Upstream still pins 3.2.0, which pulls in about 121 MB of Adobe Spectrum for six type aliases. Reject any hunk that re-adds it. |
| Disclosure / DisclosureGroup removed | **BlakeUI** | Drop upstream hunks for them, their CSS and their tests. Redirect the navigation-hook hunk to `accordion/`. |
| Focus-ring fix (`3091abc`, plain `:focus-visible`) | **Upstream selector** | Upstream made the same change in 3.2.5 and scoped it in 3.2.6, because a plain `:focus-visible` rings ListBox/Dropdown/Select items on mouse open. `:focus-visible:not([data-focused])` keeps BlakeUI's goal (rings in CSS-only ports). Move `:has(:focus-visible)` from toggle roots to `*.Content` when the toggles migrate. |
| Reduced motion: "gentler, not off" | **BlakeUI intent, upstream mechanics** | Adopt opacity/transform-only overlays and the Switch thumb jitter fix, but keep BlakeUI's reduced-motion rules. |
| Theme tokens: palette, AA contrast, warm borders, theme-aware `--focus`, radius 0.25rem | **BlakeUI values** | Add upstream's new tokens with BlakeUI values. |
| Fancy Button layers, ButtonGroup, ToggleButton | **BlakeUI** | Take upstream's `will-change` scoping and the accent focus gap only. |
| Tabs radius and the docs `action-bar-card.tsx` indicator workaround | **BlakeUI** | Take upstream's `data-animation-ready` hook. Keep the docs workaround until it is retested on RAC 1.22.1. |
| ListBox edge focus-ring clipping fix | **Both** | Merge upstream's block-flow virtualizer fix with BlakeUI's padding fix. |
| Table primary variant (floating card) | **BlakeUI** | Take upstream's structural fixes (RTL `end-0`, virtualizer borders); keep BlakeUI's look. |
| Figtree font, Iconify wrapper | **BlakeUI** | Handled by the rename map and the BlakeUI-only list. |
| `useKeyPress` composite-widget guard (docs) | n/a | Lives in `apps/docs`, outside the synced packages. |
| License metadata | **Upstream** | The root `LICENSE` has been Apache-2.0 since the fork; `package.json` now says so too. |
