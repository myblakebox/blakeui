"use client";

import {InputGroup, Label, TextField} from "@blakeui/react";
import {Globe} from "@gravity-ui/icons";

export function WithIconPrefixAndTextSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="blakeui" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
