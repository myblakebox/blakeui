"use client";

import {DateField, Label} from "@blakeui/react";
import {Calendar, ChevronDown} from "@gravity-ui/icons";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-4">
      <DateField fullWidth name="date">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField fullWidth name="date-icons">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Prefix>
            <Calendar className="size-4 text-muted" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <ChevronDown className="size-4 text-muted" />
          </DateField.Suffix>
        </DateField.Group>
      </DateField>
    </div>
  );
}
