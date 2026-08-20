/**
 * Sync guard: fails predev/prebuild when the generated preset stylesheet stops
 * agreeing with what the theme builder computes from the same preset data.
 *
 *   Source of truth:  src/app/[lang]/themes/theme-presets.data.json
 *   Consumer A:       the theme builder, via generate-theme-colors.ts
 *   Consumer B:       src/styles/theme-presets.css, via build-theme-presets.ts
 *
 * Both consumers now share one data file and one colour pipeline, so this
 * should only ever fail when theme-presets.css is stale (someone edited the
 * data or the maths without regenerating) or hand-edited. It also validates
 * the JSON against the ThemeValues contract, since JSON carries no types.
 *
 * Colours are compared numerically, not textually: adaptiveColors feeds the
 * builder raw strings like "oklch(0 0 0)" where formatOklch would write
 * "oklch(0.00% 0.0000 0.00)". Same colour, different spelling.
 *
 * Usage: tsx apps/docs/scripts/check-preset-sources.ts
 */

import type {ThemeId} from "../src/app/[lang]/themes/theme-values";

import {readFileSync} from "fs";
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";

import {
  adaptiveColors,
  radiusIds,
  themeIds,
  themeValuesById,
} from "../src/app/[lang]/themes/theme-values";
import {
  calculateAccentForeground,
  formatOklch,
  generateThemeColors,
  getColorVariablesForElement,
  parseOklch,
} from "../src/app/[lang]/themes/utils/generate-theme-colors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname, "../src/styles/theme-presets.css");
const DATA_PATH = resolve(__dirname, "../src/app/[lang]/themes/theme-presets.data.json");

const failures: string[] = [];

/* -------------------------------------------------------------------------------------------------
 * 1. The JSON honours the ThemeValues contract
 * -----------------------------------------------------------------------------------------------*/

const REQUIRED = ["base", "chroma", "fontFamily", "formRadius", "hue", "lightness", "radius"];

for (const id of themeIds) {
  const theme = themeValuesById[id] as unknown as Record<string, unknown>;

  if (!theme) {
    failures.push(`[data] ${id}: missing from theme-presets.data.json`);
    continue;
  }

  for (const key of REQUIRED) {
    if (theme[key] === undefined) failures.push(`[data] ${id}: missing required field "${key}"`);
  }

  for (const key of ["radius", "formRadius"] as const) {
    const value = theme[key];

    if (value !== undefined && !radiusIds.includes(value as (typeof radiusIds)[number])) {
      failures.push(`[data] ${id}: ${key} "${String(value)}" is not a radius id`);
    }
  }

  for (const key of ["lightness", "chroma", "hue", "base"] as const) {
    const value = theme[key];

    if (value !== undefined && typeof value !== "number") {
      failures.push(`[data] ${id}: ${key} must be a number, got ${typeof value}`);
    }
  }
}

/* -------------------------------------------------------------------------------------------------
 * 1b. adaptiveColors still covers every preset that needs it
 *
 * The map is derived from darkAccent, so it cannot hold a stale value — but it
 * is keyed by accent string, and two presets sharing a light accent would
 * silently collide. This catches that, and catches a preset whose darkAccent
 * stopped producing an entry.
 * -----------------------------------------------------------------------------------------------*/

const adaptiveThemes = themeIds.filter((id) => themeValuesById[id].darkAccent !== undefined);

if (Object.keys(adaptiveColors).length !== adaptiveThemes.length) {
  failures.push(
    `[adaptive] ${adaptiveThemes.length} preset(s) declare darkAccent but adaptiveColors holds ` +
      `${Object.keys(adaptiveColors).length} entr(y/ies) — two presets probably share a light accent`,
  );
}

for (const id of adaptiveThemes) {
  const theme = themeValuesById[id];
  const key = `oklch(${theme.lightness} ${theme.chroma} ${theme.hue})`;
  const entry = adaptiveColors[key];

  if (!entry) {
    failures.push(`[adaptive] ${id}: no adaptiveColors entry for its accent "${key}"`);
  } else if (entry.light !== key) {
    failures.push(
      `[adaptive] ${id}: entry light "${entry.light}" does not match its accent "${key}"`,
    );
  }
}

/* -------------------------------------------------------------------------------------------------
 * 2. The generated stylesheet matches the builder's computation
 * -----------------------------------------------------------------------------------------------*/

const css = readFileSync(CSS_PATH, "utf8");

function cssBlock(id: ThemeId, mode: "light" | "dark"): Record<string, string> | null {
  const selector =
    mode === "light"
      ? `[data-design-theme="${id}"]:not(.dark):not([data-theme="dark"]) {`
      : `[data-design-theme="${id}"][data-theme="dark"] {`;
  const start = css.indexOf(selector);

  if (start < 0) return null;

  const body = css.slice(start + selector.length, css.indexOf("\n}", start));
  const out: Record<string, string> = {};

  for (const match of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[match[1]!] = match[2]!.trim();

  return out;
}

function sameColour(a: string, b: string): boolean {
  if (a === b) return true;

  const pa = parseOklch(a);
  const pb = parseOklch(b);

  if (!pa || !pb) return false;

  const close = (x: number, y: number) => Math.abs(x - y) < 5e-5;

  return close(pa.l, pb.l) && close(pa.c, pb.c) && close(pa.h, pb.h);
}

for (const id of themeIds) {
  if (id === "default") continue; // shipped theme, not emitted as a preset block

  const theme = themeValuesById[id];

  for (const mode of ["light", "dark"] as const) {
    const actual = cssBlock(id, mode);

    if (!actual) {
      failures.push(`[css] ${id}/${mode}: block missing from theme-presets.css`);
      continue;
    }

    const colors = generateThemeColors({
      chroma: theme.chroma,
      focusLightness: theme.focusLightness,
      grayChroma: theme.base,
      hue: theme.hue,
      lightness: theme.lightness,
      semanticOverrides: theme.semanticOverrides,
    });
    const expected = getColorVariablesForElement(colors, mode);

    if (mode === "dark" && theme.darkAccent) {
      const {chroma, hue, lightness} = theme.darkAccent;
      const accent = formatOklch({c: chroma, h: hue, l: lightness});

      expected["--accent"] = accent;
      expected["--accent-foreground"] = calculateAccentForeground(lightness, chroma, hue);
      expected["--focus"] =
        theme.focusLightness?.dark === undefined
          ? accent
          : formatOklch({c: chroma, h: hue, l: theme.focusLightness.dark});
    }

    for (const [token, want] of Object.entries(expected)) {
      const got = actual[token];

      if (got === undefined) {
        failures.push(`[css] ${id}/${mode} ${token}: missing from theme-presets.css`);
      } else if (!sameColour(want, got)) {
        failures.push(`[css] ${id}/${mode} ${token}:\n    builder  ${want}\n    stylesheet ${got}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(
    `✗ theme presets are out of sync\n` +
      `  data:  ${DATA_PATH}\n` +
      `  css:   ${CSS_PATH}\n\n` +
      failures.map((f) => `  ${f}`).join("\n") +
      `\n\n  Regenerate with: tsx apps/docs/scripts/build-theme-presets.ts`,
  );
  process.exit(1);
}

console.log(
  `✓ theme presets agree (${themeIds.length - 1} presets × light/dark, ` +
    `one data file, one colour pipeline)`,
);
