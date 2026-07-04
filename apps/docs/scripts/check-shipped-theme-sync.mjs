/**
 * Sync guard: fails predev/prebuild when the theme builder's mirrored copy of
 * BlakeUI's shipped default theme drifts from the source stylesheet.
 *
 *   Source of truth:  packages/styles/themes/default/variables.css
 *   Mirror:           apps/docs/src/app/[lang]/themes/shipped-default-vars.ts
 *
 * Both files are parsed textually (no TS loader), so this runs on any Node.
 * The stylesheet's bare var() aliases are resolved mode-aware (dark falls
 * back to the light block, like the CSS cascade), then values are compared
 * numerically for oklch() literals and whitespace-insensitively otherwise.
 *
 * Usage: node scripts/check-shipped-theme-sync.mjs
 *   VARIABLES_CSS_PATH=<path> overrides the stylesheet location (tests only).
 */

import {readFileSync} from "fs";
import {dirname, resolve} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CSS_PATH =
  process.env.VARIABLES_CSS_PATH ??
  resolve(__dirname, "../../../packages/styles/themes/default/variables.css");
const MIRROR_PATH = resolve(__dirname, "../src/app/[lang]/themes/shipped-default-vars.ts");

// The exact token set every builder emit path produces (getColorVariablesForElement /
// getBaseColorVariables). The mirror must cover it precisely — no more, no less —
// so a swapped or renamed token cannot slip past a bare count.
const EXPECTED_TOKENS = [
  "--accent",
  "--accent-foreground",
  "--background",
  "--border",
  "--danger",
  "--danger-foreground",
  "--default",
  "--default-foreground",
  "--field-background",
  "--field-border",
  "--field-foreground",
  "--field-placeholder",
  "--focus",
  "--foreground",
  "--muted",
  "--overlay",
  "--overlay-foreground",
  "--scrollbar",
  "--segment",
  "--segment-foreground",
  "--separator",
  "--success",
  "--success-foreground",
  "--surface",
  "--surface-foreground",
  "--surface-secondary",
  "--surface-secondary-foreground",
  "--surface-tertiary",
  "--surface-tertiary-foreground",
  "--warning",
  "--warning-foreground",
];

/* -------------------------------------------------------------------------------------------------
 * Parse the shipped stylesheet
 * -----------------------------------------------------------------------------------------------*/

/** Extract `--token: value;` declarations from a CSS block body. */
function parseDeclarations(blockBody) {
  const decls = {};

  for (const match of blockBody.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    decls[match[1]] = match[2].replace(/\s+/g, " ").trim();
  }

  return decls;
}

/** Find the body of the block whose selector list matches `selectorRe`. */
function extractBlock(css, selectorRe) {
  const match = selectorRe.exec(css);

  if (!match) return null;

  let depth = 0;
  const start = css.indexOf("{", match.index);

  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    if (depth === 0) return css.slice(start + 1, i);
  }

  return null;
}

function parseShippedCss() {
  const raw = readFileSync(CSS_PATH, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  const lightBody = extractBlock(raw, /:root\s*,[^{]*\.light[^{]*/);
  const darkBody = extractBlock(raw, /\.dark\s*,\s*\[data-theme="dark"\]/);

  if (!lightBody || !darkBody) {
    throw new Error(`could not locate the light/dark declaration blocks in ${CSS_PATH}`);
  }

  return {dark: parseDeclarations(darkBody), light: parseDeclarations(lightBody)};
}

/**
 * Resolve a token in a mode the way the cascade does: dark falls back to the
 * light block, and values that are a single bare var() reference are chased
 * (e.g. --surface: var(--white), --scrollbar: var(--scrollbar-thumb)).
 * Composite values (color-mix etc.) are returned as-is.
 */
function resolveShippedValue(blocks, mode, token, seen = new Set()) {
  if (seen.has(`${mode}:${token}`)) {
    throw new Error(`circular var() reference at ${token}`);
  }
  seen.add(`${mode}:${token}`);

  const value = mode === "dark" ? (blocks.dark[token] ?? blocks.light[token]) : blocks.light[token];

  if (value === undefined) return undefined;

  const bareVar = value.match(/^var\((--[\w-]+)\)$/);

  if (bareVar) {
    return resolveShippedValue(blocks, mode, bareVar[1], seen);
  }

  return value;
}

/* -------------------------------------------------------------------------------------------------
 * Parse the mirror (shipped-default-vars.ts)
 * -----------------------------------------------------------------------------------------------*/

function parseMirror() {
  const raw = readFileSync(MIRROR_PATH, "utf8");
  const modes = {};

  for (const mode of ["dark", "light"]) {
    const body = extractBlock(raw, new RegExp(`\\n  ${mode}: \\{`));

    if (!body) {
      throw new Error(`could not locate the "${mode}" record in ${MIRROR_PATH}`);
    }

    const tokens = {};

    for (const match of body.matchAll(/"(--[\w-]+)":\s*"([^"]+)"/g)) {
      tokens[match[1]] = match[2];
    }

    modes[mode] = tokens;
  }

  return modes;
}

/* -------------------------------------------------------------------------------------------------
 * Comparison
 * -----------------------------------------------------------------------------------------------*/

/** Parse an oklch() literal into numbers; lightness normalized to 0..1. */
function parseOklchLiteral(value) {
  const match = value.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/);

  if (!match) return null;

  const l = parseFloat(match[1]) / (match[2] === "%" ? 100 : 1);

  return {c: parseFloat(match[3]), h: parseFloat(match[4]), l};
}

function valuesMatch(shipped, mirrored) {
  const a = parseOklchLiteral(shipped);
  const b = parseOklchLiteral(mirrored);

  if (a && b) {
    const close = (x, y) => Math.abs(x - y) < 1e-6;

    return close(a.l, b.l) && close(a.c, b.c) && close(a.h, b.h);
  }

  return shipped.replace(/\s+/g, " ").trim() === mirrored.replace(/\s+/g, " ").trim();
}

const blocks = parseShippedCss();
const mirror = parseMirror();
const failures = [];

for (const mode of ["light", "dark"]) {
  const tokens = Object.keys(mirror[mode]);

  const missing = EXPECTED_TOKENS.filter((t) => !tokens.includes(t));
  const extra = tokens.filter((t) => !EXPECTED_TOKENS.includes(t));

  if (missing.length > 0 || extra.length > 0) {
    failures.push(
      `[${mode}] mirror token set drifted from the emit paths' token set` +
        (missing.length > 0 ? `\n    missing: ${missing.join(", ")}` : "") +
        (extra.length > 0 ? `\n    extra:   ${extra.join(", ")}` : ""),
    );
  }

  for (const token of tokens) {
    const shipped = resolveShippedValue(blocks, mode, token);
    const mirrored = mirror[mode][token];

    if (shipped === undefined) {
      failures.push(`[${mode}] ${token}: not found in ${CSS_PATH}`);
      continue;
    }

    if (!valuesMatch(shipped, mirrored)) {
      failures.push(`[${mode}] ${token}:\n    shipped  ${shipped}\n    mirror   ${mirrored}`);
    }
  }
}

if (failures.length > 0) {
  console.error(
    `✗ shipped-default-vars.ts is out of sync with the shipped default theme\n` +
      `  (${CSS_PATH})\n\n` +
      failures.map((f) => `  ${f}`).join("\n") +
      `\n\n  Update apps/docs/src/app/[lang]/themes/shipped-default-vars.ts to match.`,
  );
  process.exit(1);
}

console.log(
  `✓ shipped-default-vars.ts matches the shipped default theme ` +
    `(${EXPECTED_TOKENS.length} tokens × light/dark)`,
);
