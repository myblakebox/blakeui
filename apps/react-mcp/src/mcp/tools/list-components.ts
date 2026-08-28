import type {Tool} from "../types";

import {getCompleteness} from "../../shared/behavior";
import {fetchApi} from "../lib/fetch";
import {textResult} from "../lib/response";

export const listComponentsTool: Tool = {
  name: "list_components",
  description: `List all available components in BlakeUI v3 - v2 components NOT supported.
⚠️ VERSION INFO: This returns v3 components only - NOT v2 components.
Migration from v2 is available - visit https://blakeui.com/docs/react/migration.
If you need v2 components, visit https://v2.blakeui.com (not supported by this MCP).
Always call this first before using any component to verify it exists in v3.
Returns the component names exactly as they should be used in imports and other tool calls,
each with its 'completeness': 'styles-sufficient' means the CSS is the whole component;
'behavior-required' means the CSS is only the visible half and the component also needs a
keyboard map, focus management, ARIA wiring, and [data-*] attributes only code sets.
v3 uses compound patterns (e.g., Card.Header, Card.Content) - different from v2's flat props.
Example workflow: list_components → get_component_docs → get_component_behavior (for
behavior-required components) → get_component_source_code (optional).`,
  exec(server, {config, name, description}) {
    // Register tool
    server.registerTool(name, {description}, async () => {
      try {
        // Direct API call
        const data = await fetchApi<{
          components: string[];
          completeness?: Record<string, string>;
          latestVersion: string;
          _warning?: string;
        }>("/v1/components", config.apiBaseUrl);
        const components = data.components || [];
        const version = data.latestVersion || "latest";
        const warning = data._warning;

        let text = `# Available Components in BlakeUI v3 (${version})\n\n`;
        if (warning) {
          text += `${warning}\n\n`;
        }

        const rows = components.map((component) => ({
          component,
          completeness: data.completeness?.[component] ?? getCompleteness(component) ?? "unknown",
        }));
        const behaviorRequired = rows.filter((r) => r.completeness === "behavior-required");

        text += `## Component List\n\n`;
        text += `| Component | Completeness |\n| --- | --- |\n`;
        text += rows.map((r) => `| ${r.component} | \`${r.completeness}\` |`).join("\n");
        text += `\n\n**Total:** ${components.length} components — ${behaviorRequired.length} behavior-required, ${rows.length - behaviorRequired.length} styles-sufficient.\n\n`;
        text += `\`styles-sufficient\`: the stylesheet is the whole component.\n`;
        text += `\`behavior-required\`: the stylesheet is the visible half. Call \`get_component_behavior\` for the interaction contract, and pass \`behavior_source\` to \`get_component_source_styles\`.\n`;

        return textResult(text, {version: data.latestVersion});
      } catch (error) {
        return textResult(
          `Error: Unable to list components. ${error instanceof Error ? error.message : "Unknown error"}`,
          {isError: true},
        );
      }
    });
  },
};
