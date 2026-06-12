import {FancyButton} from "@blakeui/react";
import {Ellipsis, Gear, TrashBin} from "@gravity-ui/icons";

export function IconOnly() {
  return (
    <div className="flex gap-3">
      <FancyButton isIconOnly aria-label="More options">
        <Ellipsis />
      </FancyButton>
      <FancyButton isIconOnly aria-label="Settings" variant="neutral">
        <Gear />
      </FancyButton>
      <FancyButton isIconOnly aria-label="Delete" variant="danger">
        <TrashBin />
      </FancyButton>
    </div>
  );
}
