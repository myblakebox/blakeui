"use client";

import {useEffect} from "react";
import {annotate, annotationGroup} from "rough-notation";

const INITIAL_DELAY_MS = 350;
const UNDERLINE_DURATION_MS = 600;
const HIGHLIGHT_DURATION_MS = 500;

/**
 * Draws the two rough-notation annotations over the hero headline spans.
 * No `color` option is passed on purpose: rough-notation then renders its
 * paths with stroke="currentColor", and the injected svg is a sibling of the
 * annotated span, so the strokes resolve live from the `--hero-*` custom
 * properties set on `.home-hero` in global.css (theme presets and dark mode
 * keep working after the draw, with no JS involved).
 */
export function HeroAnnotations() {
  useEffect(() => {
    const underlineEl = document.querySelector<HTMLElement>('[data-annotate="underline"]');
    const highlightEl = document.querySelector<HTMLElement>('[data-annotate="highlight"]');

    if (!underlineEl || !highlightEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const underline = annotate(underlineEl, {
      animate: !reducedMotion,
      animationDuration: UNDERLINE_DURATION_MS,
      multiline: false,
      padding: [0, 2, 4, 2],
      strokeWidth: 3,
      type: "underline",
    });

    const highlight = annotate(highlightEl, {
      animate: !reducedMotion,
      animationDuration: HIGHLIGHT_DURATION_MS,
      multiline: false,
      type: "highlight",
    });

    // rough-notation attaches its svgs synchronously as siblings of the
    // annotated spans (after the underline span, before the highlight span);
    // hide the purely decorative graphics from the accessibility tree so
    // they don't appear as unnamed images inside the h1.
    for (const svg of [underlineEl.nextElementSibling, highlightEl.previousElementSibling]) {
      if (svg instanceof SVGSVGElement && svg.classList.contains("rough-annotation")) {
        svg.setAttribute("aria-hidden", "true");
      }
    }

    // annotationGroup sequences via animation delays: the highlight draw
    // starts exactly when the underline draw finishes.
    const group = annotationGroup([underline, highlight]);
    let timer: number | undefined;

    if (reducedMotion) {
      group.show();
    } else {
      timer = window.setTimeout(() => group.show(), INITIAL_DELAY_MS);
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      underline.remove();
      highlight.remove();
    };
  }, []);

  return null;
}
