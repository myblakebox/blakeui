/* eslint-disable @typescript-eslint/no-explicit-any */
import type {ComponentContext, Tool} from "../types";

import {z} from "zod";

import {getBehaviorContract, renderBehaviorContract} from "../../shared/behavior";
import {textResult} from "../lib/response";

export const getComponentBehaviorTool: Tool<ComponentContext> = {
  name: "get_component_behavior",
  description: `Get the framework-neutral interaction contract for a BlakeUI component.
Returns what the DOM has to do — no React, no library names — so you can build the
component in vanilla JS, Vue, Svelte, Web Components, or anything else:
- required roles and ARIA attributes, and which element carries each
- the complete keyboard map: every key, its action, and modifier behaviour
- focus management rules, including roving tabindex where it applies
- activation mode (automatic vs manual) and the default
- every state that must be reflected into the DOM, and how
- the data-attribute contract: every [data-*] the stylesheet keys on, what sets it,
  what values it takes, and when it changes
The data-attribute section is the part you cannot reconstruct from the ARIA APG.
Call this whenever you are porting a component's CSS without using @blakeui/react.
For a component classified 'styles-sufficient' this returns a short answer saying
the CSS is the whole component.`,

  async ctx(shared) {
    return {
      componentList: shared?.componentList || [],
    };
  },

  exec(server, {name, description, ctx}) {
    const componentSchema =
      ctx.componentList.length >= 2
        ? z.enum(ctx.componentList as [string, ...string[]])
        : z.string();

    const inputSchema = z.object({
      component: componentSchema.describe(
        `A single component name from list_components (case-sensitive).`,
      ),
    });

    const handler = async ({component}: z.infer<typeof inputSchema>) => {
      const contract = getBehaviorContract(component);

      if (!contract) {
        return textResult(
          `# ${component}\n\nNo interaction contract is recorded for \`${component}\`. ` +
            `Call \`list_components\` to see the catalog — names are case-sensitive.\n`,
          {isError: true},
        );
      }

      return textResult(renderBehaviorContract(contract));
    };

    server.registerTool(name, {description, inputSchema: inputSchema.shape}, handler as any);
  },
};
