import type {ShikiTransformer} from "shiki";

/**
 * github-light ships two token colours that miss AA on our code surface: the
 * keyword red #D73A49 measures 4.34:1 and the JSX-tag green #22863A 4.39:1,
 * against a 4.5 minimum. Every other colour in the theme already clears it, so
 * the theme is not swapped — github-light-high-contrast would darken all six and
 * change the look far more than the problem warrants.
 *
 * The replacements are GitHub's OWN newer Primer values for the same two roles,
 * not colours chosen here: #CF222E measures 5.09:1 and #1A7F37 4.82:1.
 * github-dark is untouched — its tokens use different hexes and already pass.
 */
const REPLACEMENTS: Record<string, string> = {
  "#22863A": "#1A7F37",
  "#D73A49": "#CF222E",
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
