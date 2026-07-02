"use client";

import {Checkbox, ProgressCircle, Radio, RadioGroup, Spinner, Switch} from "@blakeui/react";

/**
 * Naked micro-cluster ported from the working wall's l2 tile: a loose row of
 * the smallest primitives sitting directly on the canvas — no card, no
 * border, and no padding of its own (the grid gap is the only rhythm).
 * Everything is the real interactive component.
 */
export function ControlClusterCard() {
  return (
    <div className="flex w-full items-center justify-center gap-6">
      <Checkbox defaultSelected aria-label="Example checkbox, checked">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>

      <Switch defaultSelected aria-label="Example switch, on">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>

      {/* A real two-option group: selecting one deselects the other.
          The empty radio leads, matching the reference. */}
      <RadioGroup
        aria-label="Example radio pair"
        className="flex-row items-center gap-3"
        defaultValue="on"
        name="showcase-cluster-radio"
        orientation="horizontal"
      >
        <Radio aria-label="Option A" value="off">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
        </Radio>
        <Radio aria-label="Option B, selected" value="on">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
        </Radio>
      </RadioGroup>

      <Spinner size="sm" />

      <ProgressCircle aria-label="Storage used" size="sm" value={72}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>
  );
}
