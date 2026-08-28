/**
 * Version stamping.
 *
 * Every MCP response says which BlakeUI version it was generated from, so an
 * answer that has been copied into a file, a PR, or another agent's context can
 * still be traced back to a release.
 *
 * Two versions matter and neither is written by hand:
 *
 *   - the BlakeUI library version, taken from `packages/react/package.json` when
 *     the catalog was extracted and served back through the API's `version` /
 *     `latestVersion` fields;
 *   - the MCP server version, injected at build time from this package's own
 *     `package.json`.
 */

import {packageInfo} from "./package-info";

const UNKNOWN = "unknown";

let blakeVersion: string = UNKNOWN;

/**
 * Record the BlakeUI version the catalog was generated from. Called once during
 * server start-up with the version the API reports.
 */
export function setBlakeVersion(version: string | undefined | null): void {
  const trimmed = (version ?? "").trim();

  blakeVersion = trimmed.length > 0 ? trimmed : UNKNOWN;
}

/** The BlakeUI version recorded at start-up. */
export function getBlakeVersion(): string {
  return blakeVersion;
}

/** Reset to the start-up default. Used by tests. */
export function resetBlakeVersion(): void {
  blakeVersion = UNKNOWN;
}

/**
 * The stamp appended to every MCP response.
 *
 * `responseVersion` lets a tool prefer the version carried by the payload it
 * just fetched over the one recorded at start-up, so a response never claims a
 * version the data did not come from.
 */
export function versionStamp(responseVersion?: string | null): string {
  const trimmed = (responseVersion ?? "").trim();
  const blake = trimmed.length > 0 ? trimmed : blakeVersion;

  return `_Generated from BlakeUI ${blake} · @blakeui/react-mcp ${packageInfo.version}_`;
}

/** Append the stamp to a response body, separated by a rule. */
export function withVersionStamp(text: string, responseVersion?: string | null): string {
  return `${text.replace(/\s+$/, "")}\n\n---\n\n${versionStamp(responseVersion)}\n`;
}
