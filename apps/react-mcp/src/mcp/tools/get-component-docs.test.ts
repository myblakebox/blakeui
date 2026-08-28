/**
 * No component MDX served through the docs tool may contain a ```css fence.
 *
 * `get_component_docs` fetches `blakeui.com/docs/react/components/<name>.mdx`,
 * which the docs site renders from the MDX sources in this repository: the raw
 * file, with `<ComponentPreview>` replaced by the demo's `.tsx` source and
 * `<CollapsibleCode lang="…" code={`…`} />` replaced by a fence in that
 * language. This test reproduces that transformation over the sources, so it
 * fails on the commit that introduces a CSS block rather than after a deploy.
 *
 * Why it matters: a slab of component CSS in the docs reads like the component.
 * It is not — see `fixtures/tabs-css-only-port-incident.md`. Customisation
 * guidance belongs in the Styling handbook, which the component pages link to.
 */

import {readFileSync, readdirSync, statSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

import {describe, expect, it} from "vitest";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(HERE, "../../../../..");
const COMPONENT_DOCS = join(REPO_ROOT, "apps/docs/content/docs/en/react/components");

const COLLAPSIBLE_CODE =
  /<CollapsibleCode\s+lang\s*=\s*["']([^"']+)["']\s+code\s*=\s*\{?`([\s\S]*?)`\}?\s*\/>/g;

function mdxFiles(dir: string): string[] {
  const out: string[] = [];

  for (const name of readdirSync(dir)) {
    const full = join(dir, name);

    if (statSync(full).isDirectory()) {
      out.push(...mdxFiles(full));
    } else if (name.endsWith(".mdx")) {
      out.push(full);
    }
  }

  return out;
}

/** The same substitution the docs route performs before serving the MDX. */
function asServed(raw: string): string {
  return raw.replace(COLLAPSIBLE_CODE, (_match, lang: string, code: string) => {
    return `\`\`\`${lang || "tsx"}\n${code}\n\`\`\``;
  });
}

function cssFences(text: string): string[] {
  return text.split("\n").filter((line) => /^\s*```css\b/.test(line));
}

describe("component MDX served through the docs tool", () => {
  const files = mdxFiles(COMPONENT_DOCS);

  it("finds the component docs on disk", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("contains no ```css fence", () => {
    const offenders = files
      .map((file) => ({file, fences: cssFences(asServed(readFileSync(file, "utf8")))}))
      .filter((entry) => entry.fences.length > 0)
      .map((entry) => `${entry.file.replace(REPO_ROOT, "")} (${entry.fences.length})`);

    expect(offenders).toEqual([]);
  });

  it("declares no CollapsibleCode block in css", () => {
    const offenders = files.filter((file) => {
      const raw = readFileSync(file, "utf8");

      return /<CollapsibleCode\s+lang\s*=\s*["']css["']/.test(raw);
    });

    expect(offenders).toEqual([]);
  });
});
