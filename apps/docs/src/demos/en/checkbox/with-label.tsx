import {Checkbox, Label} from "@blakeui/react";

export function WithLabel() {
  return (
    <Checkbox id="label-marketing">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="label-marketing">Send me marketing emails</Label>
      </Checkbox.Content>
    </Checkbox>
  );
}
