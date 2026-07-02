"use client";

import type {Key} from "@blakeui/react";

import {Button, Card, Label, ListBox, NumberField, Select, Slider, toast} from "@blakeui/react";
import {useState} from "react";

const CURRENCIES = [
  {code: "USD", id: "usd", name: "USD — US Dollar"},
  {code: "EUR", id: "eur", name: "EUR — Euro"},
  {code: "GBP", id: "gbp", name: "GBP — British Pound"},
];

const MIN_PAYOUT = 50;
const MAX_PAYOUT = 1000;
const STEP = 10;

/**
 * T2 — Payout threshold. The Slider and the NumberField are two views over ONE
 * state value — moving either updates both — and the currency Select drives the
 * number formatting live.
 */
export function PayoutThresholdTile() {
  const [currency, setCurrency] = useState<Key | null>("usd");
  const [threshold, setThreshold] = useState(250);

  const active = CURRENCIES.find((entry) => entry.id === currency) ?? CURRENCIES[0]!;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      currency: active.code,
      maximumFractionDigits: 0,
      style: "currency",
    }).format(value);

  return (
    <Card className="w-full border border-border/50">
      <Card.Header className="w-full">
        <Card.Title>Payout threshold</Card.Title>
        <Card.Description>Get paid once your balance clears the bar.</Card.Description>
      </Card.Header>
      <Card.Content className="w-full gap-4 pt-0">
        <Select className="w-full" placeholder="Currency" value={currency} onChange={setCurrency}>
          <Label>Currency</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {CURRENCIES.map((entry) => (
                <ListBox.Item key={entry.id} id={entry.id} textValue={entry.name}>
                  {entry.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <NumberField
          className="w-full"
          formatOptions={{currency: active.code, maximumFractionDigits: 0, style: "currency"}}
          maxValue={MAX_PAYOUT}
          minValue={MIN_PAYOUT}
          step={STEP}
          value={threshold}
          onChange={(value) => {
            if (Number.isFinite(value)) setThreshold(value);
          }}
        >
          <Label>Minimum payout</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <div className="flex w-full flex-col gap-1">
          <Slider
            aria-label="Minimum payout"
            className="w-full"
            maxValue={MAX_PAYOUT}
            minValue={MIN_PAYOUT}
            step={STEP}
            value={threshold}
            onChange={(value) =>
              setThreshold(Array.isArray(value) ? (value[0] ?? MIN_PAYOUT) : value)
            }
          >
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb>
                {/* Floating value badge — revealed while dragging (or keyboard
                    focus) and positioned by working-wall.css. */}
                <span
                  aria-hidden
                  className="rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium text-background shadow-sm"
                  data-slider-badge=""
                >
                  {formatCurrency(threshold)}
                </span>
              </Slider.Thumb>
            </Slider.Track>
          </Slider>
          <div className="flex w-full justify-between text-xs text-muted">
            <span>{formatCurrency(MIN_PAYOUT)}</span>
            <span>{formatCurrency(MAX_PAYOUT)}</span>
          </div>
        </div>
      </Card.Content>
      <Card.Footer className="w-full">
        <Button
          className="w-full"
          variant="primary"
          onPress={() => toast.success(`Payout threshold set to ${formatCurrency(threshold)}`)}
        >
          Save threshold
        </Button>
      </Card.Footer>
    </Card>
  );
}
