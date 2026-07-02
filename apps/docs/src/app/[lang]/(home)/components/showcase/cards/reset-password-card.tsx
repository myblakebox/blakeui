"use client";

import {Card, FancyButton, InputGroup, Label, Link, Spinner, TextField} from "@blakeui/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {resetPassword} from "../data/placeholder";
import {prefersReducedMotion, useAutoRevert} from "../use-replay";

/**
 * FancyButton ships no success variant in 1.1.2, so the success styling comes
 * from the component's CSS custom properties pointed at the real --success
 * semantic tokens (same technique as the contact card).
 */
const doneClasses = [
  "[--fancy-button-bg:var(--success)]",
  "[--fancy-button-bg-hover:var(--success-hover)]",
  "[--fancy-button-bg-pressed:var(--success-hover)]",
  "[--fancy-button-fg:var(--success-foreground)]",
].join(" ");

type ResetState = "done" | "idle" | "sending";

const SEND_DURATION_MS = 1000;

export function ResetPasswordCard() {
  const [resetState, setResetState] = useState<ResetState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Replay rule: the success state reverts to the idle form.
  useAutoRevert(resetState === "done", () => setResetState("idle"));

  const submit = () => {
    if (resetState !== "idle") return;

    // Reduced motion: the pending spinner becomes an instant swap to success.
    if (prefersReducedMotion()) {
      setResetState("done");

      return;
    }

    setResetState("sending");
    timeoutRef.current = setTimeout(() => setResetState("done"), SEND_DURATION_MS);
  };

  const isDone = resetState === "done";

  return (
    <Card className="w-full items-center text-center">
      <Card.Header className="w-full items-center gap-2">
        <div
          className={`flex size-12 items-center justify-center rounded-full ${
            isDone ? "bg-success-soft" : "bg-accent-soft"
          }`}
        >
          <Iconify
            icon={isDone ? "check" : "lock"}
            className={`text-2xl ${
              isDone ? "text-success-soft-foreground" : "text-accent-soft-foreground"
            }`}
          />
        </div>
        <Card.Title className="font-semibold">
          {isDone ? "Password changed" : "Reset Password"}
        </Card.Title>
        <span aria-live="polite" className="text-sm text-muted">
          {isDone
            ? "Check your inbox — the reset link is on its way."
            : "Enter your email and we'll send you a reset link."}
        </span>
      </Card.Header>
      <Card.Content className="w-full gap-3">
        {/* isRequired marks the field required programmatically (native
            `required` on the input), not just with the visual asterisk. */}
        <TextField isRequired className="w-full" name="email">
          <Label className="self-start text-xs font-medium">Email Address</Label>
          <InputGroup className="w-full">
            <InputGroup.Prefix>
              <Iconify className="text-base text-muted" icon="envelope" />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder={resetPassword.email} type="email" />
          </InputGroup>
        </TextField>
        <FancyButton
          fullWidth
          className={isDone ? doneClasses : undefined}
          isPending={resetState === "sending"}
          variant="primary"
          onPress={submit}
        >
          {resetState === "sending" ? (
            <>
              <Spinner color="current" size="sm" />
              Sending…
            </>
          ) : isDone ? (
            <>
              <Iconify className="text-base" icon="check" />
              Done
            </>
          ) : (
            "Reset Password"
          )}
        </FancyButton>
      </Card.Content>
      <Card.Footer className="w-full justify-center gap-1 text-sm">
        <span className="text-muted">Don&apos;t have access anymore?</span>
        <Link className="text-sm font-medium" href="#">
          Try another method
        </Link>
      </Card.Footer>
    </Card>
  );
}
