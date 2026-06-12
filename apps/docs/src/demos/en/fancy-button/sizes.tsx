import {FancyButton} from "@blakeui/react";

export function Sizes() {
  return (
    <div className="flex items-center gap-3">
      <FancyButton size="sm">Small</FancyButton>
      <FancyButton size="md">Medium</FancyButton>
      <FancyButton size="lg">Large</FancyButton>
    </div>
  );
}
