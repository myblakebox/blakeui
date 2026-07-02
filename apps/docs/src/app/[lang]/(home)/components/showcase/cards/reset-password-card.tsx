"use client";

import {Card, FancyButton, InputGroup, Label, Link, TextField} from "@blakeui/react";

import {Iconify} from "@/components/iconify";

import {resetPassword} from "../data/placeholder";

export function ResetPasswordCard() {
  return (
    <Card className="w-full items-center text-center">
      <Card.Header className="w-full items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft">
          <Iconify className="text-2xl text-accent-soft-foreground" icon="lock" />
        </div>
        <Card.Title className="font-semibold">Reset Password</Card.Title>
        <span className="text-sm text-muted">
          Enter your email and we&apos;ll send you a reset link.
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
        <FancyButton fullWidth variant="primary">
          Reset Password
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
