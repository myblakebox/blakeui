"use client";

import {Avatar, Card, Chip, Label, Menu, MenuItem, Separator, Switch} from "@blakeui/react";
import {useTheme} from "next-themes";

import {Iconify} from "@/components/iconify";
import {useIsMounted} from "@/hooks/use-is-mounted";

import {account} from "../data/placeholder";

export function AccountMenuCard() {
  const {resolvedTheme, setTheme} = useTheme();
  const isMounted = useIsMounted();
  // Drives the real page theme through the same next-themes state as the
  // header toggle, so flipping either keeps both in sync.
  const isDark = isMounted && resolvedTheme === "dark";

  return (
    <Card className="w-full">
      <Card.Header className="w-full flex-row items-center gap-3">
        <Avatar>
          <Avatar.Fallback>{account.initials}</Avatar.Fallback>
        </Avatar>
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
          onChange={(selected) => setTheme(selected ? "dark" : "light")}
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
