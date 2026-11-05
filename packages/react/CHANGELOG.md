# @blakeui/react

## 1.5.0

### Minor Changes

Syncs `@blakeui/react` with the dependency updates and bug fixes from HeroUI v3.1.0 → v3.2.7. Breaking changes, new components and `@blakeui/styles` changes from that range are not included and land in 2.0. See `UPSTREAM.md` for the baseline, the rename map and what is still pending.

#### Upgrade note

If your app depends on `react-aria-components` or `react-aria` directly, update them to `1.22.1` and `3.53.1` in the same install. Otherwise your app gets two copies of React Aria, which breaks components: shared contexts no longer reach across the copies. For example, a React Aria `NumberField` from your copy cannot slot `@blakeui/react` buttons, and the page throws `Invalid slot "decrement"`. If you also depend on `@react-aria/i18n`, `@react-aria/ssr` or `@react-aria/utils`, use versions that resolve to the same `react-aria` (`3.13.1`, `3.10.1`, `3.34.1`).

#### Dependencies

- `react-aria-components` 1.17.0 → 1.22.1; `react-aria` 3.53.1 is now a direct dependency
- `tailwind-variants` 3.2.2 → 3.3.1
- `@react-types/shared` 3.34.0 → 3.37.0, `@react-stately/utils` 3.12.0 → 3.12.1
- `@react-aria/i18n` 3.13.0 → 3.13.1, `@react-aria/ssr` 3.10.0 → 3.10.1, `@react-aria/utils` 3.34.0 → 3.34.1 (these now re-export `react-aria`, so they no longer pull in a second copy)
- `input-otp` 1.4.2 → 1.5.0, `@radix-ui/react-avatar` 1.1.11 → 1.3.1
- `react-aria` and its subpaths are externalized in the build, so the package resolves your installed copy instead of bundling one
- Export conditions now list `types` first and end with a `default` fallback, so `moduleResolution: node16` / `nodenext` resolve correctly
- License metadata is now `Apache-2.0`, matching the repository `LICENSE`. The package also ships `LICENSE` and `NOTICE`

#### Fixes

- **CloseButton**: no longer overrides an explicit `aria-label` or a label provided by its slot context, and sets `type="button"`, so clear and close buttons no longer submit a surrounding form
- **Fieldset**: `isDisabled` reaches Button, CheckboxGroup, Link, RadioGroup, Slider, ToggleButton and ToggleButtonGroup inside the fieldset
- **Drawer**: recovers from a cancelled swipe without staying displaced or stuck in a drag state, runs the exit slide after a swipe, and scopes drag gestures to the nearest owning drawer
- **ScrollShadow**: tolerates fractional scroll positions, re-measures when content changes inside a fixed-size container, fires `onVisibilityChange` only on real transitions, clears stale shadows when disabled, and merges consumer `style`
- **Spinner**: the accessible name moves from the hidden SVG to a `status` role on the root
- **TagGroup, Description, ErrorMessage**: compatible with React Aria's collection builder, so help text inside a TagGroup waits for its slot
- **Icons**: decorative `aria-hidden` icons no longer carry an `aria-label` that is never announced
- **Performance**: context values memoized across components, merged refs memoized, and static class names resolved without render-prop indirection
- **Display names**: component parts use `BlakeUI.Component.SubPart`
- **React 19**: `use()` replaces `useContext`, and `ref` is passed as a normal prop

## 3.0.1

### Patch Changes

- README updated

- Updated dependencies []:
  - @blakeui/styles@3.0.1

## 3.0.0

### Patch Changes

- v3.0.0

- [`b2b1912`](https://github.com/blakeui-inc/blakeui/commit/b2b19129ec5ae7bcd432bcd89f78c4c25c7ee9ae) Thanks [@jrgarciadev](https://github.com/jrgarciadev)! - Types fixed and removed needless folders from dist

- Updated dependencies []:
  - @blakeui/styles@3.0.0

## 3.0.0-alpha.3

### Patch Changes

- Types fixed and removed needless folders from dist

## 3.0.0-alpha.2

### Patch Changes

- Set up alpha prerelease configuration to ensure v3 remains in alpha status and prevent accidental release of v3.0.0 stable version
