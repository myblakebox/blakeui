#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Generates README.md's theme-token snippets from the shipped default theme, so
 * they cannot drift the way they silently did before this script existed.
 *
 *   Source of truth:  themes/default/variables.css
 *   Generated:        README.md, between <!-- theme-vars:<id> --> markers
 *
 * Declarations are copied verbatim (values, var() aliases and trailing comments
 * alike) and only de-indented by two spaces, since the stylesheet nests its
 * blocks one level deeper than the README's snippets do. That keeps the README
 * showing token relationships — `--surface: var(--white)` — rather than the
 * flattened literals the docs' theme-builder mirror needs.
 *
 * SECTIONS below is a curated subset: the README documents the knobs users are
 * expected to override, not every token in the file. Adding a token to the
 * stylesheet therefore will not surface here on its own — add it to a group.
 * Removing or renaming one *is* caught, as a hard error.
 *
 * Usage:
 *   node scripts/sync-readme-theme-vars.mjs           # rewrite the snippets
 *   node scripts/sync-readme-theme-vars.mjs --check    # fail on drift (prebuild)
 */

import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const CSS_PATH = path.join(rootDir, "themes/default/variables.css");
const README_PATH = path.join(rootDir, "README.md");

const CHECK_ONLY = process.argv.includes("--check");

/* -------------------------------------------------------------------------------------------------
 * What the README documents
 * -----------------------------------------------------------------------------------------------*/

const SECTIONS = [
  {
    groups: [
      {heading: "Spacing", tokens: ["--spacing"]},
      {
        heading: "Border",
        tokens: ["--border-width", "--field-border-width", "--disabled-opacity"],
      },
      {heading: "Ring offset - Used for focus ring", tokens: ["--ring-offset-width"]},
      {heading: "Cursor", tokens: ["--cursor-interactive", "--cursor-disabled"]},
      {heading: "Radius", tokens: ["--radius", "--field-radius"]},
    ],
    id: "layout",
    modes: ["light"],
  },
  {
    groups: [
      {
        heading: "Primitive Colors (Do not change between light and dark)",
        tokens: ["--white", "--black", "--snow", "--eclipse"],
      },
      {heading: "Base Colors", tokens: ["--background", "--foreground"]},
      {
        heading: "Surface: Used for non-overlay components (cards, accordions, disclosure groups)",
        tokens: [
          "--surface",
          "--surface-foreground",
          "--surface-secondary",
          "--surface-secondary-foreground",
          "--surface-tertiary",
          "--surface-tertiary-foreground",
        ],
      },
      {
        heading:
          "Overlay: Used for floating/overlay components (tooltips, popovers, modals, menus)",
        tokens: ["--overlay", "--overlay-foreground"],
      },
      {
        heading: "Muted & Scrollbar",
        tokens: ["--muted", "--scrollbar", "--scrollbar-thumb", "--scrollbar-track"],
      },
      {
        heading: "Interactive Colors",
        tokens: ["--default", "--default-foreground", "--accent", "--accent-foreground"],
      },
      {
        heading: "Status Colors",
        tokens: [
          "--success",
          "--success-foreground",
          "--warning",
          "--warning-foreground",
          "--danger",
          "--danger-foreground",
        ],
      },
      {heading: "Component Colors", tokens: ["--segment", "--segment-foreground"]},
      {
        heading: "Misc Colors",
        tokens: ["--border", "--separator", "--focus", "--link", "--backdrop"],
      },
      {heading: "Shadows", tokens: ["--surface-shadow", "--overlay-shadow", "--field-shadow"]},
    ],
    id: "colors",
    modes: ["light", "dark"],
  },
  {
    groups: [
      {
        heading: "Form field defaults",
        tokens: [
          "--field-background",
          "--field-foreground",
          "--field-placeholder",
          "--field-border",
          "--field-border-width",
          "--field-radius",
        ],
      },
    ],
    id: "field",
    modes: ["light", "dark"],
  },
];

const SELECTORS = {
  dark: '.dark,\n[data-theme="dark"]',
  light: ":root",
};

/* -------------------------------------------------------------------------------------------------
 * Parse the shipped stylesheet
 * -----------------------------------------------------------------------------------------------*/

/**
 * Find the body of the block whose selector list matches `selectorRe`.
 *
 * Comments are blanked out (same length, so offsets survive) before brace
 * matching, so a brace inside a comment cannot unbalance the scan.
 */
function extractBlockBody(css, selectorRe) {
  const masked = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => " ".repeat(comment.length));
  const match = selectorRe.exec(masked);

  if (!match) return null;

  const start = masked.indexOf("{", match.index);
  let depth = 0;

  for (let i = start; i < masked.length; i++) {
    if (masked[i] === "{") depth++;
    if (masked[i] === "}") depth--;
    if (depth === 0) return css.slice(start + 1, i);
  }

  return null;
}

/**
 * Collect `--token: value;` declarations as their raw source lines, de-indented
 * by two spaces. Multi-line values (the shadow stacks) keep their own wrapping.
 */
function parseDeclarations(blockBody) {
  const decls = new Map();
  let token = null;
  let buffer = [];

  for (const line of blockBody.split("\n")) {
    const start = line.match(/^\s*(--[\w-]+)\s*:/);

    if (token === null) {
      if (!start) continue;
      token = start[1];
      buffer = [];
    }

    buffer.push(line.replace(/^ {0,2}/, "").trimEnd());

    // The declaration closes on the line carrying its ";" (trailing comment aside).
    if (/;\s*(\/\*.*\*\/)?\s*$/.test(line)) {
      decls.set(token, buffer.join("\n"));
      token = null;
    }
  }

  return decls;
}

function parseShippedCss() {
  const css = fs.readFileSync(CSS_PATH, "utf8");

  const light = extractBlockBody(css, /:root\s*,[^{]*\.light[^{]*/);
  const dark = extractBlockBody(css, /\.dark\s*,\s*\[data-theme="dark"\]/);

  if (!light || !dark) {
    throw new Error(`could not locate the light/dark declaration blocks in ${CSS_PATH}`);
  }

  return {dark: parseDeclarations(dark), light: parseDeclarations(light)};
}

/* -------------------------------------------------------------------------------------------------
 * Render
 * -----------------------------------------------------------------------------------------------*/

function renderBlock(groups, decls, selector) {
  const body = [];

  for (const group of groups) {
    const lines = group.tokens.filter((token) => decls.has(token)).map((token) => decls.get(token));

    if (lines.length === 0) continue;

    if (body.length > 0) body.push("");
    body.push(`  /* ${group.heading} */`, ...lines);
  }

  return body.length === 0 ? null : `${selector} {\n${body.join("\n")}\n}`;
}

function renderSection(section, blocks) {
  // Every documented token must exist in the light block; the dark block only
  // redeclares what it actually overrides, so gaps there are the cascade working.
  const missing = section.groups
    .flatMap((group) => group.tokens)
    .filter((token) => !blocks.light.has(token));

  if (missing.length > 0) {
    throw new Error(
      `[${section.id}] documented token(s) no longer exist in the shipped theme: ` +
        `${missing.join(", ")}\n  Update SECTIONS in ${path.relative(rootDir, __filename)}.`,
    );
  }

  const rendered = section.modes
    .map((mode) => renderBlock(section.groups, blocks[mode], SELECTORS[mode]))
    .filter(Boolean);

  // Blank lines around the fence keep the surrounding HTML comment markers from
  // swallowing it into an HTML block on stricter markdown renderers.
  return ["", "```css", rendered.join("\n\n"), "```", ""].join("\n");
}

/* -------------------------------------------------------------------------------------------------
 * Splice into the README
 * -----------------------------------------------------------------------------------------------*/

function replaceRegion(readme, id, content) {
  const open = `<!-- theme-vars:${id} -->`;
  const close = `<!-- /theme-vars:${id} -->`;
  const region = new RegExp(`(${open}\\n)[\\s\\S]*?(\\n${close})`);

  if (!region.test(readme)) {
    throw new Error(`could not find the ${open} … ${close} markers in ${README_PATH}`);
  }

  return readme.replace(region, `$1${content}$2`);
}

const blocks = parseShippedCss();
const current = fs.readFileSync(README_PATH, "utf8");

let next = current;

for (const section of SECTIONS) {
  next = replaceRegion(next, section.id, renderSection(section, blocks));
}

if (next === current) {
  console.log(`✓ README.md theme snippets match ${path.relative(rootDir, CSS_PATH)}`);
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error(
    `✗ README.md theme snippets are out of sync with the shipped default theme\n` +
      `  (${path.relative(rootDir, CSS_PATH)})\n\n` +
      `  Run: pnpm --filter @blakeui/styles sync:readme`,
  );
  process.exit(1);
}

fs.writeFileSync(README_PATH, next);
console.log(`✓ Regenerated README.md theme snippets from ${path.relative(rootDir, CSS_PATH)}`);
