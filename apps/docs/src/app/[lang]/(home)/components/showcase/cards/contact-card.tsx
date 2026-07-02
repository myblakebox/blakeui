"use client";

import {Avatar, Card, CloseButton, FancyButton} from "@blakeui/react";
import {useState} from "react";

import {Iconify} from "@/components/iconify";

import {contact} from "../data/placeholder";

/* Success-colored FancyButton via its own CSS variables, keeping the tokens */
const addedClasses = [
  "[--fancy-button-bg:var(--success)]",
  "[--fancy-button-bg-hover:var(--success-hover)]",
  "[--fancy-button-bg-pressed:var(--success-hover)]",
  "[--fancy-button-fg:var(--success-foreground)]",
].join(" ");

export function ContactCard() {
  const [isAdded, setIsAdded] = useState(false);

  return (
    <Card className="relative w-full items-center text-center">
      <CloseButton aria-label="Dismiss contact card" className="absolute top-3 right-3" />
      <Card.Content className="w-full items-center gap-1 pt-8">
        <Avatar size="lg">
          <Avatar.Fallback>{contact.initials}</Avatar.Fallback>
        </Avatar>
        <p className="mt-2 font-semibold">{contact.name}</p>
        <p className="text-sm text-muted">
          {contact.handle} &middot; {contact.subtitle}
        </p>
      </Card.Content>
      <Card.Footer className="w-full">
        <FancyButton
          fullWidth
          className={isAdded ? addedClasses : undefined}
          variant="primary"
          onPress={() => setIsAdded((added) => !added)}
        >
          {isAdded ? (
            <>
              <Iconify className="text-base" icon="check" />
              Added
            </>
          ) : (
            <>
              <Iconify className="text-base" icon="plus" />
              Add Contact
            </>
          )}
        </FancyButton>
      </Card.Footer>
    </Card>
  );
}
