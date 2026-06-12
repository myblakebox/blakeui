import {FancyButton} from "@blakeui/react";

export function Variants() {
  return (
    <div className="flex flex-wrap gap-3">
      <FancyButton>Primary</FancyButton>
      <FancyButton variant="neutral">Neutral</FancyButton>
      <FancyButton variant="danger">Danger</FancyButton>
      <FancyButton variant="basic">Basic</FancyButton>
    </div>
  );
}
