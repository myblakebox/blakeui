/* eslint-disable @typescript-eslint/no-explicit-any */
import type {ComponentContext, Tool} from "../types";

import {z} from "zod";

import {getCompleteness} from "../../shared/behavior";
import {fetchApi} from "../lib/fetch";
import {textResult} from "../lib/response";

export const getComponentDocsTool: Tool<ComponentContext> = {
  name: "get_component_docs",
  description: `Get complete component documentation (including examples, props, usage) directly from blakeui.com.
Accepts an array of component names and returns the full MDX documentation for each component.
Returns raw markdown content from the component's .mdx file, which includes:
- Import statements
- Usage examples
- Variants and sizes
- Props documentation
- Styling information
- API Reference
- And more

This tool replaces get_component_info, get_component_props, and get_component_examples.
Use this when you need complete component documentation in one call.
Each result also carries the component's 'completeness'. For a 'behavior-required'
component the docs describe a component whose CSS is only the visible half — use
get_component_behavior for the interaction contract.
Workflow: list_components → get_component_docs.`,

  async ctx(shared) {
    return {
      componentList: shared?.componentList || [],
    };
  },

  exec(server, {config, name, description, ctx}) {
    // Create input schema with dynamic component enum
    const inputSchema = z.object({
      components: z.array(z.enum(ctx.componentList as [string, ...string[]])).min(1)
        .describe(`Array of component names from list_components (case-sensitive).
Examples: ["Button"], ["Card", "TextField"], ["Button", "Card", "Tabs"].
DO NOT guess names - always verify with list_components first.`),
    });

    const handler = async ({components}: z.infer<typeof inputSchema>) => {
      try {
        const response = await fetchApi<{
          version?: string;
          results: Array<{
            component: string;
            completeness?: string;
            url?: string;
            content?: string;
            contentType?: string;
            error?: string;
            status?: number;
            statusText?: string;
          }>;
          _warning?: string;
        }>("/v1/components/docs", config.apiBaseUrl, {
          method: "POST",
          body: JSON.stringify({components}),
        });

        let responseText = "";
        if (response._warning) {
          responseText += `${response._warning}\n\n`;
        }

        response.results.forEach((result, index) => {
          if (index > 0) responseText += "\n\n---\n\n";

          if (result.error || !result.content) {
            responseText += `# ${result.component} Documentation\n\n`;
            responseText += `Error: ${result.error}\n`;
            if (result.status) {
              responseText += `Status: ${result.status}\n`;
            }
          } else {
            const completeness = result.completeness ?? getCompleteness(result.component);

            responseText += `# ${result.component} Documentation\n\n`;
            responseText += `**URL:** ${result.url}\n`;
            if (completeness) {
              responseText += `**Completeness:** \`${completeness}\`\n`;
            }
            if (completeness === "behavior-required") {
              responseText += `\n> A CSS-only port of this component will not reproduce it. Call \`get_component_behavior("${result.component}")\` for the keyboard map, focus rules, ARIA wiring and data-attribute contract.\n`;
            }
            responseText += `\n---\n\n`;
            responseText += result.content;
          }
        });

        return textResult(responseText, {version: response.version});
      } catch (error) {
        return textResult(
          `Error: Unable to get component documentation. ${error instanceof Error ? error.message : "Unknown error"}`,
          {isError: true},
        );
      }
    };

    // Register tool
    server.registerTool(name, {description, inputSchema: inputSchema.shape}, handler as any);
  },
};
