import {Switch} from "@blakeui/react";

export function WithoutLabel() {
  return (
    <Switch aria-label="Enable notifications">
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}
