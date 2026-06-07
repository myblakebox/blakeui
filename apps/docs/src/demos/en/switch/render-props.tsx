"use client";

import {Label, Switch} from "@blakeui/react";

export function RenderProps() {
  return (
    <Switch>
      {({isSelected}) => (
        <>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm">{isSelected ? "Enabled" : "Disabled"}</Label>
          </Switch.Content>
        </>
      )}
    </Switch>
  );
}
