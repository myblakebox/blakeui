"use client";

import {InputGroup, Label, TextField} from "@blakeui/react";
import {Envelope} from "@gravity-ui/icons";

export function Default() {
  return (
    <TextField className="w-full max-w-[280px]" name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
      </InputGroup>
    </TextField>
  );
}
