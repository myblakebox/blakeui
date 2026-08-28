/* eslint-disable @typescript-eslint/no-explicit-any */
import type {ComponentContext, Tool} from "../types";

import {z} from "zod";

import {
  BEHAVIOR_SOURCE_VALUES,
  buildStylesGateError,
  getBehaviorContract,
  getCompleteness,
  isBehaviorRequired,
  renderBehaviorContract,
} from "../../shared/behavior";
import {fetchApi} from "../lib/fetch";
import {textResult} from "../lib/response";

export const getComponentSourceStylesTool: Tool<ComponentContext> = {
  name: "get_component_source_styles",
  description: `Get the CSS styles and BEM classes for BlakeUI v3 components.
Accepts an array of component names and returns styles for each.
Returns the complete CSS implementation including all variants and states.
Shows BEM class structure (e.g., .button, .button--accent, .button--disabled).
IMPORTANT: These are framework-agnostic styles from @blakeui/styles package.
For components classified 'behavior-required', the stylesheet is only the visible
half: they also need a keyboard map, focus management, ARIA wiring, and [data-*]
attributes that only running code sets. Those components require the
'behavior_source' parameter:
- behavior_source: "blake" — you are using @blakeui/react and the behaviour ships
  with the component. Returns the styles as before.
- behavior_source: "self" — you are writing the interaction layer yourself.
  Returns the full interaction contract first, then the styles.
Components classified 'styles-sufficient' need no parameter — the CSS is all of it.
Use list_components or get_component_docs to see each component's completeness.
GitHub links are provided for viewing styles in context.`,

  async ctx(shared) {
    return {
      componentList: shared?.componentList || [],
    };
  },

  exec(server, {config, name, description, ctx}) {
    // Create input schema with dynamic component enum
    const inputSchema = z.object({
      components: z.array(z.enum(ctx.componentList as [string, ...string[]])).min(1)
        .describe(`Array of component names from list_components.
These are BEM classes from @blakeui/styles - not for use with React components.`),
      behavior_source: z
        .enum(BEHAVIOR_SOURCE_VALUES)
        .optional()
        .describe(
          `Required for 'behavior-required' components. "blake" when the behaviour comes from @blakeui/react; "self" when you are writing the interaction layer yourself, in which case the interaction contract is returned before the styles.`,
        ),
    });

    const handler = async ({
      behavior_source: behaviorSource,
      components,
    }: z.infer<typeof inputSchema>) => {
      // The gate. Styles alone will not reproduce a behavior-required component,
      // so refuse to hand them over until the caller has said where the behaviour
      // is coming from.
      if (!behaviorSource && components.some((component) => isBehaviorRequired(component))) {
        return textResult(buildStylesGateError(components), {isError: true});
      }

      try {
        const response = await fetchApi<{
          version: string;
          results: Array<{
            component: string;
            completeness?: string;
            filePath?: string;
            stylesCode?: string;
            githubUrl?: string;
            error?: string;
          }>;
          _warning?: string;
        }>("/v1/components/styles", config.apiBaseUrl, {
          method: "POST",
          body: JSON.stringify({components, behaviorSource: behaviorSource ?? "blake"}),
        });

        let responseText = "";
        if (response._warning) {
          responseText += `${response._warning}\n\n`;
        }

        // behavior_source: "self" means the caller is hand-writing the interaction
        // layer. The contract comes first, before the styles — reading order is the
        // whole point of the parameter.
        if (behaviorSource === "self") {
          const contracts = components
            .filter((component) => isBehaviorRequired(component))
            .map((component) => getBehaviorContract(component))
            .filter((contract): contract is NonNullable<typeof contract> => Boolean(contract));

          if (contracts.length > 0) {
            responseText += `# Interaction contracts\n\n`;
            responseText += `You are writing the interaction layer yourself. Build these first; the styles below will not work without them.\n\n`;
            responseText += contracts.map((c) => renderBehaviorContract(c)).join("\n\n---\n\n");
            responseText += `\n\n---\n\n# Styles\n\n`;
          }
        }

        response.results.forEach((result, index) => {
          if (index > 0) responseText += "\n\n---\n\n";

          const completeness = result.completeness ?? getCompleteness(result.component);

          if (result.error || !result.stylesCode) {
            responseText += `# ${result.component} Component Styles\n\n`;
            responseText += `Error: ${result.error || "Styles not available"}\n`;
          } else {
            responseText += `# ${result.component} Component Styles\n\n`;
            if (completeness) {
              responseText += `**Completeness:** \`${completeness}\`\n`;
            }
            responseText += `**File:** \`${result.filePath}\`\n`;
            responseText += `**GitHub:** [View on GitHub](${result.githubUrl})\n\n`;
            if (completeness === "behavior-required" && behaviorSource === "blake") {
              responseText += `> These styles assume \`@blakeui/react\` is driving the component. On their own they do not reproduce it — call \`get_component_behavior("${result.component}")\` if that changes.\n\n`;
            }
            responseText += `## CSS Styles\n`;
            responseText += `\`\`\`css\n${result.stylesCode}\n\`\`\`\n`;
          }
        });

        return textResult(responseText, {version: response.version});
      } catch (error: any) {
        return textResult(
          `Error: Unable to get styles for components. ${error instanceof Error ? error.message : "Unknown error"}`,
          {isError: true},
        );
      }
    };

    // Register tool
    server.registerTool(name, {description, inputSchema: inputSchema.shape}, handler as any);
  },
};
