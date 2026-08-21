# @blakeui/styles

The core BlakeUI styles package containing CSS files for components, themes, and utilities. This package provides the foundation for BlakeUI's design system using Tailwind CSS v4 and is framework-agnostic.

## Documentation

It's the [blakeui.com](https://blakeui.com) website for the latest version of BlakeUI.

- **Latest (v3)**: [https://blakeui.com](https://blakeui.com)
- **v2**: [https://v2.blakeui.com](https://v2.blakeui.com)

## Installation

```bash
npm install @blakeui/styles
# or
pnpm add @blakeui/styles
# or
yarn add @blakeui/styles
```

## Usage

### Basic Setup

Import the BlakeUI styles in your main CSS file:

```css
@import "@blakeui/styles";
```

This will import:

- Tailwind CSS base styles
- BlakeUI component styles
- BlakeUI utilities
- Default theme variables
- Animation utilities from tw-animate-css

### Package Structure

The package exports CSS files organized into:

```
@blakeui/styles/
├── index.css          # Main entry point
├── base/              # Base styles and CSS variables
│   └── base.css       # Layout tokens, typography, scrollbar
├── components/        # Component-specific styles
│   ├── accordion.css
│   ├── avatar.css
│   ├── button.css
│   ├── chip.css
│   ├── link.css
│   ├── popover.css
│   └── tooltip.css
├── themes/            # Theme definitions
│   ├── default/       # Default theme
│   │   ├── index.css  # Theme entry point
│   │   └── variables.css  # Theme variables (light/dark)
│   └── shared/        # Shared theme utilities
│       └── theme.css  # Calculated variables and utilities
└── utilities/         # Utility classes
    ├── backdrop.css
    └── index.css
```

### Importing Specific Components

Instead of importing everything, you can import only what you need:

```css
/* Import Tailwind CSS base */
@import "tailwindcss";

/* Import only specific components */
@import "@blakeui/styles/components/button.css" layer(components);
@import "@blakeui/styles/components/chip.css" layer(components);

/* Import theme */
@import "@blakeui/styles/themes/default" layer(base);
```

### Component Classes

Components use a BEM-like naming convention:

- Base: `.button`
- Variants: `.button--primary`, `.button--danger`
- Sizes: `.button--sm`, `.button--lg`
- Modifiers: `.button--icon-only`

#### Button Example

```html
<!-- Basic button -->
<button class="button">Click me</button>

<!-- Primary variant -->
<button class="button button--primary">Save</button>

<!-- Small size -->
<button class="button button--sm">Small</button>

<!-- Icon-only button -->
<button class="button button--icon-only">
  <svg>...</svg>
</button>

<!-- Combining classes -->
<button class="button button--primary button--sm">Small Primary</button>
```

### Themes

The default theme provides automatic light/dark mode support:

- **Light mode**: Applied by default to `:root`
- **Dark mode**: Applied with `.dark` class or `[data-theme="dark"]` attribute

```html
<!-- Dark mode with class -->
<html class="dark">
  <!-- Dark mode with data attribute -->
  <html data-theme="dark"></html>
</html>
```

### CSS Variables

The package provides a comprehensive set of CSS variables for customization:

#### Layout Tokens

<!-- theme-vars:layout -->

```css
:root {
  /* Spacing */
  --spacing: 0.25rem;

  /* Border */
  --border-width: 1px;
  --field-border-width: 0px;
  --disabled-opacity: 0.5;

  /* Ring offset - Used for focus ring */
  --ring-offset-width: 2px;

  /* Cursor */
  --cursor-interactive: pointer;
  --cursor-disabled: not-allowed;

  /* Radius */
  --radius: 0.5rem;
  --field-radius: calc(var(--radius) * 1.5);
}
```

<!-- /theme-vars:layout -->

#### Theme Colors

<!-- theme-vars:colors -->

```css
:root {
  /* Primitive Colors (Do not change between light and dark) */
  --white: oklch(100% 0 0);
  --black: oklch(0% 0 0);
  --snow: oklch(0.9911 0 0);
  --eclipse: oklch(0.2103 0.0059 285.89);

  /* Base Colors */
  --background: oklch(0.982 0.0041 91.45); /* #FAF9F6 */
  --foreground: oklch(0.3172 0.0214 281.35); /* #30313D */

  /* Surface: Used for non-overlay components (cards, accordions, disclosure groups) */
  --surface: var(--white);
  --surface-foreground: var(--foreground);
  --surface-secondary: oklch(0.9524 0.0013 286.37);
  --surface-secondary-foreground: var(--foreground);
  --surface-tertiary: oklch(0.9373 0.0013 286.37);
  --surface-tertiary-foreground: var(--foreground);

  /* Overlay: Used for floating/overlay components (tooltips, popovers, modals, menus) */
  --overlay: var(--white);
  --overlay-foreground: var(--foreground);

  /* Muted & Scrollbar */
  --muted: oklch(0.5 0.0138 285.94);
  --scrollbar: var(--scrollbar-thumb);
  --scrollbar-thumb: color-mix(in oklch, var(--foreground) 15%, transparent);
  --scrollbar-track: transparent;

  /* Interactive Colors */
  --default: oklch(91.82% 0.0068 97.36); /* #E5E4DF */
  --default-foreground: var(--eclipse);
  --accent: oklch(0.4863 0.0647 250.76); /* #436283 */
  --accent-foreground: var(--snow);

  /* Status Colors */
  --success: oklch(0.7329 0.1935 150.81);
  --success-foreground: var(--eclipse);
  --warning: oklch(0.7819 0.1585 72.33);
  --warning-foreground: var(--eclipse);
  --danger: oklch(0.4877 0.1944 30.2); /* #B40E00 */
  --danger-foreground: var(--snow);

  /* Component Colors */
  --segment: var(--white);
  --segment-foreground: var(--eclipse);

  /* Misc Colors */
  --border: oklch(90% 0.008 97.36);
  --separator: oklch(92% 0.008 97.36);
  --focus: var(--accent);
  --link: var(--foreground);
  --backdrop: rgba(0, 0, 0, 0.5);

  /* Shadows */
  --surface-shadow:
    0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06),
    0 0 1px 0 rgba(0, 0, 0, 0.06);
  --overlay-shadow:
    0 2px 8px 0 rgba(0, 0, 0, 0.06), 0 -6px 12px 0 rgba(0, 0, 0, 0.03),
    0 14px 28px 0 rgba(0, 0, 0, 0.08);
  --field-shadow:
    0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.06),
    0 0 1px 0 rgba(0, 0, 0, 0.06);
}

.dark,
[data-theme="dark"] {
  /* Base Colors */
  --background: oklch(0.3092 0 0); /* #303030 */
  --foreground: var(--snow);

  /* Surface: Used for non-overlay components (cards, accordions, disclosure groups) */
  --surface: oklch(0.2103 0.0059 285.89);
  --surface-foreground: var(--foreground);
  --surface-secondary: oklch(0.257 0.0037 286.14);
  --surface-tertiary: oklch(0.2721 0.0024 247.91);

  /* Overlay: Used for floating/overlay components (tooltips, popovers, modals, menus) */
  --overlay: oklch(0.2103 0.0059 285.89);
  --overlay-foreground: var(--foreground);

  /* Muted & Scrollbar */
  --muted: oklch(70.5% 0.015 286.067);
  --scrollbar: var(--scrollbar-thumb);
  --scrollbar-thumb: color-mix(in oklch, var(--foreground) 15%, transparent);
  --scrollbar-track: transparent;

  /* Interactive Colors */
  --default: oklch(27.4% 0.006 286.033);
  --default-foreground: var(--snow);

  /* Status Colors */
  --warning: oklch(0.8203 0.1388 76.34);
  --warning-foreground: var(--eclipse);
  --danger: oklch(0.4877 0.1944 30.2); /* #B40E00 */
  --danger-foreground: var(--snow);

  /* Component Colors */
  --segment: oklch(0.3964 0.01 285.93);
  --segment-foreground: var(--foreground);

  /* Misc Colors */
  --border: oklch(28% 0.006 286.033);
  --separator: oklch(25% 0.006 286.033);
  --focus: oklch(0.7 0.09 250.76); /* lightened accent: --accent is 2.08:1 on dark --background */
  --link: var(--foreground);
  --backdrop: rgba(0, 0, 0, 0.6);

  /* Shadows */
  --surface-shadow: 0 0 0 0 transparent inset; /* No shadow on dark mode */
  --overlay-shadow: 0 0 1px 0 rgba(255, 255, 255, 0.3) inset;
  --field-shadow: 0 0 0 0 transparent inset; /* Transparent shadow to allow ring utilities to work */
}
```

<!-- /theme-vars:colors -->

**Note**: The `.dark` block redeclares only the tokens shown above; every other token inherits its `:root` value. Tokens listed once (`--accent`, `--success`, the primitives) are therefore shared by both modes.

#### Field Tokens

<!-- theme-vars:field -->

```css
:root {
  /* Form field defaults */
  --field-background: var(--white);
  --field-foreground: oklch(0.2103 0.0059 285.89);
  --field-placeholder: var(--muted);
  --field-border: transparent; /* no border by default on form fields */
  --field-border-width: 0px;
  --field-radius: calc(var(--radius) * 1.5);
}

.dark,
[data-theme="dark"] {
  /* Form field defaults */
  --field-background: oklch(0.2103 0.0059 285.89);
  --field-foreground: var(--foreground);
}
```

<!-- /theme-vars:field -->

Providing any of these knobs automatically updates the generated utilities (`bg-field`, `placeholder:text-field-placeholder`, `rounded-field`, etc.) along with the calculated hover/focus variants.

#### Calculated Variables

The theme also provides calculated variables for hover states, soft colors, and surface levels (defined in `themes/shared/theme.css`):

- **Hover states**: `--color-accent-hover`, `--color-success-hover`, `--color-warning-hover`, `--color-danger-hover`, `--color-default-hover`
- **Soft colors**: `--color-accent-soft`, `--color-danger-soft`, `--color-warning-soft`, `--color-success-soft` (with their foreground and hover variants)
- **Surface levels**: `--color-surface-secondary`, `--color-surface-tertiary`
- **Radius scale**: `--radius-xs` through `--radius-4xl` (calculated from `--radius`)
- **Transition timing functions**: Various easing curves like `--ease-smooth`, `--ease-out-fuild`, etc.

## Dependencies

- **Tailwind CSS v4+**: Required peer dependency
- **tw-animate-css**: Provides animation utilities

## Build Output

The package provides:

- `index.css`: Main unminified CSS file
- `blakeui.min.css`: Minified production-ready CSS (generated during build)

## Framework Integration

This package is designed to work with any framework. For React-specific components, use `@blakeui/react` which builds on top of these core styles.

## License

MIT
