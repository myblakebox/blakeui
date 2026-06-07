import {Label, Switch} from "@blakeui/react";

export function DefaultSelected() {
  return (
    <Switch defaultSelected>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">Enable notifications</Label>
      </Switch.Content>
    </Switch>
  );
}
