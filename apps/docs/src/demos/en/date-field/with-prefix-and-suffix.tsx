"use client";

import {DateField, Description, Label} from "@blakeui/react";
import {Calendar, ChevronDown} from "@gravity-ui/icons";

export function WithPrefixAndSuffix() {
  return (
    <DateField className="w-[256px]" name="date">
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
      <Description>Enter a date</Description>
    </DateField>
  );
}
