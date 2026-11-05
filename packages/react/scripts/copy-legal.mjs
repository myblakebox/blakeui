/**
 * Copies the repository's LICENSE and NOTICE into this package before packing, so both
 * ship in the tarball under `npm pack` as well as `pnpm pack`. Apache-2.0 §4(d) requires
 * the NOTICE to travel with every distribution. `--clean` removes the copies after packing.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(packageDir, "../..");
const FILES = ["LICENSE", "NOTICE"];

for (const file of FILES) {
  const target = path.join(packageDir, file);

  if (process.argv.includes("--clean")) {
    fs.rmSync(target, {force: true});
  } else {
    fs.copyFileSync(path.join(repoRoot, file), target);
  }
}
