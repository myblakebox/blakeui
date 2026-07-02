"use client";

import type {AvatarRootProps} from "@blakeui/react";

import {Avatar} from "@blakeui/react";

/**
 * Vivid gradient discs — content color for the showcase's fictional people,
 * not theme tokens, so they stay saturated in both light and dark mode
 * (hardcoded gradients are permitted here only, per the showcase color rules).
 * Distinct hue per person; unknown names (e.g. freshly invited members) hash
 * onto the same palette so every row still gets a stable, unique disc.
 */
const GRADIENTS = [
  "linear-gradient(135deg, #f97316, #ec4899)", // orange → pink
  "linear-gradient(135deg, #8b5cf6, #3b82f6)", // violet → blue
  "linear-gradient(135deg, #06b6d4, #10b981)", // cyan → emerald
  "linear-gradient(135deg, #f43f5e, #f59e0b)", // rose → amber
  "linear-gradient(135deg, #22c55e, #84cc16)", // green → lime
  "linear-gradient(135deg, #6366f1, #d946ef)", // indigo → fuchsia
];

/**
 * DiceBear Open Peeps (CC0) illustrated headshots, downloaded once as static
 * assets — no runtime API calls. Seeds: blake-c, JordanAvery, RileyChen,
 * SamOkafor, AveryBrooks (picked for friendly expressions).
 */
const PERSONAS: Record<string, {gradient: number; peep: string}> = {
  "Avery Brooks": {gradient: 2, peep: "/images/avatar-peep-avery.svg"},
  "Blake Carter": {gradient: 1, peep: "/images/avatar-peep-blake.svg"},
  "Jordan Avery": {gradient: 0, peep: "/images/avatar-peep-jordan.svg"},
  "Riley Chen": {gradient: 3, peep: "/images/avatar-peep-riley.svg"},
  "Sam Okafor": {gradient: 4, peep: "/images/avatar-peep-sam.svg"},
};

/**
 * Pool of extra Open Peeps for people invited at runtime (static downloads,
 * seeds: Maya, Kai, Ezra, Idris, Sana, Tomas, Nia, Skye). Hash-picked per
 * name so different invitees get different peeps while re-renders stay
 * stable for the same person.
 */
const PEEP_POOL = Array.from({length: 8}, (_, i) => `/images/avatar-peep-pool-${i + 1}.svg`);

function nameHash(name: string): number {
  let hash = 0;

  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;

  return hash;
}

function gradientFor(name: string): string {
  const persona = PERSONAS[name];

  if (persona) return GRADIENTS[persona.gradient] as string;

  return GRADIENTS[nameHash(name) % GRADIENTS.length] as string;
}

/**
 * Fallback bust for people without a downloaded peep (e.g. members invited at
 * runtime in the invite card). Decorative — the accessible name lives on the
 * wrapper.
 */
function Bust() {
  return (
    <svg aria-hidden="true" className="size-full" fill="none" viewBox="0 0 40 40">
      {/* head */}
      <circle cx="20" cy="15.5" fill="rgba(255,255,255,0.92)" r="6.5" />
      {/* hair cap */}
      <path
        d="M13.5 14.5c0-4.2 2.9-6.9 6.5-6.9s6.5 2.7 6.5 6.9c-1.6-2.4-3.9-3.4-6.5-3.4s-4.9 1-6.5 3.4Z"
        fill="rgba(15,23,42,0.35)"
      />
      {/* shoulders */}
      <path
        d="M20 24c6.8 0 11.6 3.6 12.9 9.3.3 1.5-.8 2.7-2.3 2.7H9.4c-1.5 0-2.6-1.2-2.3-2.7C8.4 27.6 13.2 24 20 24Z"
        fill="rgba(255,255,255,0.92)"
      />
      {/* collar */}
      <path
        d="M20 24c1.6 0 3 .3 4.3.8L20 30l-4.3-5.2c1.3-.5 2.7-.8 4.3-.8Z"
        fill="rgba(15,23,42,0.28)"
      />
    </svg>
  );
}

interface GradientAvatarProps {
  /** Person's display name — drives the peep asset, gradient hue and aria-label. */
  name: string;
  size?: AvatarRootProps["size"];
  className?: string;
}

/**
 * Shared avatar treatment for every person in the showcase: an Open Peeps
 * illustrated headshot on a vivid gradient circle, one distinct hue per
 * person. Thin wrapper around Avatar so sizing/shape stay on the real
 * component.
 */
export function GradientAvatar({className, name, size}: GradientAvatarProps) {
  // Named personas keep their fixed peep; everyone else (e.g. runtime
  // invitees) draws from the pool by name hash.
  const peep = PERSONAS[name]?.peep ?? PEEP_POOL[nameHash(name) % PEEP_POOL.length];

  return (
    <Avatar
      aria-label={name}
      className={className}
      role="img"
      size={size}
      // Gradient sits on the root so it stays visible BEHIND the transparent
      // peep illustration (the fallback would be unmounted once the image loads).
      style={{backgroundImage: gradientFor(name)}}
    >
      {peep ? <Avatar.Image alt="" src={peep} /> : null}
      <Avatar.Fallback className="overflow-hidden bg-transparent text-transparent">
        <Bust />
      </Avatar.Fallback>
    </Avatar>
  );
}
