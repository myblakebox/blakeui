"use client";

import {Button, Card, Description, Label, Switch, SwitchGroup, toast} from "@blakeui/react";
import {useState} from "react";

const PREFERENCES = [
  {description: "New components the moment they ship.", id: "releases", label: "Release notes"},
  {description: "When someone mentions you in a thread.", id: "mentions", label: "Mentions"},
  {description: "A summary of your workspace every Monday.", id: "digest", label: "Weekly digest"},
];

/**
 * T3 — Notification preferences. Three real Switch rows in a SwitchGroup; saving
 * fires a real success Toast through the app-wide `Toast.Provider`.
 */
export function NotificationPreferencesTile() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    digest: false,
    mentions: true,
    releases: true,
  });

  return (
    <Card className="w-full border border-border/50">
      <Card.Header className="w-full">
        <Card.Title>Notification preferences</Card.Title>
        <Card.Description>Choose what lands in your inbox.</Card.Description>
      </Card.Header>
      <Card.Content className="w-full pt-0">
        <SwitchGroup aria-label="Notification preferences" className="w-full gap-3">
          {PREFERENCES.map((preference) => (
            <Switch
              key={preference.id}
              className="flex w-full items-start justify-between gap-3"
              isSelected={selected[preference.id] ?? false}
              onChange={(isOn) => setSelected((current) => ({...current, [preference.id]: isOn}))}
            >
              <Switch.Content className="flex min-w-0 flex-col gap-0.5">
                <Label className="text-sm">{preference.label}</Label>
                <Description>{preference.description}</Description>
              </Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          ))}
        </SwitchGroup>
      </Card.Content>
      <Card.Footer className="w-full">
        <Button
          className="w-full"
          variant="primary"
          onPress={() => toast.success("Notification preferences saved")}
        >
          Save preferences
        </Button>
      </Card.Footer>
    </Card>
  );
}
