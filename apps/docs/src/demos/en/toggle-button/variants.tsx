import {ToggleButton} from "@blakeui/react";
import {Heart} from "@gravity-ui/icons";

export function Variants() {
  return (
    <div className="flex items-center gap-3">
      <ToggleButton>
        <Heart />
        Default
      </ToggleButton>
      <ToggleButton variant="ghost">
        <Heart />
        Ghost
      </ToggleButton>
    </div>
  );
}
