#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Build-time assertion: every relative @import in the built CSS entry must
 * resolve against its own location inside dist.
 *
 * The failure this guards against is silent. `dist/index.css` is a byte copy of
 * the source entry, so it keeps importing "./components/index.css" whether or
 * not the component stylesheets were copied alongside it. The local dev server
 * never notices — it resolves `@blakeui/styles` through the workspace symlink
 * to the *source* tree — and neither does a docs build. Only a consumer who
 * installs the published tarball finds out, at which point the version is out.
 *
 * So this runs inside the normal build, after the CSS copy step, and exits
 * non-zero listing every unresolved import.
 */
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const IMPORT_RE = () => /@import\s+(?:url\(\s*)?["']([^"']+)["']/g;

/**
 * Resolve a relative CSS specifier the way a bundler does: exact path, then
 * with a .css extension, then as a directory containing index.css.
 */
function resolveSpecifier(fromFile, spec) {
  const dir = path.dirname(fromFile);
  const candidates = [spec];

  if (!spec.endsWith(".css")) candidates.push(`${spec}.css`);

  for (const candidate of candidates) {
    const resolved = path.resolve(dir, candidate);

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;

    const asIndex = path.join(resolved, "index.css");

    if (fs.existsSync(asIndex)) return asIndex;
  }

  return null;
}

function walk(entry) {
  const dangling = [];
  const seen = new Set();
  let checked = 0;

  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);

    const specifiers = [];
    const re = IMPORT_RE();
    const css = fs.readFileSync(file, "utf8");
    let match;

    while ((match = re.exec(css))) specifiers.push(match[1]);

    for (const spec of specifiers) {
      // Bare specifiers are package resolution — not this assertion's job.
      if (!spec.startsWith(".") && !spec.startsWith("/")) continue;

      checked += 1;

      const resolved = resolveSpecifier(file, spec);

      if (resolved) visit(resolved);
      else dangling.push({from: path.relative(rootDir, file), spec});
    }
  };

  visit(entry);

  return {checked, dangling, files: seen.size};
}

const entry = path.join(distDir, "index.css");

if (!fs.existsSync(entry)) {
  console.error(`❌ dist/index.css is missing — nothing was built to assert against.`);
  process.exit(1);
}

const {checked, dangling, files} = walk(entry);

if (dangling.length > 0) {
  console.error(
    `\n❌ ${dangling.length} unresolved relative @import${dangling.length === 1 ? "" : "s"} in dist:\n`,
  );

  for (const {from, spec} of dangling) {
    console.error(`   ${from}  →  ${spec}`);
  }

  console.error(
    `\n   The stylesheet at that path was not copied into dist. Copy it to the ` +
      `path the import already expects (see scripts/copy-css.mjs) rather than ` +
      `rewriting the import.\n`,
  );
  process.exit(1);
}

console.log(
  `✅ CSS imports resolve: ${checked} relative @import${checked === 1 ? "" : "s"} across ${files} files in dist`,
);
