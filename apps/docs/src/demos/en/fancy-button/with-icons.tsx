import {FancyButton} from "@blakeui/react";
import {Envelope, Globe, Plus, TrashBin} from "@gravity-ui/icons";

export function WithIcons() {
  return (
    <div className="flex flex-wrap gap-3">
      <FancyButton>
        <Globe />
        Search
      </FancyButton>
      <FancyButton variant="neutral">
        <Plus />
        Add Member
      </FancyButton>
      <FancyButton variant="danger">
        <TrashBin />
        Delete
      </FancyButton>
      <FancyButton variant="basic">
        <Envelope />
        Email
      </FancyButton>
    </div>
  );
}
