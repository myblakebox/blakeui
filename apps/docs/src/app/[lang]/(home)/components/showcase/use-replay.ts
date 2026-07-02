"use client";

import {useEffect, useRef} from "react";

/** How long a success/terminal state stays on screen before auto-reverting. */
export const REPLAY_DELAY_MS = 2500;

/**
 * Showcase replay rule: whenever `active` turns true (a card reached its
 * success/terminal state), schedule `revert` so the story resets and can be
 * replayed. Runs under reduced motion too — transitions become instant swaps
 * there, but the revert itself still happens.
 */
export function useAutoRevert(active: boolean, revert: () => void, delayMs = REPLAY_DELAY_MS) {
  const revertRef = useRef(revert);

  useEffect(() => {
    revertRef.current = revert;
  });

  useEffect(() => {
    if (!active) return;

    const timeout = setTimeout(() => revertRef.current(), delayMs);

    return () => clearTimeout(timeout);
  }, [active, delayMs]);
}

/**
 * Matches the CSS media query at interaction time (not render time).
 * `?reduce=1` forces the reduced paths — a test hook for verifying the
 * reduced-motion stories without flipping the OS setting.
 */
export function prefersReducedMotion(): boolean {
  if (new URLSearchParams(window.location.search).has("reduce")) return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
