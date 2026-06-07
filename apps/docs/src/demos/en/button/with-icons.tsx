import {Button} from "@blakeui/react";
import {Envelope, Globe, Plus, TrashBin} from "@gravity-ui/icons";

export function WithIcons() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button>
        <Globe />
        Search
      </Button>
      <Button variant="secondary">
        <Plus />
        Add Member
      </Button>
      <Button variant="tertiary">
        <Envelope />
        Email
      </Button>
      <Button variant="danger">
        <TrashBin />
        Delete
      </Button>
    </div>
  );
}
