/**
 * Regression fixture for the Tabs CSS-only port.
 *
 * The incident this guards is written up in
 * `fixtures/tabs-css-only-port-incident.md` — read that first. In short: an
 * agent building in vanilla JS pulled the Tabs stylesheet, de-Tailwinded it,
 * kept the BEM class names, hand-wrote a click handler, and shipped tabs that
 * looked right and did not work. The tool call succeeded, which is what made it
 * possible.
 */

import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {getComponentSourceStylesTool} from "./get-component-source-styles";

const HERE = fileURLToPath(new URL(".", import.meta.url));

const TABS_CSS = '.tabs__tab[data-selected="true"] { z-index: 1; }';

type Handler = (input: any) => Promise<{content: Array<{text: string}>; isError?: boolean}>;

/**
 * Register the tool against a stand-in server and hand back the handler, so the
 * test exercises exactly the function the MCP client would call.
 */
async function buildHandler(componentList: string[]): Promise<Handler> {
  let handler: Handler | undefined;

  const server = {
    registerTool(_name: string, _meta: unknown, fn: Handler) {
      handler = fn;
    },
  } as unknown as McpServer;

  const ctx = await getComponentSourceStylesTool.ctx!({
    componentList,
    docPaths: [],
    version: "v1.3.0",
    timestamp: 0,
  });

  getComponentSourceStylesTool.exec(server, {
    ctx: ctx as {componentList: string[]},
    name: getComponentSourceStylesTool.name,
    description: getComponentSourceStylesTool.description,
    config: {apiBaseUrl: "https://mcp-api.test"},
  });

  if (!handler) throw new Error("tool did not register a handler");

  return handler;
}

function stubStylesEndpoint(component: string, completeness: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        version: "v1.3.0",
        results: [
          {
            component,
            completeness,
            filePath: `${component.toLowerCase()}.css`,
            stylesCode: TABS_CSS,
            githubUrl: "https://github.com/myblakebox/BlakeUI",
          },
        ],
      }),
    ),
  );
}

describe("get_component_source_styles — Tabs regression", () => {
  let handler: Handler;

  beforeEach(async () => {
    handler = await buildHandler(["Tabs", "Card"]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("errors when Tabs is requested without behavior_source", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await handler({components: ["Tabs"]});

    expect(result.isError).toBe(true);
    // The gate must short-circuit: the styles are never fetched, so they can
    // never be half-returned alongside the warning.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("names the behaviour that is missing, not just that something is", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const text = (await handler({components: ["Tabs"]})).content[0]!.text;

    expect(text).toContain("Tabs");
    // The four things a CSS-only port of Tabs actually loses.
    expect(text).toMatch(/arrow-key navigation/i);
    expect(text).toMatch(/roving tabindex/i);
    expect(text).toMatch(/ARIA/i);
    expect(text).toMatch(/data-\*|selected state/i);
    // And both ways out.
    expect(text).toContain('behavior_source: "blake"');
    expect(text).toContain('behavior_source: "self"');
  });

  it("points at the contract without advertising anything", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const text = (await handler({components: ["Tabs"]})).content[0]!.text;

    // Everything the caller needs is in the error itself, and the next step is
    // another free tool.
    expect(text).toContain("get_component_behavior");

    // This error used to close by offering "prebuilt vanilla and Web Component
    // adapters" from Pro. No such adapters exist — Pro ships @blakeui/pro-react
    // and nothing else, so the line was telling people to buy a thing that was
    // not there. Anything added back here has to be true of a shipped package.
    expect(text).not.toMatch(/vanilla and Web Component|prebuilt .*adapter/i);
  });

  it('returns the contract ahead of the styles for behavior_source: "self"', async () => {
    stubStylesEndpoint("Tabs", "behavior-required");

    const text = (await handler({components: ["Tabs"], behavior_source: "self"})).content[0]!.text;

    const contractAt = text.indexOf("Tabs — interaction contract");
    const keyboardAt = text.indexOf("## Keyboard map");
    const dataAt = text.indexOf("## Data-attribute contract");
    const stylesAt = text.indexOf("```css");

    expect(contractAt).toBeGreaterThanOrEqual(0);
    expect(keyboardAt).toBeGreaterThan(contractAt);
    expect(dataAt).toBeGreaterThan(keyboardAt);
    expect(stylesAt).toBeGreaterThan(dataAt);

    // The specific attributes the incident tripped over.
    expect(text).toContain("data-selected");
    expect(text).toContain("data-disabled");
    expect(text).toContain("data-entering");
    expect(text).toContain("data-exiting");
    expect(text).toContain("aria-controls");
    // And the styles really are in there too.
    expect(text).toContain(TABS_CSS);
  });

  it('returns the styles without the contract for behavior_source: "blake"', async () => {
    stubStylesEndpoint("Tabs", "behavior-required");

    const text = (await handler({components: ["Tabs"], behavior_source: "blake"})).content[0]!.text;

    expect(text).toContain(TABS_CSS);
    expect(text).not.toContain("## Keyboard map");
    expect(text).toContain("get_component_behavior");
  });

  it("does not gate a styles-sufficient component", async () => {
    stubStylesEndpoint("Card", "styles-sufficient");

    const result = await handler({components: ["Card"]});

    expect(result.isError).toBeUndefined();
    expect(result.content[0]!.text).toContain(TABS_CSS);
  });

  it("stamps every response with the BlakeUI version", async () => {
    stubStylesEndpoint("Card", "styles-sufficient");

    const text = (await handler({components: ["Card"]})).content[0]!.text;

    expect(text).toMatch(/Generated from BlakeUI v1\.3\.0/);
  });

  it("keeps the incident write-up alongside the test", () => {
    const doc = readFileSync(join(HERE, "fixtures/tabs-css-only-port-incident.md"), "utf8");

    expect(doc).toContain("data-selected");
    expect(doc).toContain("roving tabindex");
    expect(doc).toContain("behavior_source");
  });
});
