/**
 * blakeui-agents-md: Generate BlakeUI documentation index for AI coding agents.
 *
 * Downloads docs from GitHub via git sparse-checkout, builds a compact
 * index of all doc files, and injects it into CLAUDE.md or AGENTS.md.
 *
 * This implementation is adapted from Next.js's agents-md tool:
 * https://github.com/vercel/next.js/tree/canary/packages/next-codemod/lib/agents-md.ts
 *
 * Portions of this code are based on work by Vercel, Inc.
 * Original Next.js code is licensed under the MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';

import {cloneDocsFolder} from './clone-docs';
import {
  buildDocTree,
  collectDemoFiles,
  collectDocFiles,
  collectMigrationDocFiles
} from './doc-tree';
import {ensureGitignoreEntry, generateBlakeuiMdIndex, injectIntoClaudeMd} from './index-and-inject';
import {getBlakeuiVersions} from './workspace-versions';

export type DocSelection = 'react' | 'native' | 'migration';

export {
  buildDocTree,
  collectDemoFiles,
  collectDocFiles,
  collectMigrationDocFiles,
  ensureGitignoreEntry,
  generateBlakeuiMdIndex,
  getBlakeuiVersions,
  injectIntoClaudeMd
};

export type {GitignoreStatus, BlakeuiMdIndexData} from './index-and-inject';
export type {BlakeuiVersionsResult} from './workspace-versions';

/** Default branch for all docs (React, Native, and migration). */
const DEFAULT_DOCS_BRANCH = 'main';

interface PullOptions {
  cwd: string;
  docsDir?: string | undefined;
  selection: DocSelection;
  useSsh?: boolean | undefined;
}

interface PullResult {
  success: boolean;
  docsPath?: string | undefined;
  error?: string | undefined;
}

export async function pullDocs(options: PullOptions): Promise<PullResult> {
  const {cwd, docsDir, selection, useSsh} = options;

  const gitRef = DEFAULT_DOCS_BRANCH;

  const docsPath = docsDir ?? path.join(cwd, '.blakeui-docs');

  try {
    // Ensure the docs directory exists (but don't remove it - preserve other libraries)
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, {recursive: true});
    }

    await cloneDocsFolder(gitRef, docsPath, selection, useSsh ?? false);

    return {
      docsPath,
      success: true
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      success: false
    };
  }
}
