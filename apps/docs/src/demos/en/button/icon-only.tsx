import {Button} from "@blakeui/react";
import {Ellipsis, Gear, TrashBin} from "@gravity-ui/icons";

export function IconOnly() {
  return (
    <div className="flex gap-3">
      <Button isIconOnly variant="tertiary">
        <Ellipsis />
      </Button>
      <Button isIconOnly variant="secondary">
        <Gear />
      </Button>
      <Button isIconOnly variant="danger">
        <TrashBin />
      </Button>
    </div>
  );
}
