"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Chip,
  Description,
  Label,
  ListBox,
  Select,
} from "@blakeui/react";

export function CustomValueMultiple() {
  const users = [
    {
      avatarUrl: "https://cdn.blakeui.com/avatars/blue.jpg",
      email: "bob@blakeui.com",
      fallback: "B",
      id: "1",
      name: "Bob",
    },
    {
      avatarUrl: "https://cdn.blakeui.com/avatars/green.jpg",
      email: "fred@blakeui.com",
      fallback: "F",
      id: "2",
      name: "Fred",
    },
    {
      avatarUrl: "https://cdn.blakeui.com/avatars/purple.jpg",
      email: "martha@blakeui.com",
      fallback: "M",
      id: "3",
      name: "Martha",
    },
    {
      avatarUrl: "https://cdn.blakeui.com/avatars/red.jpg",
      email: "john@blakeui.com",
      fallback: "J",
      id: "4",
      name: "John",
    },
    {
      avatarUrl: "https://cdn.blakeui.com/avatars/orange.jpg",
      email: "jane@blakeui.com",
      fallback: "J",
      id: "5",
      name: "Jane",
    },
  ];

  return (
    <Select
      className="w-[256px]"
      defaultValue={["1", "2"]}
      placeholder="Select your teammates"
      selectionMode="multiple"
    >
      <Label>Users</Label>
      <Select.Trigger>
        <Select.Value className="no-truncate flex flex-wrap gap-2">
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return selectedItemsKeys.map((selectedItemKey) => {
              const selectedItem = users.find((user) => user.id === selectedItemKey);

              if (!selectedItem) {
                return null;
              }

              return (
                <Chip key={selectedItemKey} variant="soft">
                  <Avatar className="size-4" size="sm">
                    <AvatarImage src={selectedItem.avatarUrl} />
                    <AvatarFallback>{selectedItem.fallback}</AvatarFallback>
                  </Avatar>
                  <Chip.Label>{selectedItem.name}</Chip.Label>
                </Chip>
              );
            });
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {users.map((user) => (
            <ListBox.Item key={user.id} id={user.id} textValue={user.name}>
              <Avatar size="sm">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Label>{user.name}</Label>
                <Description>{user.email}</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
