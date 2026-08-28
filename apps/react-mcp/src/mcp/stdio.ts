/**
 * BlakeUI React MCP STDIO Server
 *
 * This is the main entry point for the npm package @blakeui/react-mcp
 * It runs locally and communicates with the BlakeUI API server
 */

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";

import {API_BASE_URL} from "./constants";
import {packageInfo} from "./lib/package-info";
import {initializeResources} from "./resources";
import {initializeTools} from "./tools";

/**
 * Create and configure the MCP server
 */
async function createServer(): Promise<McpServer> {
  const server = new McpServer(
    {
      name: packageInfo.name,
      version: packageInfo.version,
    },
    {
      instructions: `## BlakeUI React MCP — v3 only

Docs for **BlakeUI v3** React components. v2 is not supported (see https://blakeui.com/docs/react/migration).

### Styles are not the whole component

Every component carries a \`completeness\` value, returned by every tool that returns component metadata:

- \`styles-sufficient\` — the stylesheet reproduces the component. Take the CSS and you have it.
- \`behavior-required\` — the stylesheet is the visible half. The component also needs a keyboard map beyond Enter/Space, focus managed across more than one element, ARIA attributes pointing at other nodes, and \`[data-*]\` attributes only running code sets. De-Tailwinding the CSS and keeping the BEM class names gives you something that looks right and does not work.

\`get_component_source_styles\` requires \`behavior_source\` for behavior-required components:

- \`"blake"\` — you are using \`@blakeui/react\`; the behaviour ships with the component. Returns the styles.
- \`"self"\` — you are writing the interaction layer yourself, in any framework. Returns the interaction contract first, then the styles.

\`get_component_behavior\` returns that contract on its own: roles and ARIA, the full keyboard map, focus rules including roving tabindex, activation mode, DOM state, and the data-attribute contract.

### Workflow

\`get_docs({path: "/docs/react/getting-started/quick-start"})\` → \`list_components\` → \`get_component_docs\` → \`get_component_behavior\` (behavior-required only) → \`get_component_source_code\` / \`get_component_source_styles\`.

v3 uses compound components (\`Card.Header\`), requires Tailwind CSS v4, needs no provider, and is built on React Aria Components.`,
      capabilities: {
        tools: {
          listChanged: true,
        },
      },
    },
  );

  // Initialize tools from the tools directory
  await initializeTools(server, {
    apiBaseUrl: API_BASE_URL,
  });

  // Initialize resources (development guidelines, etc.)
  await initializeResources(server, {
    apiBaseUrl: API_BASE_URL,
  });

  return server;
}

/**
 * Main function
 */
async function main() {
  try {
    // Create server
    const server = await createServer();

    // Create STDIO transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log to stderr to avoid interfering with STDIO
    // eslint-disable-next-line no-console
    console.error("BlakeUI MCP Server running on STDIO");
    // eslint-disable-next-line no-console
    console.error(`API URL: ${API_BASE_URL}`);
    // eslint-disable-next-line no-console
    console.error(`Version: ${packageInfo.version}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
