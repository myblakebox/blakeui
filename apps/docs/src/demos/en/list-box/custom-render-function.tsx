"use client";

import {Avatar, Description, Label, ListBox} from "@blakeui/react";

export function CustomRenderFunction() {
  return (
    <ListBox
      aria-label="Users"
      className="w-[220px]"
      render={(props) => <div {...props} data-custom="true" />}
      selectionMode="single"
    >
      <ListBox.Item
        id="1"
        render={(props) => <span {...props} data-custom="foo" />}
        textValue="Bob"
      >
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
      <ListBox.Item
        id="2"
        render={(props) => <span {...props} data-custom="bar" />}
        textValue="Fred"
      >
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
      <ListBox.Item
        id="3"
        render={(props) => <span {...props} data-custom="baz" />}
        textValue="Martha"
      >
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
  );
}
