"use client";

import {Label, TimeField} from "@blakeui/react";
import {Clock} from "@gravity-ui/icons";

export function WithSuffixIcon() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <Clock className="size-4 text-muted" />
        </TimeField.Suffix>
      </TimeField.Group>
    </TimeField>
  );
}
