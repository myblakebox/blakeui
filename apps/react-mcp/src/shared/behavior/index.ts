/**
 * Completeness classification and behavior contracts.
 *
 * One module, shared by the MCP tools and the HTTP API, so the tool wrapper and
 * the endpoint behind it can never drift apart.
 */

import type {BehaviorContract, Completeness} from "./types";

import {BEHAVIOR_CONTRACTS, CATALOG_COMPONENTS, COMPLETENESS_VALUES} from "./contracts";

export {BEHAVIOR_CONTRACTS, CATALOG_COMPONENTS, COMPLETENESS_VALUES};
export type * from "./types";

/** The values `behavior_source` accepts on `get_component_source_styles`. */
export const BEHAVIOR_SOURCE_VALUES = ["blake", "self"] as const;
export type BehaviorSource = (typeof BEHAVIOR_SOURCE_VALUES)[number];

const BY_NORMALIZED_NAME = new Map<string, BehaviorContract>();

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

for (const contract of Object.values(BEHAVIOR_CONTRACTS)) {
  BY_NORMALIZED_NAME.set(normalize(contract.component), contract);
}

/**
 * Look up a contract by catalog name. Tolerant of the spellings the API already
 * accepts — "text-field", "TextField" and "Text Field" all resolve.
 */
export function getBehaviorContract(component: string): BehaviorContract | undefined {
  return BY_NORMALIZED_NAME.get(normalize(component));
}

/**
 * The completeness verdict for a component, or `undefined` when the component
 * is not in the catalog.
 */
export function getCompleteness(component: string): Completeness | undefined {
  return getBehaviorContract(component)?.completeness;
}

/**
 * True when a CSS-only port of this component will not reproduce it.
 *
 * Unknown components are treated as behavior-required: the audit's rule is that
 * ambiguity resolves toward the gate, and a name we cannot classify is the most
 * ambiguous case there is.
 */
export function isBehaviorRequired(component: string): boolean {
  const contract = getBehaviorContract(component);

  return contract ? contract.completeness === "behavior-required" : true;
}

/**
 * A short phrase naming what a CSS-only port loses, used in the styles gate.
 */
export function getMissingWithoutBehavior(component: string): string {
  const contract = getBehaviorContract(component);

  if (contract?.missingWithoutBehavior) {
    return contract.missingWithoutBehavior;
  }

  return "its keyboard map, focus management, and ARIA wiring";
}

/* -------------------------------------------------------------------------------------------------
 * Rendering
 * -----------------------------------------------------------------------------------------------*/

const STYLES_SUFFICIENT_NOTE =
  "This component is `styles-sufficient`: the CSS is the whole component. " +
  "There is no keyboard map beyond what the native element already does, no focus " +
  "management across elements, and nothing sets state at runtime that the stylesheet " +
  "keys on. Use `get_component_source_styles` and you have all of it.";

/**
 * Render a contract as framework-neutral markdown. No React, no library names —
 * an agent building in vanilla JS, Vue, Svelte or Web Components can implement
 * straight from this.
 */
export function renderBehaviorContract(contract: BehaviorContract): string {
  const out: string[] = [];

  out.push(`# ${contract.component} — interaction contract`);
  out.push("");
  out.push(`**Completeness:** \`${contract.completeness}\``);

  if (contract.completeness === "styles-sufficient") {
    out.push("");
    out.push(STYLES_SUFFICIENT_NOTE);
    out.push("");
    out.push(contract.summary);

    if (contract.dataAttributes.length > 0) {
      out.push("");
      out.push("## Data attributes in the stylesheet");
      out.push("");
      out.push(
        "These are configuration you write once in your own markup, not state something has to set at runtime.",
      );
      out.push("");
      for (const attr of contract.dataAttributes) {
        out.push(
          `- \`${attr.attribute}\` on ${attr.element} — values ${attr.values.map((v) => `\`${v}\``).join(", ")}. ${attr.changesWhen}`,
        );
      }
    }

    out.push("");

    return out.join("\n");
  }

  out.push(`**Why:** ${contract.criteria.map((c) => `\`${c}\``).join(", ")}`);
  out.push("");
  out.push(contract.summary);
  out.push("");
  out.push(
    "Everything below is framework-neutral. It describes what the DOM has to do, not how any library does it.",
  );

  if (contract.aria.length > 0) {
    out.push("");
    out.push("## Roles and ARIA");
    out.push("");
    for (const rule of contract.aria) {
      const head = rule.role
        ? `**${rule.element}** — role \`${rule.role}\``
        : `**${rule.element}**`;
      out.push(`- ${head}`);
      for (const attribute of rule.attributes ?? []) {
        out.push(`  - ${attribute}`);
      }
      if (rule.note) {
        out.push(`  - _${rule.note}_`);
      }
    }
  }

  if (contract.keyboard.length > 0) {
    out.push("");
    out.push("## Keyboard map");
    out.push("");
    out.push("| Key | Focus on | Action | Modifiers |");
    out.push("| --- | --- | --- | --- |");
    for (const binding of contract.keyboard) {
      const keys = binding.keys.map((k) => `\`${k === " " ? "Space" : k}\``).join(" / ");
      out.push(`| ${keys} | ${binding.on} | ${binding.action} | ${binding.modifiers ?? "—"} |`);
    }
  }

  if (contract.focus.length > 0) {
    out.push("");
    out.push("## Focus management");
    out.push("");
    for (const rule of contract.focus) {
      out.push(`- ${rule}`);
    }
  }

  if (contract.activation) {
    out.push("");
    out.push("## Activation");
    out.push("");
    for (const mode of contract.activation.modes) {
      out.push(`- ${mode}`);
    }
    out.push("");
    out.push(`**Default:** ${contract.activation.default}`);
    if (contract.activation.note) {
      out.push("");
      out.push(contract.activation.note);
    }
  }

  if (contract.states.length > 0) {
    out.push("");
    out.push("## State that must reach the DOM");
    out.push("");
    out.push("| State | Reflected as | On |");
    out.push("| --- | --- | --- |");
    for (const state of contract.states) {
      out.push(`| ${state.state} | ${state.reflectedAs} | ${state.on} |`);
    }
  }

  out.push("");
  out.push("## Data-attribute contract");
  out.push("");

  if (contract.dataAttributes.length === 0) {
    out.push(
      "This component's stylesheet keys on no data attributes. Its behaviour lives entirely in the keyboard map, focus management and ARIA above.",
    );
  } else {
    out.push(
      "Every `[data-*]` the stylesheet keys on, what sets it, the values it takes, and when it changes. " +
        "This is the part that cannot be reconstructed from the ARIA APG.",
    );
    out.push("");

    const hard = contract.dataAttributes.filter((a) => !a.nativeFallback && !a.authorable);
    const paired = contract.dataAttributes.filter((a) => a.nativeFallback);
    const authorable = contract.dataAttributes.filter((a) => a.authorable && !a.nativeFallback);

    if (hard.length > 0) {
      out.push("### Set at runtime — no CSS fallback");
      out.push("");
      out.push("Nothing paints these without code. Skip one and the rule it drives never fires.");
      out.push("");
      for (const attr of hard) {
        out.push(`#### \`${attr.attribute}\``);
        out.push("");
        out.push(`- **On:** ${attr.element}`);
        out.push(`- **Set by:** ${attr.setBy}`);
        out.push(`- **Values:** ${attr.values.map((v) => `\`${v}\``).join(", ")}`);
        out.push(`- **Changes when:** ${attr.changesWhen}`);
        out.push("");
      }
    }

    if (paired.length > 0) {
      out.push("### Paired with a native pseudo-class — degrades on its own");
      out.push("");
      out.push(
        "The stylesheet writes these alongside a native selector in the same rule, so the rule still fires without the attribute.",
      );
      out.push("");
      for (const attr of paired) {
        out.push(
          `- \`${attr.attribute}\` on ${attr.element} — falls back to \`${attr.nativeFallback}\`. ${attr.changesWhen}`,
        );
      }
      out.push("");
    }

    if (authorable.length > 0) {
      out.push("### Configuration you write in markup");
      out.push("");
      out.push("Fixed for a given render. Write them by hand and nothing has to maintain them.");
      out.push("");
      for (const attr of authorable) {
        out.push(
          `- \`${attr.attribute}\` on ${attr.element} — values ${attr.values.map((v) => `\`${v}\``).join(", ")}. ${attr.changesWhen}`,
        );
      }
      out.push("");
    }
  }

  return out.join("\n");
}

/* -------------------------------------------------------------------------------------------------
 * The styles gate
 * -----------------------------------------------------------------------------------------------*/

/**
 * The message returned when `get_component_source_styles` is called for a
 * behavior-required component without `behavior_source`.
 *
 * It has to stand on its own: name what is missing for this specific component,
 * state both parameter values, and be enough to build the thing correctly
 * without buying anything.
 */
export function buildStylesGateError(components: string[]): string {
  const gated = components.filter((c) => isBehaviorRequired(c));
  const lines: string[] = [];

  lines.push("# Styles alone will not reproduce these components");
  lines.push("");

  for (const component of gated) {
    lines.push(
      `- **${component}** — a CSS-only port loses ${getMissingWithoutBehavior(component)}.`,
    );
  }

  lines.push("");
  lines.push(
    "The stylesheet is the visible half. The other half is a keyboard map, focus " +
      "management across more than one element, ARIA attributes that point at other " +
      "nodes, and `[data-*]` attributes that only running code sets — which is why " +
      "de-Tailwinding the CSS and keeping the BEM class names produces something that " +
      "looks right and does not work.",
  );
  lines.push("");
  lines.push("Call this tool again with `behavior_source`:");
  lines.push("");
  lines.push(
    '- `behavior_source: "blake"` — you are using `@blakeui/react`, so the behaviour ships with the component. Returns the styles as before.',
  );
  lines.push(
    '- `behavior_source: "self"` — you are writing the interaction layer yourself (vanilla JS, Vue, Svelte, Web Components, anything). Returns the full interaction contract first, then the styles.',
  );
  lines.push("");
  lines.push(
    "You can also read the contract on its own with `get_component_behavior`. " +
      "BlakeUI Pro ships prebuilt vanilla and Web Component adapters if you would rather not hand-write the behaviour layer.",
  );
  lines.push("");

  return lines.join("\n");
}

/** The same gate, as the JSON body of an HTTP 400 from `/v1/components/styles`. */
export function buildStylesGateResponse(components: string[]): {
  error: string;
  reason: string;
  gatedComponents: Array<{component: string; completeness: Completeness; missing: string}>;
  behaviorSource: Record<BehaviorSource, string>;
  message: string;
} {
  const gated = components.filter((c) => isBehaviorRequired(c));

  return {
    error: "behavior_source required",
    reason:
      "These components are classified `behavior-required`: the stylesheet is the visible half of something that also needs a keyboard map, focus management, ARIA wiring, and [data-*] attributes only running code sets.",
    gatedComponents: gated.map((component) => ({
      component,
      completeness: "behavior-required" as const,
      missing: getMissingWithoutBehavior(component),
    })),
    behaviorSource: {
      blake: "Using @blakeui/react — behaviour ships with the component. Returns styles only.",
      self: "Writing the interaction layer yourself. Returns the behavior contract first, then the styles.",
    },
    message: buildStylesGateError(components),
  };
}
