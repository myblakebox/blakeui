import {Label, Switch} from "@blakeui/react";

export function Basic() {
  return (
    <Switch>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">Enable notifications</Label>
      </Switch.Content>
    </Switch>
  );
}
