import presetData from "./theme-presets.data.json";

// The 11 preset definitions live in theme-presets.data.json, the single source
// both consumers read: this module (the theme builder, at runtime) and
// apps/docs/scripts/build-theme-presets.mjs (which emits theme-presets.css).
// Editing a preset means editing that JSON — nothing else carries these numbers.

// 0.0041 mirrors the shipped light background's chroma (variables.css:
// oklch(0.982 0.0041 91.45)) — the generator pins background L at 0.9702 and
// ties its hue to the accent hue, so chroma is the only base-matchable axis.
// Read off the Default preset so the slider default cannot drift from it.
export const DEFAULT_BASE: number = presetData.default.base;

// Radius options - defined here to avoid circular dependency
export const radiusIds = [
  "none",
  "extra-small",
  "small",
  "medium",
  "large",
  "extra-large",
] as const;

export type RadiusId = (typeof radiusIds)[number];

/**
 * Semantic color override for a single color (success, warning, or danger)
 */
export interface SemanticColorOverride {
  /** OKLCH color string e.g. "oklch(0.5148 0.1337 146.82)" */
  color: string;
  /** Optional foreground color - if not provided, will be calculated automatically */
  foreground?: string;
}

/**
 * Semantic color overrides for light and dark modes.
 * Allows themes to specify exact semantic colors instead of using calculated values.
 */
export interface ThemeSemanticOverrides {
  light?: {
    /** Override the accent foreground color (text on accent background) */
    accentForeground?: string;
    danger?: SemanticColorOverride;
    success?: SemanticColorOverride;
    warning?: SemanticColorOverride;
  };
  dark?: {
    /** Override the accent foreground color (text on accent background) */
    accentForeground?: string;
    danger?: SemanticColorOverride;
    success?: SemanticColorOverride;
    warning?: SemanticColorOverride;
  };
}

export type ThemeValues = {
  base: number;
  chroma: number;
  /**
   * Accent for dark mode, when it differs from the light accent. Only Uber uses
   * this (black in light, near-white in dark). The theme builder reaches the
   * same value through adaptiveColors; the stylesheet generator reads it here.
   */
  darkAccent?: {lightness: number; chroma: number; hue: number};
  /**
   * Per-mode --focus lightness, overriding the accent lightness. Chroma and hue
   * still follow the accent, so the ring keeps the brand colour. Set only where
   * the accent itself cannot reach 3:1 against that mode's surfaces.
   */
  focusLightness?: {light?: number; dark?: number};
  fontFamily: string;
  formRadius: RadiusId;
  hue: number;
  lightness: number;
  radius: RadiusId;
  /** Optional semantic color overrides for light/dark modes */
  semanticOverrides?: ThemeSemanticOverrides;
  /** Use vibrant (more saturated) soft foreground colors instead of accessible defaults */
  vibrantPalette?: boolean;
};

export const themeIds = [
  "default",
  "sky",
  "lavender",
  "mint",
  "netflix",
  "uber",
  "spotify",
  "coinbase",
  "airbnb",
  "discord",
  "rabbit",
] as const;

export type ThemeId = (typeof themeIds)[number];

// JSON widens "medium" to string and loses the optional-field narrowing, so the
// shape is asserted once here. check-preset-sources.mjs validates the data
// against this contract on every docs predev/prebuild.
export const themeValuesById = presetData as unknown as Record<ThemeId, ThemeValues>;

/**
 * Keys that define a theme's appearance.
 * Used for comparing current values against predefined themes.
 */
export const themeComparisonKeys = [
  "base",
  "chroma",
  "fontFamily",
  "formRadius",
  "hue",
  "lightness",
  "radius",
] as const satisfies readonly (keyof ThemeValues)[];

/**
 * Find which predefined theme matches the current variable values.
 * Returns undefined if no theme matches (i.e., it's a custom theme).
 */
export function findMatchingTheme(currentValues: ThemeValues): ThemeId | undefined {
  for (const themeId of themeIds) {
    const themeValues = themeValuesById[themeId];
    const matches = themeComparisonKeys.every((key) => {
      const current = currentValues[key];
      const theme = themeValues[key];

      // For numbers, use approximate comparison to handle floating point
      if (typeof current === "number" && typeof theme === "number") {
        return Math.abs(current - theme) < 0.0001;
      }

      return current === theme;
    });

    if (matches) {
      return themeId;
    }
  }

  return undefined;
}
