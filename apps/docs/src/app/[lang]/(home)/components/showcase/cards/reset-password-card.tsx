"use client";

import type {ReactNode} from "react";

import {
  Card,
  FancyButton,
  InputGroup,
  InputOTP,
  Label,
  Link,
  REGEXP_ONLY_DIGITS,
  Spinner,
  TextField,
} from "@blakeui/react";
import {m, useReducedMotion} from "motion/react";
import {useEffect, useRef, useState} from "react";

import {Iconify} from "@/components/iconify";

import {resetPassword} from "../data/placeholder";
import {RING_GUTTER_PX} from "../ring-gutter";
import {prefersReducedMotion, useAutoRevert} from "../use-replay";

type Stage = "reset" | "success" | "verify";

const OTP_LENGTH = 4;
const VERIFY_DURATION_MS = 1000;
/** Matches the sc-stage-in/out animation duration in showcase.css. */
const STAGE_FADE_MS = 200;

/**
 * Three-stage story: Reset (email) → Verify (4-digit OTP) → Success. No
 * auto-revert — the loop is user-driven; "Sign in" restarts it with the
 * email and code cleared.
 *
 * Transitions: a ~200ms crossfade between stages riding inside the C5
 * measured-height tween (m.div animating the entering stage's
 * ResizeObserver-fed height, overflow hidden) — no layout prop, no domMax.
 * The fade is hand-rolled: AnimatePresence enter/exit never starts under
 * this Next/React 19.2 setup (verified — the tweens stay at their initial
 * values while sibling m.div animations run), so the outgoing stage is kept
 * for one beat as an inert copy fading out via scoped CSS animation while
 * the keyed-in new stage fades in over it in the same grid cell.
 */
export function ResetPasswordCard() {
  const [stage, setStage] = useState<Stage>("reset");
  const [prevStage, setPrevStage] = useState<Stage | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResent, setIsResent] = useState(false);
  const [resendNote, setResendNote] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // The outgoing stage's copy leaves the tree once its fade-out finishes.
  useEffect(() => {
    if (prevStage === null) return;

    const timeout = setTimeout(() => setPrevStage(null), STAGE_FADE_MS);

    return () => clearTimeout(timeout);
  }, [prevStage]);

  // The "Code sent" confirmation quietly reverts to the Resend link; the
  // live note clears with it so a repeat resend re-announces.
  useAutoRevert(isResent, () => {
    setIsResent(false);
    setResendNote("");
  });

  // Feeds the height tween: the ENTERING stage's measured height (the
  // exiting copy may momentarily be taller; overflow-hidden clips it).
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const observerRef = useRef<ResizeObserver | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const measureStage = (node: HTMLDivElement | null) => {
    // Null fires when a keyed-out stage unmounts — the observer already
    // tracks the entering node by then, so there is nothing to undo.
    if (!node) return;

    observerRef.current?.disconnect();
    observerRef.current = new ResizeObserver(() => setContentHeight(node.offsetHeight));
    observerRef.current.observe(node);
  };

  // Stage changes move focus to the new stage's heading: it announces the
  // step to screen readers and leaves the first interactive element one Tab
  // away, without popping keyboards the way focusing a field would.
  const shouldFocusHeading = useRef(false);

  const focusHeading = (node: HTMLHeadingElement | null) => {
    if (!node || !shouldFocusHeading.current) return;

    shouldFocusHeading.current = false;
    node.focus();
  };

  const goTo = (next: Stage) => {
    // Reduced motion: no crossfade copy — the swap is instant.
    if (!prefersReducedMotion()) setPrevStage(stage);
    shouldFocusHeading.current = true;
    setStage(next);
  };

  const submitCode = () => {
    if (code.length < OTP_LENGTH || isVerifying) return;

    // Reduced motion: no spinner theater — instant swap to success, matching
    // the showcase's other reduced-motion stories.
    if (prefersReducedMotion()) {
      goTo("success");

      return;
    }

    setIsVerifying(true);
    timeoutRef.current = setTimeout(() => {
      setIsVerifying(false);
      goTo("success");
    }, VERIFY_DURATION_MS);
  };

  const resend = () => {
    setIsResent(true);
    setResendNote(`A new code was sent to ${resetPassword.email}`);
  };

  const restart = () => {
    setEmail("");
    setCode("");
    setIsResent(false);
    setResendNote("");
    goTo("reset");
  };

  /**
   * The outgoing copy renders without the heading focus ref (only the live
   * stage may take focus) — everything else can share, since the copy is
   * aria-hidden and pointer-inert for its 200ms on screen.
   */
  const renderStage = (which: Stage, isLive: boolean): ReactNode => {
    switch (which) {
      case "reset":
        return (
          <>
            <Card.Header className="w-full items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft">
                <Iconify className="text-2xl text-accent-soft-foreground" icon="lock" />
              </div>
              <Card.Title
                ref={isLive ? focusHeading : undefined}
                className="font-semibold outline-none"
                tabIndex={-1}
              >
                Reset Password
              </Card.Title>
              <span className="text-sm text-muted">
                Enter your email and we&apos;ll send you a reset link.
              </span>
            </Card.Header>
            <Card.Content className="w-full gap-3">
              {/* Optional on purpose — the demo advances either way. */}
              <TextField className="w-full" name="email" value={email} onChange={setEmail}>
                <Label className="self-start text-xs font-medium">Email Address</Label>
                <InputGroup className="w-full">
                  <InputGroup.Prefix>
                    <Iconify className="text-base text-muted" icon="envelope" />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder={resetPassword.email} type="email" />
                </InputGroup>
              </TextField>
              <FancyButton fullWidth variant="primary" onPress={() => goTo("verify")}>
                Reset Password
              </FancyButton>
            </Card.Content>
            <Card.Footer className="w-full flex-col items-center gap-0.5 text-sm">
              <span className="text-muted">Don&apos;t have access anymore?</span>
              <Link className="text-sm font-medium" href="#">
                Try another method
              </Link>
            </Card.Footer>
          </>
        );
      case "verify":
        return (
          <>
            <Card.Header className="w-full items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft">
                <Iconify className="text-2xl text-accent-soft-foreground" icon="person" />
              </div>
              <Card.Title
                ref={isLive ? focusHeading : undefined}
                className="font-semibold outline-none"
                tabIndex={-1}
              >
                Enter Verification Code
              </Card.Title>
              <span className="text-sm text-muted">
                We&apos;ve sent a code to{" "}
                <span className="font-medium text-foreground">{resetPassword.email}</span>
              </span>
            </Card.Header>
            <Card.Content className="w-full items-center gap-3">
              <InputOTP
                aria-label="4-digit verification code"
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                value={code}
                onChange={setCode}
              >
                <InputOTP.Group>
                  {Array.from({length: OTP_LENGTH}, (_, index) => (
                    <InputOTP.Slot key={index} className="size-11" index={index} />
                  ))}
                </InputOTP.Group>
              </InputOTP>
              <FancyButton
                fullWidth
                isDisabled={code.length < OTP_LENGTH}
                isPending={isVerifying}
                variant="primary"
                onPress={submitCode}
              >
                {isVerifying ? (
                  <>
                    <Spinner color="current" size="sm" />
                    Verifying…
                  </>
                ) : (
                  "Submit"
                )}
              </FancyButton>
            </Card.Content>
            <Card.Footer className="w-full flex-col items-center gap-0.5 text-sm">
              <span className="text-muted">Experiencing issues receiving the code?</span>
              {isResent ? (
                <span className="flex items-center gap-1 text-sm font-medium text-muted">
                  <Iconify className="text-base text-success" icon="check" />
                  Code sent
                </span>
              ) : (
                <Link className="text-sm font-medium" onPress={resend}>
                  Resend code
                </Link>
              )}
              {/* Resend confirmed for screen readers — quiet, no toast. */}
              <span aria-live="polite" className="sr-only">
                {isLive ? resendNote : ""}
              </span>
            </Card.Footer>
          </>
        );
      case "success":
        return (
          <>
            <Card.Header className="w-full items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-success-soft">
                <Iconify className="text-2xl text-success-soft-foreground" icon="check" />
              </div>
              <Card.Title
                ref={isLive ? focusHeading : undefined}
                className="font-semibold outline-none"
                tabIndex={-1}
              >
                Password Changed
              </Card.Title>
              <span className="text-sm text-muted">You can now log in with your new password.</span>
            </Card.Header>
            <Card.Content className="w-full gap-3">
              <FancyButton fullWidth variant="basic" onPress={restart}>
                Sign in
              </FancyButton>
            </Card.Content>
          </>
        );
    }
  };

  return (
    <Card className="w-full text-center">
      <m.div
        className="-m-1 overflow-hidden p-1"
        style={reducedMotion ? {height: "auto"} : undefined}
        transition={{duration: 0.28, ease: [0.33, 1, 0.68, 1]}}
        animate={
          reducedMotion
            ? undefined
            : {
                height: contentHeight === "auto" ? "auto" : contentHeight + RING_GUTTER_PX * 2,
              }
        }
      >
        {/* Both stages share one grid cell during the fade, so the old
            content never pushes the new content down. */}
        <div className="grid w-full items-start">
          {prevStage !== null && (
            <div
              key={`out-${prevStage}`}
              aria-hidden
              className="sc-stage-out pointer-events-none col-start-1 row-start-1 flex w-full flex-col items-center gap-3"
            >
              {renderStage(prevStage, false)}
            </div>
          )}
          <div
            key={stage}
            ref={measureStage}
            className={`col-start-1 row-start-1 flex w-full flex-col items-center gap-3 ${
              prevStage !== null ? "sc-stage-in" : ""
            }`}
          >
            {renderStage(stage, true)}
          </div>
        </div>
      </m.div>
    </Card>
  );
}
