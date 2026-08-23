"use client";

import type {ComponentProps} from "react";

import {useTheme} from "next-themes";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {tv} from "tailwind-variants";

import {Airplay, Moon, Sun} from "@/components/fumadocs/ui/icons";
import {useIsMounted} from "@/hooks/use-is-mounted";
import {cn} from "@/utils/cn";

import "./theme-toggle-pill.css";

const itemVariants = tv({
  base: "text-fd-muted-foreground size-6.5 rounded-full p-1.5",
  variants: {
    active: {
      false: "text-fd-muted-foreground",
      true: "bg-fd-accent text-fd-accent-foreground",
    },
  },
});

// Three-state segments: the sliding pill paints the active background, so the
// active segment only changes text color. Segments sit above the pill (z-1).
const segmentVariants = tv({
  base: "text-fd-muted-foreground relative z-1 size-6.5 rounded-full p-1.5",
  variants: {
    active: {
      false: "text-fd-muted-foreground",
      true: "text-fd-accent-foreground",
    },
  },
});

const full = [["light", Sun] as const, ["dark", Moon] as const, ["system", Airplay] as const];

/** The pill's 250ms slide plus a settle frame — how long a deferred setTheme waits. */
const PILL_SLIDE_MS = 270;

/**
 * Slot-compatible three-state toggle for layouts that render fumadocs'
 * `slots.themeSwitch` (HomeLayout). The slot is invoked without a `mode`
 * prop, and ThemeToggle defaults to the two-state variant — this pins the
 * light/dark/system control the shared nav uses everywhere else.
 */
export function NavThemeToggle(props: ComponentProps<"div">) {
  return <ThemeToggle {...props} mode="light-dark-system" />;
}

export function ThemeToggle({
  className,
  mode = "light-dark",
  ...props
}: ComponentProps<"div"> & {
  mode?: "light-dark" | "light-dark-system";
}) {
  const {resolvedTheme, setTheme, theme} = useTheme();
  const mounted = useIsMounted();

  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState(false);

  // The pill slides on LOCAL state and the real setTheme is deferred until the
  // slide has played — the account-menu-card pattern: RootProvider runs
  // next-themes with disableTransitionOnChange, which injects
  // `* { transition: none !important }` for the exact window in which the
  // theme flips, so a theme-derived pill could never animate.
  const [localTheme, setLocalTheme] = useState<string | undefined>(undefined);
  const pendingThemeRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(pendingThemeRef.current), []);

  // Sync from external changes (any control driving the same next-themes
  // state), delayed a tick so a slide in this direction starts after the
  // transition-kill style is gone. The toggle's own deferred write also lands
  // here, where the sync simply confirms the state it just set.
  useEffect(() => {
    const timeout = setTimeout(() => setLocalTheme(theme), 60);

    return () => clearTimeout(timeout);
  }, [theme]);

  function selectTheme(key: string) {
    setLocalTheme(key);
    clearTimeout(pendingThemeRef.current);

    // Reduced motion (either opt-out): no slide to wait for — flip immediately.
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      listRef.current?.closest('[data-reduce-motion="true"]') != null;

    pendingThemeRef.current = setTimeout(() => setTheme(key), reduce ? 0 : PILL_SLIDE_MS);
  }

  const selected = mode === "light-dark-system" && mounted ? (localTheme ?? theme) : null;

  // Position the pill over the selected segment. Purely visual: selection
  // state, focus, and keyboard behavior live on the buttons, untouched.
  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;

    if (!list || !pill) return;

    const position = () => {
      const active = selected
        ? list.querySelector<HTMLButtonElement>(`button[data-theme-item="${selected}"]`)
        : null;

      if (!active) {
        pill.style.opacity = "0";

        return;
      }

      pill.style.opacity = "1";
      pill.style.width = `${active.offsetWidth}px`;
      pill.style.height = `${active.offsetHeight}px`;
      pill.style.translate = `${active.offsetLeft}px ${active.offsetTop}px`;
    };

    position();

    // Track segment geometry changes (font swap, zoom, container reflow) —
    // a one-shot measurement would leave the pill stranded.
    const observer = new ResizeObserver(position);

    observer.observe(list);
    list.querySelectorAll("button").forEach((button) => observer.observe(button));

    return () => observer.disconnect();
  }, [selected]);

  // Arm the slide one frame after first paint so a hard load (whatever the
  // stored theme) renders the pill in place instead of replaying a slide.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(true));

    return () => cancelAnimationFrame(raf);
  }, []);

  const container = cn(
    "theme-toggle-track inline-flex cursor-(--cursor-interactive) items-center rounded-full border p-1",
    className,
  );

  if (mode === "light-dark") {
    const value = mounted ? resolvedTheme : null;

    return (
      <button
        aria-label="Toggle Theme"
        className={container}
        data-theme-toggle=""
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
      >
        {full.map(([key, Icon]) => {
          if (key === "system") return;

          return (
            <Icon
              key={key}
              className={cn(itemVariants({active: value === key}))}
              fill="currentColor"
            />
          );
        })}
      </button>
    );
  }

  return (
    <div ref={listRef} className={cn(container, "relative")} data-theme-toggle="" {...props}>
      <span
        ref={pillRef}
        aria-hidden
        className={cn("theme-toggle-pill rounded-full", animated && "theme-toggle-pill--animated")}
      />
      {full.map(([key, Icon]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(segmentVariants({active: selected === key}))}
          data-active={selected === key || undefined}
          data-theme-item={key}
          onClick={() => selectTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
