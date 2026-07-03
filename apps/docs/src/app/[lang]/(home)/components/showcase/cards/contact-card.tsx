"use client";

import {Card, CloseButton, FancyButton, Spinner} from "@blakeui/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {contact} from "../data/placeholder";
import {GradientAvatar} from "../gradient-avatar";
import {prefersReducedMotion, useAutoRevert} from "../use-replay";

/**
 * FancyButton ships no success variant in 1.1.2 (basic/danger/neutral/primary
 * only), so the green comes from the component's own CSS custom properties
 * pointed at the real --success semantic tokens.
 */
const addedClasses = [
  "border-transparent",
  "[--fancy-button-bg:var(--success)]",
  "[--fancy-button-bg-hover:var(--success-hover)]",
  "[--fancy-button-bg-pressed:var(--success-hover)]",
  "[--fancy-button-fg:var(--success-foreground)]",
].join(" ");

type AddState = "added" | "adding" | "idle";

const ADD_DURATION_MS = 1200;

export function ContactCard() {
  const [addState, setAddState] = useState<AddState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Replay rule: the success state auto-reverts so the story can run again.
  useAutoRevert(addState === "added", () => setAddState("idle"));

  const addContact = () => {
    if (addState !== "idle") return;

    // Reduced motion: the pending spinner becomes an instant swap to success.
    if (prefersReducedMotion()) {
      setAddState("added");

      return;
    }

    setAddState("adding");
    timeoutRef.current = setTimeout(() => setAddState("added"), ADD_DURATION_MS);
  };

  return (
    <Card className="relative w-full items-center text-center">
      <CloseButton aria-label="Dismiss contact card" className="absolute top-3 right-3" />
      <Card.Content className="w-full items-center gap-1 pt-8">
        <GradientAvatar name={contact.name} size="lg" />
        <p className="mt-2 font-semibold">{contact.name}</p>
        <p className="text-sm text-muted">
          {contact.handle} &middot; {contact.subtitle}
        </p>
      </Card.Content>
      <Card.Footer className="w-full">
        {/* Outline (basic) at idle; success state overrides to the green fill. */}
        <FancyButton
          fullWidth
          className={addState === "added" ? addedClasses : undefined}
          isPending={addState === "adding"}
          variant="basic"
          onPress={addContact}
        >
          {addState === "adding" ? (
            <>
              <Spinner color="current" size="sm" />
              Adding…
            </>
          ) : addState === "added" ? (
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
        {/* Success announced for screen readers too, not just the color swap. */}
        <span aria-live="polite" className="sr-only">
          {addState === "added" ? `${contact.name} added to contacts` : ""}
        </span>
      </Card.Footer>
    </Card>
  );
}
