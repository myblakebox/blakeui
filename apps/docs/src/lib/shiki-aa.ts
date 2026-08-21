import type {ShikiTransformer} from "shiki";

/**
 * github-light ships four token colours that miss AA on OUR code surface. That
 * surface is the figure's --color-fd-card at rgb(240,239,236), NOT the page
 * background at rgb(250,249,246): the code block paints its own card, and
 * measuring against the page instead reads about 0.4 too high on every token.
 * An earlier pass here did exactly that and shipped a green that was still
 * failing, so measure a real token in place rather than the theme's colour on
 * the page.
 *
 * Against the true surface: JSX-attribute orange #E36209 at 3.31:1, comment grey
 * #6A737D at 4.19:1, keyword red #D73A49 at 4.06:1 and JSX-tag green #22863A at
 * 4.10:1, all under 4.5. The replacements are GitHub's own Primer values for the
 * same roles: #953800 measures 6.42:1, #57606A 5.56:1, #CF222E 4.66:1 and
 * #116329 6.43:1.
 *
 * The rest clears it and is left alone: blue #005CC5 at 5.47, purple #6F42C1 at
 * 5.66, navy #032F62 at 11.51, ink #24292E at 12.76. Note #CF222E passes by only
 * 0.16 — if the code card's fill ever changes, re-measure before assuming it
 * still holds. Swapping wholesale to github-light-high-contrast would darken
 * everything and change the look far more than four near-misses warrant.
 *
 * Enumerate the whole palette rather than fixing what one page shows: the orange
 * only appears where snippets carry JSX attributes, so a fix verified on a page
 * without them looks complete and is not.
 * github-dark is untouched — its tokens use different hexes and already pass.
 */
const REPLACEMENTS: Record<string, string> = {
  "#22863A": "#116329",
  "#6A737D": "#57606A",
  "#D73A49": "#CF222E",
  "#E36209": "#953800",
};

/**
 * Applied as a TRANSFORMER rather than shiki's `colorReplacements`, because
 * fumadocs builds its own codeToHast call and does not forward that option —
 * setting it, in either the flat or the theme-keyed form, silently does nothing.
 * Verified by rebuilding and grepping the output.
 *
 * This must be passed to EVERY highlighting path. There are three: the MDX
 * pipeline in source.config.ts, `highlight()` in components/codeblock.tsx, and
 * the runtime shiki instance in components/highlighted-code.tsx. Fixing only the
 * MDX one leaves most code blocks on a component page untouched, because their
 * source panels render through the other two.
 */
export const shikiAaTransformer: ShikiTransformer = {
  name: "blakeui:aa-token-colours",
  span(node) {
    const style = node.properties?.["style"];

    if (typeof style !== "string") return;

    let next = style;

    for (const [from, to] of Object.entries(REPLACEMENTS)) {
      next = next.replaceAll(from, to);
    }

    node.properties["style"] = next;
  },
};
