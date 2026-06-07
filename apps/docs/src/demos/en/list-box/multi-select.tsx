import {Avatar, Description, Label, ListBox, Surface} from "@blakeui/react";

export function MultiSelect() {
  return (
    <Surface className="w-[256px] rounded-3xl shadow-surface">
      <ListBox aria-label="Users" selectionMode="multiple">
        <ListBox.Item id="1" textValue="Bob">
          <Avatar size="sm">
            <Avatar.Image alt="Bob" src="https://cdn.blakeui.com/avatars/blue.jpg" />
            <Avatar.Fallback>B</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Label>Bob</Label>
            <Description>bob@blakeui.com</Description>
          </div>
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Item id="2" textValue="Fred">
          <Avatar size="sm">
            <Avatar.Image alt="Fred" src="https://cdn.blakeui.com/avatars/green.jpg" />
            <Avatar.Fallback>F</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Label>Fred</Label>
            <Description>fred@blakeui.com</Description>
          </div>
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Item id="3" textValue="Martha">
          <Avatar size="sm">
            <Avatar.Image alt="Martha" src="https://cdn.blakeui.com/avatars/purple.jpg" />
            <Avatar.Fallback>M</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Label>Martha</Label>
            <Description>martha@blakeui.com</Description>
          </div>
          <ListBox.ItemIndicator />
        </ListBox.Item>
      </ListBox>
    </Surface>
  );
}
