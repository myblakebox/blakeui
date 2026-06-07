import {Button, Tooltip} from "@blakeui/react";
import {CircleInfo} from "@gravity-ui/icons";

export function TooltipBasic() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip delay={0}>
        <Button variant="secondary">Hover me</Button>
        <Tooltip.Content>
          <p>This is a tooltip</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Button isIconOnly variant="tertiary">
          <CircleInfo />
        </Button>
        <Tooltip.Content>
          <p>More information</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
