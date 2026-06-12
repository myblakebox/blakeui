import {FancyButton} from "@blakeui/react";

export function Disabled() {
  return (
    <div className="flex flex-wrap gap-3">
      <FancyButton isDisabled>Primary</FancyButton>
      <FancyButton isDisabled variant="neutral">
        Neutral
      </FancyButton>
      <FancyButton isDisabled variant="danger">
        Danger
      </FancyButton>
      <FancyButton isDisabled variant="basic">
        Basic
      </FancyButton>
    </div>
  );
}
