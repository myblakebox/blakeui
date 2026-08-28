/**
 * The single place an MCP tool result is built, so the version stamp cannot be
 * forgotten on one code path and present on another.
 */

import {withVersionStamp} from "./version-stamp";

export interface ToolTextResult {
  // The MCP SDK's result type carries an index signature; matching it here keeps
  // handlers assignable without a cast at every call site.
  [key: string]: unknown;
  content: Array<{type: "text"; text: string}>;
  isError?: boolean;
}

/**
 * Build a text tool result carrying the version stamp.
 *
 * @param text the response body
 * @param options.version the version the payload reported, when the tool has one
 * @param options.isError marks the result as an error for the MCP client
 */
export function textResult(
  text: string,
  options: {version?: string | null; isError?: boolean} = {},
): ToolTextResult {
  const result: ToolTextResult = {
    content: [{type: "text" as const, text: withVersionStamp(text, options.version)}],
  };

  if (options.isError) {
    result.isError = true;
  }

  return result;
}
