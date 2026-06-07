import {CloseButton} from "@blakeui/react";
import {CircleXmark, Xmark} from "@gravity-ui/icons";

export function WithCustomIcon() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <CloseButton>
          <CircleXmark />
        </CloseButton>
        <span className="text-xs text-muted">Custom Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseButton>
          <Xmark />
        </CloseButton>
        <span className="text-xs text-muted">Alternative Icon</span>
      </div>
    </div>
  );
}
