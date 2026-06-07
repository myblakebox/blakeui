import {Avatar} from "@blakeui/react";

export function Basic() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <Avatar.Image alt="John Doe" src="https://cdn.blakeui.com/avatars/users/3.jpg" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image alt="Blue" src="https://cdn.blakeui.com/avatars/blue.jpg" />
        <Avatar.Fallback>B</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>JR</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
