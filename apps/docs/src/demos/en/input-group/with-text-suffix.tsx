"use client";

import {InputGroup, Label, TextField} from "@blakeui/react";

export function WithTextSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="blakeui" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
