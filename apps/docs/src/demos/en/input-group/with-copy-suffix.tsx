"use client";

import {Button, InputGroup, Label, TextField} from "@blakeui/react";
import {Copy} from "@gravity-ui/icons";

export function WithCopySuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="blakeui.com" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix className="pr-0">
          <Button isIconOnly aria-label="Copy" size="sm" variant="ghost">
            <Copy className="size-4" />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
