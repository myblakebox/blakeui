"use client";

import {Card, Chip, Label, Menu, MenuItem, Separator, Switch} from "@blakeui/react";
import {useTheme} from "next-themes";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";
import {useIsMounted} from "@/hooks/use-is-mounted";

import {account} from "../data/placeholder";
import {GradientAvatar} from "../gradient-avatar";
import {prefersReducedMotion} from "../use-replay";

/** Matches the switch thumb's 300ms margin transition (switch.css). */
const THUMB_SLIDE_MS = 320;

export function AccountMenuCard() {
  const {resolvedTheme, setTheme, theme} = useTheme();
  const isMounted = useIsMounted();
  const themeIsDark = isMounted && resolvedTheme === "dark";

  /**
   * The switch is locally controlled rather than derived straight from
   * resolvedTheme: fumadocs' RootProvider runs next-themes with
   * disableTransitionOnChange, which injects `* { transition: none !important }`
   * for the exact window in which the theme flips — so a theme-derived thumb
   * could never animate. Instead the thumb slides on local state immediately
   * and the real setTheme is deferred until the slide has played.
   */
  const [isDark, setIsDark] = useState(false);
  const pendingThemeRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(pendingThemeRef.current), []);

  // Sync from external changes (any control driving the same next-themes
  // state) and drop a still-pending deferred write — the user's most recent
  // action wins, and a cancelled press must not leave the thumb stranded.
  // Watching `theme` as well catches switches to "system" that leave
  // resolvedTheme unchanged. The card's own deferred write also lands here,
  // but its timer has already fired, so the clear is a no-op and the sync
  // confirms the state it just set. The sync is delayed a tick so the slide
  // starts after next-themes has removed its transition-kill style — the
  // thumb animates in this direction too.
  useEffect(() => {
    clearTimeout(pendingThemeRef.current);

    const timeout = setTimeout(() => setIsDark(themeIsDark), 60);

    return () => clearTimeout(timeout);
  }, [theme, themeIsDark]);

  const toggleTheme = (selected: boolean) => {
    setIsDark(selected);
    clearTimeout(pendingThemeRef.current);

    // Reduced motion: no slide to wait for — flip the theme immediately.
    const delay = prefersReducedMotion() ? 0 : THUMB_SLIDE_MS;

    pendingThemeRef.current = setTimeout(() => setTheme(selected ? "dark" : "light"), delay);
  };

  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center gap-3">
        <GradientAvatar name={account.name} />
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">{account.name}</span>
            <Chip color="accent" size="sm" variant="soft">
              {account.plan}
            </Chip>
          </div>
          <span className="w-full truncate text-left text-sm text-muted">{account.email}</span>
        </div>
      </Card.Header>
      <Card.Content className="w-full gap-1 py-0">
        <Switch
          className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5"
          isSelected={isDark}
          onChange={toggleTheme}
        >
          <span className="flex items-center gap-2 text-sm">
            <Iconify className="text-base text-muted" icon="moon" />
            Dark Mode
          </span>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch>
        <Separator className="my-1" />
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
        <Menu aria-label="Session" className="w-full" onAction={() => {}}>
          <MenuItem id="add-account" textValue="Add Account">
            <Iconify className="text-base text-muted" icon="plus" />
            <Label>Add Account</Label>
          </MenuItem>
          <MenuItem id="logout" textValue="Logout" variant="danger">
            <Iconify className="text-base" icon="power" />
            <Label>Logout</Label>
          </MenuItem>
        </Menu>
      </Card.Content>
      <Card.Footer className="w-full justify-center text-xs text-muted">
        BlakeUI {account.version} &middot; Terms
      </Card.Footer>
    </Card>
  );
}
