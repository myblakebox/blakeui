#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Read the just-uploaded dataset back out of R2 and assert it is what the API
 * expects to serve.
 *
 * The extractor exits 0 whether or not anything useful reached the bucket: it
 * catches per-component failures, and the ctx.json upload is wrapped in a
 * try/catch that only warns. Combined with the listener that never existed,
 * that is how the catalog sat at v1.0.0 while packages/react moved to 1.3.0
 * and nobody saw a red build. So the refresh is not finished until the data has
 * been read back.
 *
 * Checks, in the order they would fail:
 *   1. both objects exist and parse
 *   2. the version matches packages/react's package.json — i.e. this run
 *      actually replaced the old dataset rather than silently no-op'ing
 *   3. the component list is non-empty and the two objects agree on it
 *   4. every component carries a completeness verdict
 */

import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {fileURLToPath} from "node:url";

import {CATALOG_COMPONENTS, COMPLETENESS_VALUES} from "../src/shared/behavior";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(HERE, "../../..");

const BUCKET = process.env.R2_BUCKET_NAME || "blakeui-mcp-data";
const PREFIX = "react/v1/latest";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }

  return value;
}

const accountId = required("CLOUDFLARE_ACCOUNT_ID");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  },
});

async function readJson<T>(key: string): Promise<T> {
  const response = await s3.send(new GetObjectCommand({Bucket: BUCKET, Key: key}));

  if (!response.Body) {
    throw new Error(`${key} is empty`);
  }

  return JSON.parse(await response.Body.transformToString()) as T;
}

interface ComponentEntry {
  name: string;
  completeness?: string;
}

async function main() {
  const failures: string[] = [];

  console.log(`Reading back s3://${BUCKET}/${PREFIX}/…`);

  const components = await readJson<Record<string, ComponentEntry>>(`${PREFIX}/components.json`);
  const ctx = await readJson<{components: string[]; version: string}>(`${PREFIX}/ctx.json`);

  const names = Object.keys(components).sort();
  console.log(`  components.json: ${names.length} components`);
  console.log(`  ctx.json:        ${ctx.components.length} components, version ${ctx.version}`);

  // 2. Did this run actually replace the dataset?
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "packages/react/package.json"), "utf8")) as {
    version: string;
  };
  const expected = `v${pkg.version}`;

  if (ctx.version !== expected) {
    failures.push(
      `ctx.json reports ${ctx.version}, but packages/react is ${pkg.version}. ` +
        `The upload did not land, or it read a stale ref.`,
    );
  }

  // 3. Non-empty, and the two objects agree.
  if (names.length === 0) {
    failures.push("components.json is empty");
  }

  const ctxNames = [...ctx.components].sort();
  if (JSON.stringify(names) !== JSON.stringify(ctxNames)) {
    const onlyComponents = names.filter((n) => !ctxNames.includes(n));
    const onlyCtx = ctxNames.filter((n) => !names.includes(n));
    failures.push(
      `components.json and ctx.json disagree — only in components.json: ` +
        `[${onlyComponents.join(", ")}], only in ctx.json: [${onlyCtx.join(", ")}]`,
    );
  }

  // 4. Every component carries a verdict, and it is one of the defined values.
  const missing = names.filter((name) => !components[name]?.completeness);
  if (missing.length > 0) {
    failures.push(`No completeness verdict for: ${missing.join(", ")}`);
  }

  const invalid = names.filter((name) => {
    const value = components[name]?.completeness;

    return value !== undefined && !COMPLETENESS_VALUES.includes(value as never);
  });
  if (invalid.length > 0) {
    failures.push(`Unrecognised completeness value on: ${invalid.join(", ")}`);
  }

  // The catalog we classify against and the catalog we published should match.
  // A drift here means a component was added or renamed without a verdict.
  const unclassified = names.filter((name) => !CATALOG_COMPONENTS.includes(name));
  if (unclassified.length > 0) {
    failures.push(
      `Published components that src/shared/behavior does not classify: ${unclassified.join(", ")}`,
    );
  }

  if (failures.length > 0) {
    console.error("");
    for (const failure of failures) {
      console.error(`❌ ${failure}`);
    }
    process.exit(1);
  }

  const behaviorRequired = names.filter(
    (n) => components[n]?.completeness === "behavior-required",
  ).length;

  console.log(
    `✅ ${names.length} components at ${ctx.version} — ` +
      `${behaviorRequired} behavior-required, ${names.length - behaviorRequired} styles-sufficient`,
  );
}

main().catch((error) => {
  console.error("❌ Verification failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
