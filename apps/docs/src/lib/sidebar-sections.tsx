import type * as PageTree from "fumadocs-core/page-tree";

import {createMetaIcon} from "@/lib/meta-icon";

export const SECTION_ID_PREFIX = "collapsible-section:";

export function isSidebarSection(node: PageTree.Folder): boolean {
  return node.$id?.startsWith(SECTION_ID_PREFIX) ?? false;
}

// Section labels map to gravity-ui icon names; the Iconify component resolves
// them to MUI Material Two Tone glyphs through ICON_MAP.
const SECTION_ICONS: Record<string, string> = {
  Buttons: "hand-point-up",
  Collections: "folders",
  Colors: "palette",
  Controls: "sliders",
  "Data Display": "chart-column",
  "Date and Time": "calendar",
  Feedback: "comment",
  Forms: "pencil-to-square",
  Handbook: "book",
  Layout: "layout-cells",
  Media: "picture",
  Navigation: "compass",
  Overlays: "layers",
  Overview: "square-article",
  Pickers: "magic-wand",
  Releases: "tag",
  Typography: "font-case",
  "UI for Agents": "cpu",
  Utilities: "gear",
};

function sectionIcon(label: string) {
  return createMetaIcon(SECTION_ICONS[label]);
}

/**
 * Folds separator-delimited runs of sidebar entries into synthetic folder
 * nodes so they can render as collapsible sections. Page URLs are untouched;
 * only the tree nesting changes.
 */
export function withCollapsibleSections(tree: PageTree.Root): PageTree.Root {
  return {...tree, children: groupChildren(tree.children, tree.$id ?? "root")};
}

function groupChildren(nodes: PageTree.Node[], parentId: string): PageTree.Node[] {
  const mapped = nodes.map((node, i) =>
    node.type === "folder"
      ? {...node, children: groupChildren(node.children, node.$id ?? `${parentId}/${i}`)}
      : node,
  );

  if (!mapped.some((node) => node.type === "separator")) return mapped;

  const out: PageTree.Node[] = [];
  let current: PageTree.Folder | undefined;

  for (const node of mapped) {
    if (node.type === "separator") {
      const label = typeof node.name === "string" ? node.name : "";

      current = {
        $id: `${SECTION_ID_PREFIX}${parentId}/${label}`,
        children: [],
        collapsible: true,
        defaultOpen: true,
        icon: node.icon ?? sectionIcon(label),
        name: node.name,
        type: "folder",
      };
      out.push(current);
    } else if (current) {
      current.children.push(node);
    } else {
      out.push(node);
    }
  }

  return out;
}
