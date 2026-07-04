import type {ThemeId} from "./theme-values";

/**
 * BlakeUI's shipped default theme, mirrored token-for-token from
 * packages/styles/themes/default/variables.css — the single source of truth.
 *
 * When the builder's state matches the Default preset exactly
 * (findMatchingTheme → "default"), every emit path serves these values
 * verbatim instead of generator output: the generator's tables remain tuned
 * for the other presets and custom themes, and its formulas structurally
 * cannot reproduce the shipped theme's per-token hues and chromas
 * (see generate-theme-colors.ts).
 *
 * Bare var() aliases from the source file are resolved to their literals
 * (--white / --snow / --eclipse / --foreground / --muted / --accent) so the
 * values work identically in scoped previews and in the exported CSS. The one
 * exception is --scrollbar, which keeps the translucent color-mix formula
 * verbatim — it must track --foreground at the point of use. Tokens the
 * shipped dark block does not redeclare are filled with their inherited
 * (light-block, dark-cascade-resolved) values so both records cover the full
 * set the generator emits.
 *
 * Sync guard: apps/docs/scripts/check-shipped-theme-sync.mjs re-parses the
 * shipped stylesheet and this file on predev/prebuild and fails on drift.
 * Keep each token on its own line as "--name": "value" — the guard parses
 * this file textually.
 */
export const SHIPPED_DEFAULT_VARS: Record<"dark" | "light", Record<string, string>> = {
  dark: {
    "--accent": "oklch(0.4863 0.0647 250.76)",
    "--accent-foreground": "oklch(0.9911 0 0)",
    "--background": "oklch(0.3092 0 0)",
    "--border": "oklch(28% 0.006 286.033)",
    "--danger": "oklch(0.4877 0.1944 30.2)",
    "--danger-foreground": "oklch(0.9911 0 0)",
    "--default": "oklch(27.4% 0.006 286.033)",
    "--default-foreground": "oklch(0.9911 0 0)",
    "--field-background": "oklch(0.2103 0.0059 285.89)",
    "--field-border": "transparent",
    "--field-foreground": "oklch(0.9911 0 0)",
    "--field-placeholder": "oklch(70.5% 0.015 286.067)",
    "--focus": "oklch(0.4863 0.0647 250.76)",
    "--foreground": "oklch(0.9911 0 0)",
    "--muted": "oklch(70.5% 0.015 286.067)",
    "--overlay": "oklch(0.2103 0.0059 285.89)",
    "--overlay-foreground": "oklch(0.9911 0 0)",
    "--scrollbar": "color-mix(in oklch, var(--foreground) 15%, transparent)",
    "--segment": "oklch(0.3964 0.01 285.93)",
    "--segment-foreground": "oklch(0.9911 0 0)",
    "--separator": "oklch(25% 0.006 286.033)",
    "--success": "oklch(0.7329 0.1935 150.81)",
    "--success-foreground": "oklch(0.2103 0.0059 285.89)",
    "--surface": "oklch(0.2103 0.0059 285.89)",
    "--surface-foreground": "oklch(0.9911 0 0)",
    "--surface-secondary": "oklch(0.257 0.0037 286.14)",
    "--surface-secondary-foreground": "oklch(0.9911 0 0)",
    "--surface-tertiary": "oklch(0.2721 0.0024 247.91)",
    "--surface-tertiary-foreground": "oklch(0.9911 0 0)",
    "--warning": "oklch(0.8203 0.1388 76.34)",
    "--warning-foreground": "oklch(0.2103 0.0059 285.89)",
  },
  light: {
    "--accent": "oklch(0.4863 0.0647 250.76)",
    "--accent-foreground": "oklch(0.9911 0 0)",
    "--background": "oklch(0.982 0.0041 91.45)",
    "--border": "oklch(90% 0.004 286.32)",
    "--danger": "oklch(0.4877 0.1944 30.2)",
    "--danger-foreground": "oklch(0.9911 0 0)",
    "--default": "oklch(91.82% 0.0068 97.36)",
    "--default-foreground": "oklch(0.2103 0.0059 285.89)",
    "--field-background": "oklch(100% 0 0)",
    "--field-border": "transparent",
    "--field-foreground": "oklch(0.2103 0.0059 285.89)",
    "--field-placeholder": "oklch(0.5517 0.0138 285.94)",
    "--focus": "oklch(0.4863 0.0647 250.76)",
    "--foreground": "oklch(0.3172 0.0214 281.35)",
    "--muted": "oklch(0.5517 0.0138 285.94)",
    "--overlay": "oklch(100% 0 0)",
    "--overlay-foreground": "oklch(0.3172 0.0214 281.35)",
    "--scrollbar": "color-mix(in oklch, var(--foreground) 15%, transparent)",
    "--segment": "oklch(100% 0 0)",
    "--segment-foreground": "oklch(0.2103 0.0059 285.89)",
    "--separator": "oklch(92% 0.004 286.32)",
    "--success": "oklch(0.7329 0.1935 150.81)",
    "--success-foreground": "oklch(0.2103 0.0059 285.89)",
    "--surface": "oklch(100% 0 0)",
    "--surface-foreground": "oklch(0.3172 0.0214 281.35)",
    "--surface-secondary": "oklch(0.9524 0.0013 286.37)",
    "--surface-secondary-foreground": "oklch(0.3172 0.0214 281.35)",
    "--surface-tertiary": "oklch(0.9373 0.0013 286.37)",
    "--surface-tertiary-foreground": "oklch(0.3172 0.0214 281.35)",
    "--warning": "oklch(0.7819 0.1585 72.33)",
    "--warning-foreground": "oklch(0.2103 0.0059 285.89)",
  },
};

/**
 * Shared Default-detection branch for all theme-variable emit paths
 * (use-computed-theme-vars, use-css-sync, generate-css-variables).
 *
 * Returns fresh copies of the shipped variable records when the current
 * builder state IS the Default preset, so BlakeUI's brand theme is exact;
 * undefined sends every other preset and custom theme down the generated
 * path unchanged. Copies keep callers (which may spread or mutate their
 * records) from ever touching the module constant.
 */
export function getShippedThemeVariables(
  matchingThemeId: ThemeId | undefined,
): {dark: Record<string, string>; light: Record<string, string>} | undefined {
  if (matchingThemeId !== "default") {
    return undefined;
  }

  return {
    dark: {...SHIPPED_DEFAULT_VARS.dark},
    light: {...SHIPPED_DEFAULT_VARS.light},
  };
}
