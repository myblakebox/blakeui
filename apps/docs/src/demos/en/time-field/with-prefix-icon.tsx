"use client";

import {Label, TimeField} from "@blakeui/react";
import {Clock} from "@gravity-ui/icons";

export function WithPrefixIcon() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <Clock className="size-4 text-muted" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
