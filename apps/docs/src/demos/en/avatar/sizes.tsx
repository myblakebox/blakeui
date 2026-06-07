import {Avatar} from "@blakeui/react";

export function Sizes() {
  return (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <Avatar.Image alt="Small Avatar" src="https://cdn.blakeui.com/avatars/blue.jpg" />
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar>
      <Avatar size="md">
        <Avatar.Image alt="Medium Avatar" src="https://cdn.blakeui.com/avatars/purple.jpg" />
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <Avatar size="lg">
        <Avatar.Image alt="Large Avatar" src="https://cdn.blakeui.com/avatars/red.jpg" />
        <Avatar.Fallback>LG</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
