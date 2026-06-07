import {ToggleButton} from "@blakeui/react";
import {Bookmark, Heart} from "@gravity-ui/icons";

export function IconOnly() {
  return (
    <div className="flex items-center gap-3">
      <ToggleButton isIconOnly aria-label="Like">
        <Heart />
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Bookmark" variant="ghost">
        <Bookmark />
      </ToggleButton>
    </div>
  );
}
