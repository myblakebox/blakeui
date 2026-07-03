"use client";

import {Avatar, Card, Chip, Label, Menu, MenuItem, Separator, Switch} from "@blakeui/react";
import {useTheme} from "next-themes";
import {useRef} from "react";
import {flushSync} from "react-dom";

import {Iconify} from "@/components/iconify";
import {useIsMounted} from "@/hooks/use-is-mounted";

/**
 * T1 — Account menu. The Dark Mode switch drives the REAL page theme through the
 * same next-themes state as the header toggle, so flipping either keeps both in
 * sync. The mount guard avoids a hydration mismatch on the resolved theme.
 */
export function AccountMenuTile() {
  const {resolvedTheme, setTheme} = useTheme();
  const isMounted = useIsMounted();
  const isDark = isMounted && resolvedTheme === "dark";
  const controlRef = useRef<HTMLSpanElement>(null);

  /**
   * FLAGGED FLOURISH (Gate D6, for Greg's review): theme flips from this tile
   * radially reveal from the switch via the View Transitions API. Feature-
   * detected and skipped under reduced motion — both paths fall back to a plain
   * setTheme. The data-theme-wipe attribute scopes the CSS in working-wall.css
   * to transitions started here, and flushSync makes next-themes commit the
   * class change inside the transition's DOM-update callback.
   */
  const applyTheme = (selected: boolean) => {
    const next = selected ? "dark" : "light";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof document.startViewTransition !== "function") {
      setTheme(next);

      return;
    }

    const root = document.documentElement;
    const origin = controlRef.current?.getBoundingClientRect();

    root.setAttribute("data-theme-wipe", "");
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready
      .then(() => {
        const x = origin ? origin.left + origin.width / 2 : window.innerWidth / 2;
        const y = origin ? origin.top + origin.height / 2 : window.innerHeight / 2;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        root.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)"},
        );
      })
      .catch(() => {});

    void transition.finished.finally(() => root.removeAttribute("data-theme-wipe"));
  };

  return (
    <Card className="w-full border border-border/50">
      <Card.Header className="w-full flex-row items-center gap-3">
        <Avatar>
          <Avatar.Image alt="Portrait of Blake Morgan" src="/images/avatar-blake-morgan.svg" />
          <Avatar.Fallback>BM</Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">Blake Morgan</span>
            {/* Plan label. The exported Badge is an anchored count/dot indicator, so the
                pill-shaped Chip is the correct primitive here (flagged at Gate B). */}
            <Chip color="accent" size="sm" variant="soft">
              Free
            </Chip>
          </div>
          <span className="w-full truncate text-left text-sm text-muted">blake@blakeui.dev</span>
        </div>
      </Card.Header>
      <Card.Content className="w-full gap-1 pt-0">
        <Menu aria-label="Account" className="w-full" onAction={() => {}}>
          <MenuItem id="activity" textValue="Activity">
            <Iconify className="text-base text-muted" icon="clock" />
            <Label>Activity</Label>
          </MenuItem>
          <MenuItem id="integrations" textValue="Integrations">
            <Iconify className="text-base text-muted" icon="plug-connection" />
            <Label>Integrations</Label>
          </MenuItem>
          <MenuItem id="settings" textValue="Settings">
            <Iconify className="text-base text-muted" icon="gear" />
            <Label>Settings</Label>
          </MenuItem>
        </Menu>
        <Separator className="my-1" />
        <Switch
          className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5"
          isSelected={isDark}
          onChange={applyTheme}
        >
          <span className="flex items-center gap-2 text-sm">
            <Iconify className="text-base text-muted" icon="moon" />
            Dark Mode
          </span>
          <Switch.Control ref={controlRef}>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
        <Separator className="my-1" />
        <Menu aria-label="Session" className="w-full" onAction={() => {}}>
          <MenuItem id="log-out" textValue="Log out" variant="danger">
            <Iconify className="text-base" icon="power" />
            <Label>Log out</Label>
          </MenuItem>
        </Menu>
      </Card.Content>
    </Card>
  );
}
