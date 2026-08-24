"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import type {ReactNode} from "react";

import {usePathname} from "fumadocs-core/framework";
import {useEffect, useId, useMemo, useState, useSyncExternalStore} from "react";

import {Iconify} from "@/components/iconify";
import {isSidebarSection} from "@/lib/sidebar-sections";
import {cn} from "@/utils/cn";

import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
} from "./sidebar";

// Collapse state survives navigation and reloads; absent ids mean expanded,
// so a first-time visitor sees every section open.
const STORAGE_KEY = "blakeui-docs.sidebar-collapsed-sections";

// Tiny external store over localStorage so every section instance (desktop
// sidebar and mobile drawer) reads and reacts to the same collapse state.
const listeners = new Set<() => void>();

function subscribeCollapsed(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readCollapsedRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseCollapsed(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeCollapsed(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode, quota); sections still toggle in-memory.
  }
  listeners.forEach((notify) => notify());
}

function containsPath(node: PageTree.Node, pathname: string): boolean {
  if (node.type === "page") return node.url === pathname;
  if (node.type === "folder") {
    return node.index?.url === pathname || node.children.some((c) => containsPath(c, pathname));
  }

  return false;
}

export function DocsSidebarSection({children, item}: {children: ReactNode; item: PageTree.Folder}) {
  if (!isSidebarSection(item)) return <DefaultFolder item={item}>{children}</DefaultFolder>;

  return <CollapsibleSection item={item}>{children}</CollapsibleSection>;
}

// Non-section folders keep the stock fumadocs rendering.
function DefaultFolder({children, item}: {children: ReactNode; item: PageTree.Folder}) {
  const pathname = usePathname();
  const active = containsPath(item, pathname);

  return (
    <SidebarFolder active={active} collapsible={item.collapsible} defaultOpen={item.defaultOpen}>
      {item.index ? (
        <SidebarFolderLink
          active={item.index.url === pathname}
          external={item.index.external}
          href={item.index.url}
        >
          {item.icon}
          {item.name}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger>
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent>{children}</SidebarFolderContent>
    </SidebarFolder>
  );
}

function CollapsibleSection({children, item}: {children: ReactNode; item: PageTree.Folder}) {
  const pathname = usePathname();
  const sectionId = item.$id ?? "";
  const active = useMemo(() => containsPath(item, pathname), [item, pathname]);
  // The server snapshot renders every section expanded; the stored state
  // applies right after hydration.
  const collapsedRaw = useSyncExternalStore(subscribeCollapsed, readCollapsedRaw, () => "[]");
  const collapsed = useMemo(() => parseCollapsed(collapsedRaw), [collapsedRaw]);
  // An explicit toggle on the current page wins; on navigation the override
  // expires, so a deep link always reveals its own section while the stored
  // state of every other section is untouched.
  const [override, setOverride] = useState<{open: boolean; path: string} | null>(null);
  const open =
    override && override.path === pathname
      ? override.open
      : active || !collapsed.includes(sectionId);
  const [animate, setAnimate] = useState(false);
  const panelId = useId();

  // Enable transitions only after first paint so restoring a collapsed
  // section on load doesn't animate.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimate(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    const next = !open;
    const ids = parseCollapsed(readCollapsedRaw()).filter((id) => id !== sectionId);

    if (!next) ids.push(sectionId);
    setOverride({open: next, path: pathname});
    writeCollapsed(ids);
  };

  return (
    <div className="flex flex-col">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        data-active={active}
        data-sidebar-section=""
        type="button"
        className={cn(
          "text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80",
          "flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start",
          "transition-colors hover:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
          "data-[active=true]:text-fd-primary",
        )}
        onClick={toggle}
      >
        {item.icon}
        {item.name}
        <Iconify
          icon="chevron-down"
          className={cn(
            "ms-auto transition-transform duration-200 motion-reduce:transition-none",
            !animate && "transition-none",
            !open && "-rotate-90",
          )}
        />
      </button>
      <div
        id={panelId}
        className={cn(
          "grid",
          animate && "transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-col overflow-hidden",
            /* The collapse needs overflow-hidden for the grid-rows animation,
               but hidden clips both axes and this box hugs the pill exactly,
               so the active pill's surface shadow and the keyboard focus ring
               were cut off at the pill's own edge. Equal negative margin and
               padding keep every child in place while moving the clip
               boundary 14px out to the scroll viewport's padding box. */
            "-mx-3.5 px-3.5",
            animate && "transition-[visibility] duration-200 motion-reduce:transition-none",
            !open && "invisible",
          )}
        >
          {/* Depth-1 folder context indents children off the rail and enables
              the emphasised rail segment on the active item. The rail itself
              is a pseudo-element: decorative, unfocusable, absent from the
              accessibility tree. */}
          <SidebarFolder
            collapsible={false}
            className={cn(
              "relative flex flex-col gap-0.5",
              "before:bg-fd-border before:absolute before:inset-y-1 before:start-2.5 before:w-px before:content-['']",
            )}
          >
            {children}
          </SidebarFolder>
        </div>
      </div>
    </div>
  );
}
