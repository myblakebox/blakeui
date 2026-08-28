/**
 * Completeness classification.
 *
 * Two things have to stay true: every catalog entry carries a completeness
 * verdict, and the verdict the MCP serves is the same one the docs site shows.
 */

import {readFileSync, readdirSync, statSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

import {describe, expect, it} from "vitest";

import {
  BEHAVIOR_CONTRACTS,
  CATALOG_COMPONENTS,
  COMPLETENESS_VALUES,
  getBehaviorContract,
  getCompleteness,
  isBehaviorRequired,
} from "./index";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(HERE, "../../../../..");
const COMPONENT_DOCS = join(REPO_ROOT, "apps/docs/content/docs/en/react/components");

interface DocEntry {
  file: string;
  title: string;
  completeness?: string;
}

function readComponentDocs(): DocEntry[] {
  const out: DocEntry[] = [];

  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);

      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }

      if (!name.endsWith(".mdx")) continue;

      const raw = readFileSync(full, "utf8");
      const frontmatter = raw.split("---")[1] ?? "";
      const title = /^title:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
      const completeness = /^completeness:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
      const hasSource = /^\s+source:\s*\S/m.test(frontmatter);

      // index.mdx is the category landing page, not a catalog entry.
      if (!title || !hasSource) continue;

      out.push({file: full, title, completeness});
    }
  };

  walk(COMPONENT_DOCS);

  return out;
}

describe("completeness classification", () => {
  it("records a verdict for every catalog entry", () => {
    const missing = CATALOG_COMPONENTS.filter((name) => !getCompleteness(name));

    expect(missing).toEqual([]);
  });

  it("only uses the two defined completeness values", () => {
    for (const contract of Object.values(BEHAVIOR_CONTRACTS)) {
      expect(COMPLETENESS_VALUES).toContain(contract.completeness);
    }
  });

  it("names at least one audit criterion for every behavior-required component", () => {
    const withoutReason = Object.values(BEHAVIOR_CONTRACTS)
      .filter((c) => c.completeness === "behavior-required")
      .filter((c) => c.criteria.length === 0)
      .map((c) => c.component);

    expect(withoutReason).toEqual([]);
  });

  it("names what a CSS-only port loses, for every behavior-required component", () => {
    const withoutMissing = Object.values(BEHAVIOR_CONTRACTS)
      .filter((c) => c.completeness === "behavior-required")
      .filter((c) => !c.missingWithoutBehavior?.trim())
      .map((c) => c.component);

    expect(withoutMissing).toEqual([]);
  });

  it("claims no criteria for styles-sufficient components", () => {
    const overClaimed = Object.values(BEHAVIOR_CONTRACTS)
      .filter((c) => c.completeness === "styles-sufficient")
      .filter((c) => c.criteria.length > 0)
      .map((c) => c.component);

    expect(overClaimed).toEqual([]);
  });

  it("treats an unknown component as behavior-required", () => {
    expect(getBehaviorContract("NotAComponent")).toBeUndefined();
    expect(isBehaviorRequired("NotAComponent")).toBe(true);
  });

  it("resolves catalog names in every spelling the API accepts", () => {
    for (const spelling of ["TextField", "text-field", "Text Field", "textfield"]) {
      expect(getBehaviorContract(spelling)?.component).toBe("TextField");
    }
  });
});

describe("docs and MCP agree", () => {
  const docs = readComponentDocs();

  it("finds the component docs on disk", () => {
    expect(docs.length).toBeGreaterThan(0);
  });

  it("declares completeness in every component doc's frontmatter", () => {
    const missing = docs.filter((d) => !d.completeness).map((d) => d.title);

    expect(missing).toEqual([]);
  });

  it("declares the same verdict the MCP serves", () => {
    const disagreements = docs
      .map((doc) => ({
        component: doc.title,
        docs: doc.completeness,
        mcp: getCompleteness(doc.title),
      }))
      .filter((row) => row.docs !== row.mcp);

    expect(disagreements).toEqual([]);
  });

  it("covers every documented component and nothing else", () => {
    const documented = docs.map((d) => d.title).sort();

    expect(documented).toEqual([...CATALOG_COMPONENTS].sort());
  });
});
