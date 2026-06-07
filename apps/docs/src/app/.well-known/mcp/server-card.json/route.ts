import {
  MCP_PACKAGE_VERSION,
  NATIVE_MCP_API_URL,
  REACT_MCP_API_URL,
  absoluteUrl,
  getRequestOrigin,
  jsonResponse,
} from "@/lib/agent-discovery";

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);

  return jsonResponse({
    $schema: "https://modelcontextprotocol.io/schemas/server-card/draft.json",
    capabilities: {
      prompts: false,
      resources: false,
      tools: true,
    },
    description:
      "blakeUI MCP servers expose read-only blakeUI React and blakeUI Native documentation, component metadata, source references, styles, and theme variables to AI coding agents.",
    endpoint: absoluteUrl(origin, "/.well-known/mcp/server-card.json"),
    links: {
      docs: [
        absoluteUrl(origin, "/docs/react/getting-started/mcp-server"),
        absoluteUrl(origin, "/docs/native/getting-started/mcp-server"),
      ],
      npm: [
        "https://www.npmjs.com/package/@blakeui/react-mcp",
        "https://www.npmjs.com/package/@blakeui/native-mcp",
      ],
      source: "https://github.com/myblakebox/BlakeUI",
    },
    notes:
      "The supported MCP transport today is stdio through the published npm packages. The endpoint field identifies this server card for browser and catalog discovery; it is not a Streamable HTTP MCP endpoint.",
    serverInfo: {
      name: "blakeUI MCP",
      version: MCP_PACKAGE_VERSION,
    },
    tools: [
      {
        description: "List all available blakeUI React components.",
        name: "list_components",
        package: "@blakeui/react-mcp",
      },
      {
        description: "Get complete React component documentation.",
        name: "get_component_docs",
        package: "@blakeui/react-mcp",
      },
      {
        description: "Get React component TypeScript source code.",
        name: "get_component_source_code",
        package: "@blakeui/react-mcp",
      },
      {
        description: "Get React component CSS source styles.",
        name: "get_component_source_styles",
        package: "@blakeui/react-mcp",
      },
      {
        description: "Get blakeUI React theme variables.",
        name: "get_theme_variables",
        package: "@blakeui/react-mcp",
      },
      {
        description: "Browse full blakeUI React documentation.",
        name: "get_docs",
        package: "@blakeui/react-mcp",
      },
      {
        description: "List all available blakeUI Native components.",
        name: "list_components",
        package: "@blakeui/native-mcp",
      },
      {
        description: "Get complete Native component documentation.",
        name: "get_component_docs",
        package: "@blakeui/native-mcp",
      },
      {
        description: "Get blakeUI Native theme variables.",
        name: "get_theme_variables",
        package: "@blakeui/native-mcp",
      },
      {
        description: "Browse full blakeUI Native documentation.",
        name: "get_docs",
        package: "@blakeui/native-mcp",
      },
    ],
    transports: [
      {
        args: ["-y", "@blakeui/react-mcp@latest"],
        command: "npx",
        dataApi: REACT_MCP_API_URL,
        package: "@blakeui/react-mcp",
        type: "stdio",
      },
      {
        args: ["-y", "@blakeui/native-mcp@latest"],
        command: "npx",
        dataApi: NATIVE_MCP_API_URL,
        package: "@blakeui/native-mcp",
        type: "stdio",
      },
    ],
  });
}
