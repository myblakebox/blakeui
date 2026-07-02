"use client";

import {Avatar, Button, Card, Skeleton} from "@blakeui/react";
import {AnimatePresence, m, useReducedMotion} from "motion/react";
import {useEffect, useRef, useState} from "react";

const LOAD_MS = 1200;
/** Hover replay cooldown so re-entering the tile doesn't loop the sequence. */
const REPLAY_COOLDOWN_MS = 2500;

/**
 * T6 — Skeleton reveal. Mounts in the loading state and crossfades to the real
 * content after ~1.2s; hovering the tile replays the sequence once (mouseenter
 * + cooldown, so mouse travel inside the tile never retriggers it). Under
 * prefers-reduced-motion the content renders immediately and replay is a no-op.
 */
export function ProfileSkeletonTile() {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const lastReplay = useRef(0);

  useEffect(() => {
    // 0ms under reduced motion — content is up before the next paint, no fake load.
    timer.current = window.setTimeout(() => setReady(true), reducedMotion ? 0 : LOAD_MS);

    return () => window.clearTimeout(timer.current);
  }, [reducedMotion]);

  const replay = () => {
    if (reducedMotion || !ready) return;
    const now = Date.now();

    if (now - lastReplay.current < REPLAY_COOLDOWN_MS) return;
    lastReplay.current = now;
    setReady(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setReady(true), LOAD_MS);
  };

  const fade = {
    animate: {opacity: 1},
    exit: {opacity: 0},
    initial: {opacity: 0},
    transition: {duration: reducedMotion ? 0 : 0.3},
  };

  return (
    <Card className="w-full border border-border/50" onMouseEnter={replay}>
      <Card.Header className="w-full">
        <Card.Title>Suggested for you</Card.Title>
      </Card.Header>
      <Card.Content className="w-full pt-0">
        <AnimatePresence initial={false} mode="popLayout">
          {ready ? (
            <m.div key="content" className="flex w-full flex-col gap-3" {...fade}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <Avatar.Fallback>AO</Avatar.Fallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">Amara Okafor</span>
                  <span className="text-xs text-muted">Design Engineer · BlakeUI</span>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button className="flex-1" size="sm" variant="primary">
                  Follow
                </Button>
                <Button className="flex-1" size="sm" variant="outline">
                  Message
                </Button>
              </div>
            </m.div>
          ) : (
            <m.div key="skeleton" aria-hidden className="flex w-full flex-col gap-3" {...fade}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-3/5 rounded-lg" />
                  <Skeleton className="h-3 w-4/5 rounded-lg" />
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </Card.Content>
    </Card>
  );
}
