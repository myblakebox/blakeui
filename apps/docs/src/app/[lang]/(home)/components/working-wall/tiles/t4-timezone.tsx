"use client";

import type {Key} from "@blakeui/react";

import {Card, ComboBox, Input, Label, ListBox} from "@blakeui/react";
import {useState} from "react";

const TIMEZONES = [
  {city: "Los Angeles", id: "los-angeles", offset: "UTC−8"},
  {city: "Denver", id: "denver", offset: "UTC−7"},
  {city: "New York", id: "new-york", offset: "UTC−5"},
  {city: "São Paulo", id: "sao-paulo", offset: "UTC−3"},
  {city: "London", id: "london", offset: "UTC+0"},
  {city: "Berlin", id: "berlin", offset: "UTC+1"},
  {city: "Mumbai", id: "mumbai", offset: "UTC+5:30"},
  {city: "Tokyo", id: "tokyo", offset: "UTC+9"},
];

/**
 * T4 — Timezone ComboBox. Typing filters the static list live (React Aria's
 * built-in contains filtering); arrow keys + Enter are the native ComboBox
 * keyboard behaviour. Selection stays quiet by design: no toast, just the
 * aria-live readout line under the field.
 */
export function TimezoneTile() {
  const [zone, setZone] = useState<Key | null>("london");

  const active = TIMEZONES.find((entry) => entry.id === zone);

  return (
    <Card className="w-full border border-border/50">
      <Card.Header className="w-full">
        <Card.Title>Set your timezone</Card.Title>
        <Card.Description>Digests and reminders follow it.</Card.Description>
      </Card.Header>
      <Card.Content className="w-full gap-2 pt-0">
        <ComboBox className="w-full" selectedKey={zone} onSelectionChange={(key) => setZone(key)}>
          <Label>Timezone</Label>
          <ComboBox.InputGroup className="w-full">
            <Input className="w-full" placeholder="Search cities…" />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              {TIMEZONES.map((entry) => (
                <ListBox.Item
                  key={entry.id}
                  id={entry.id}
                  textValue={`${entry.city} ${entry.offset}`}
                >
                  {entry.city}
                  <span className="ms-auto text-xs text-muted">{entry.offset}</span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </ComboBox.Popover>
        </ComboBox>
        <p aria-live="polite" className="text-xs text-muted">
          {active ? `Clocks set to ${active.city} (${active.offset}).` : "No timezone selected."}
        </p>
      </Card.Content>
    </Card>
  );
}
