/**
 * Build script: generates docs theme-presets.css from the shared preset data.
 *
 * There is deliberately no colour maths in this file. The numbers come from
 * src/app/[lang]/themes/theme-presets.data.json and the maths from the theme
 * builder's own generate-theme-colors.ts, so the generated stylesheet and the
 * live builder cannot drift apart. They used to: this script carried its own
 * hex accents, its own neutral tables and its own semantic defaults, and the
 * two disagreed on 509 token values across the ten presets.
 *
 * Usage: tsx apps/docs/scripts/build-theme-presets.ts
 * Output: apps/docs/src/styles/theme-presets.css
 */

import type {ThemeId, ThemeValues} from "../src/app/[lang]/themes/theme-values";

import {writeFileSync} from "fs";
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";

import {themeIds, themeValuesById} from "../src/app/[lang]/themes/theme-values";
import {
  calculateAccentForeground,
  formatOklch,
  generateThemeColors,
  getColorVariablesForElement,
} from "../src/app/[lang]/themes/utils/generate-theme-colors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, "../src/styles/theme-presets.css");

const RADIUS_MAP: Record<string, string> = {
  "extra-large": "1rem",
  "extra-small": "0.125rem",
  large: "0.75rem",
  medium: "0.5rem",
  none: "0",
  small: "0.25rem",
};

// Chart ramp, expressed relative to --accent so it follows the accent without
// needing to be regenerated. Identical text for every preset.
const CHART_VARS: Record<string, string> = {
  "--chart-1": "oklch(from var(--accent) calc(l - 0.24) c h)",
  "--chart-2": "oklch(from var(--accent) calc(l - 0.12) c h)",
  "--chart-3": "var(--accent)",
  "--chart-4": "oklch(from var(--accent) calc(l + 0.12) c h)",
  "--chart-5": "oklch(from var(--accent) calc(l + 0.24) c h)",
};

/**
 * Vars for one preset in one mode, matching what the builder injects.
 *
 * Uber is the one preset whose accent differs between modes. The builder gets
 * its dark accent from adaptiveColors (keyed on the black accent string); here
 * it comes from the preset's own darkAccent, and the same four tokens are
 * overridden that use-css-sync overrides.
 */
function modeVars(theme: ThemeValues, mode: "light" | "dark"): Record<string, string> {
  const colors = generateThemeColors({
    chroma: theme.chroma,
    focusLightness: theme.focusLightness,
    grayChroma: theme.base,
    hue: theme.hue,
    lightness: theme.lightness,
    semanticOverrides: theme.semanticOverrides,
  });

  const vars = getColorVariablesForElement(colors, mode);

  if (mode === "dark" && theme.darkAccent) {
    const {chroma, hue, lightness} = theme.darkAccent;
    const accent = formatOklch({c: chroma, h: hue, l: lightness});

    vars["--accent"] = accent;
    vars["--accent-foreground"] = calculateAccentForeground(lightness, chroma, hue);
    vars["--focus"] =
      theme.focusLightness?.dark === undefined
        ? accent
        : formatOklch({c: chroma, h: hue, l: theme.focusLightness.dark});
  }

  const radius: Record<string, string> = {};

  if (theme.radius !== "medium") radius["--radius"] = RADIUS_MAP[theme.radius]!;
  if (theme.formRadius !== "large") radius["--field-radius"] = RADIUS_MAP[theme.formRadius]!;

  return {...vars, ...radius, ...CHART_VARS};
}

function generatePresetCss(id: ThemeId): string {
  const theme = themeValuesById[id];
  const render = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n");

  return `/* ${id.charAt(0).toUpperCase() + id.slice(1)} theme */
[data-design-theme="${id}"]:not(.dark):not([data-theme="dark"]) {
${render(modeVars(theme, "light"))}
}

[data-design-theme="${id}"].dark,
[data-design-theme="${id}"][data-theme="dark"] {
  color-scheme: dark;
${render(modeVars(theme, "dark"))}
}`;
}

// Default is not emitted: it is the shipped theme, applied with no
// data-design-theme attribute at all (see packages/styles themes/default).
const presetIds = themeIds.filter((id) => id !== "default");

const banner = `/* ============================================================================
   Auto-generated theme presets for docs.
   Source of truth: src/app/[lang]/themes/theme-presets.data.json
   Run: tsx apps/docs/scripts/build-theme-presets.ts
   ============================================================================ */\n`;

const body = presetIds.map(generatePresetCss).join("\n\n");

writeFileSync(OUTPUT, `${banner}@layer base {\n${body}\n}\n`);

console.log(`✓ Generated ${presetIds.length} theme presets → ${OUTPUT}`);
