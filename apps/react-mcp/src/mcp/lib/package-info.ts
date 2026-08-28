/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Package information - only the essential fields
 * This avoids bundling the entire package.json
 */

import {createRequire} from "node:module";

// At build time, tsup replaces __PACKAGE_NAME__ and __PACKAGE_VERSION__ with the
// values from package.json, and the `typeof` guard folds to a constant so the
// development branch below is dropped from the bundle.
//
// The development branch reads package.json rather than repeating a literal, so
// there is no hand-written version string in this file to go stale.

function readPackageField(field: "name" | "version"): string {
  try {
    const require_ = createRequire(import.meta.url);

    return (require_("../../../package.json") as Record<string, string>)[field] ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const packageInfo = {
  // @ts-ignore - __PACKAGE_NAME__ is replaced by tsup at build time
  name: typeof __PACKAGE_NAME__ !== "undefined" ? __PACKAGE_NAME__ : readPackageField("name"),
  version:
    // @ts-ignore - __PACKAGE_VERSION__ is replaced by tsup at build time
    typeof __PACKAGE_VERSION__ !== "undefined" ? __PACKAGE_VERSION__ : readPackageField("version"),
};
