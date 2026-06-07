<p align="center">
  <a href="https://blakeui.com">
      <img 
        alt="BlakeUI logo" 
        width="100%" 
        src="https://github.com/myblakebox/BlakeUI/blob/main/apps/docs/src/assets/themes/blakeUI-Hero.jpg"
      />
  </a>
</p>
<p align="center">
  <a href="https://github.com/myblakebox/BlakeUI/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@blakeui/react?style=flat" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/@blakeui/react">
    <img src="https://img.shields.io/npm/dm/@blakeui/react.svg?style=flat-round" alt="npm downloads">
  </a>
</p>

## Why BlakeUI?

BlakeUI is a production-ready React component library that combines the accessibility rigor of [React Aria](https://react-spectrum.adobe.com/react-aria/) with the utility-first styling of [Tailwind CSS v4](https://tailwindcss.com/). It ships a clean compound component API (`Card.Header`, `Card.Content`, `Select.Item`, …), requires no `<Provider>` wrapper, and works out of the box with React 19 and Next.js.

- **Accessible by default** — Built on React Aria for WCAG-compliant keyboard, focus, and screen-reader behavior
- **Tailwind CSS v4** — Modern engine, no CSS-in-JS runtime, smaller output, faster builds
- **Compound components** — Composable API (`Card.Header`, `Card.Content`) instead of deeply nested props
- **Zero boilerplate** — No Provider wrapper needed (unlike Chakra, MUI)
- **AI-native** — MCP server, `llms.txt`, and agent skills so AI assistants understand your components
- **Battle-tested** — Trusted by thousands of production apps

## Packages

| Package | Description |
|---|---|
| [`@blakeui/react`](https://www.npmjs.com/package/@blakeui/react) | Full component bundle |
| [`@blakeui/styles`](https://www.npmjs.com/package/@blakeui/styles) | Styles / theme only |
| Individual packages | e.g. `@blakeui/button`, `@blakeui/modal` — tree-shakeable per-component imports |

## Getting Started

Visit [blakeui.com/docs/react/getting-started/quick-start](https://blakeui.com/docs/react/getting-started/quick-start) to get started with BlakeUI.

```bash
npm install @blakeui/react
```

## Who Is This For?

BlakeUI is a good fit if you are building:

- **SaaS applications** — forms, tables, overlays, and notifications out of the box
- **Dashboards & admin panels** — data-dense layouts with consistent design tokens
- **E-commerce storefronts** — performant, accessible, SEO-friendly components
- **Marketing sites & landing pages** — polished UI without a heavyweight runtime
- **Any React / Next.js project** that values design quality and accessibility

## AI-Powered Development

BlakeUI is built for the AI-assisted development workflow.

| Tool | What it does |
|---|---|
| **MCP Server** (`@blakeui/react-mcp`) | Components that understand your theme — install the server in Cursor, Claude Code, Windsurf, or any MCP-compatible editor |
| **llms.txt** | Available at [blakeui.com/llms.txt](https://blakeui.com/llms.txt) — structured context for LLMs about every component |
| **Agent Skills** | Run `npx blakeui-cli agents-md` to install skills for Cursor, Claude Code, and more |

Works with **Cursor**, **Claude Code**, **Windsurf**, **GitHub Copilot**, and any tool that supports MCP or `llms.txt`.

## Compared To

| Library | How BlakeUI differs |
|---|---|
| **shadcn/ui** | BlakeUI is batteries-included with a consistent design system; shadcn is copy-paste-customize |
| **MUI** | BlakeUI is lighter, Tailwind-native, no CSS-in-JS runtime overhead |
| **Chakra UI** | BlakeUI uses React Aria (stronger a11y primitives) and Tailwind v4 (better perf) |
| **Mantine** | BlakeUI has AI tooling (MCP, llms.txt), Tailwind-first styling |

## Documentation

- **Latest (v1)**: [blakeui.com](https://blakeui.com)

## Storybook

Visit [storybook.blakeui.com](https://storybook.blakeui.com) to view the storybook for all components.


Please adhere to this project's [CODE_OF_CONDUCT](https://github.com/myblakebox/BlakeUI/blob/main/CODE_OF_CONDUCT.md).

## License

[MIT](https://choosealicense.com/licenses/mit/)
