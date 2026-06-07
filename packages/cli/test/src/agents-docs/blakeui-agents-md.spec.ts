import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  buildDocTree,
  collectDemoFiles,
  collectDocFiles,
  collectMigrationDocFiles,
  ensureGitignoreEntry,
  generateBlakeuiMdIndex,
  getBlakeuiVersions,
  injectIntoClaudeMd
} from '@helpers/agents-docs/blakeui-agents-md';
import {afterEach, describe, expect, it} from 'vitest';

describe('blakeui-agents-md', () => {
  describe('buildDocTree', () => {
    it('groups files by directory and sorts sections and files', () => {
      const files = [{relativePath: 'b.mdx'}, {relativePath: 'a.mdx'}, {relativePath: 'sub/c.mdx'}];
      const tree = buildDocTree(files);

      expect(tree).toHaveLength(2);
      const root = tree.find((s) => s.name === '.');
      const sub = tree.find((s) => s.name === 'sub');

      expect(root?.files.map((f) => f.relativePath)).toEqual(['a.mdx', 'b.mdx']);
      expect(sub?.files.map((f) => f.relativePath)).toEqual(['sub/c.mdx']);
    });

    it('returns empty array for empty input', () => {
      expect(buildDocTree([])).toEqual([]);
    });
  });

  describe('generateBlakeuiMdIndex', () => {
    it('generates migration index with root and start hint', () => {
      const data = {
        migrationDocsPath: './.blakeui-docs/migration',
        migrationSections: buildDocTree([
          {relativePath: 'agent-index.mdx'},
          {relativePath: 'hooks.mdx'}
        ]),
        selection: 'migration' as const
      };
      const out = generateBlakeuiMdIndex(data, 'migration');

      expect(out).toContain('[BlakeUI Migration Docs Index]');
      expect(out).toContain('root: ./.blakeui-docs/migration');
      expect(out).toContain('Start with: agent-index.mdx');
      expect(out).toContain('.:{agent-index.mdx,hooks.mdx}');
      expect(out).toContain('blakeui agents-md --migration');
    });

    it('generates react index with sections and run command', () => {
      const data = {
        reactDocsPath: './.blakeui-docs/react',
        reactSections: buildDocTree([{relativePath: 'getting-started.mdx'}]),
        selection: 'react' as const
      };
      const out = generateBlakeuiMdIndex(data, 'react');

      expect(out).toContain('[BlakeUI React v3 Docs Index]');
      expect(out).toContain('root: ./.blakeui-docs/react');
      expect(out).toContain('getting-started.mdx');
      expect(out).toContain('blakeui agents-md --react');
    });

    it('generates native index when library is native', () => {
      const data = {
        nativeDocsPath: './.blakeui-docs/native',
        nativeSections: buildDocTree([{relativePath: 'intro.mdx'}]),
        selection: 'native' as const
      };
      const out = generateBlakeuiMdIndex(data, 'native');

      expect(out).toContain('[BlakeUI Native Docs Index]');
      expect(out).toContain('root: ./.blakeui-docs/native');
      expect(out).toContain('blakeui agents-md --native');
    });

    it('uses custom output file in run command when provided', () => {
      const data = {
        migrationDocsPath: './.blakeui-docs/migration',
        outputFile: 'CLAUDE.md',
        selection: 'migration' as const
      };
      const out = generateBlakeuiMdIndex(data, 'migration');

      expect(out).toContain('blakeui agents-md --migration --output CLAUDE.md');
    });
  });

  describe('injectIntoClaudeMd', () => {
    it('appends migration block when content has no existing block', () => {
      const content = '# My project\n';
      const out = injectIntoClaudeMd(content, undefined, undefined, 'migration-index');

      expect(out).toContain('<!-- BLAKEUI-MIGRATION-AGENTS-MD-START -->');
      expect(out).toContain('migration-index');
      expect(out).toContain('<!-- BLAKEUI-MIGRATION-AGENTS-MD-END -->');
      expect(out).toContain('# My project');
    });

    it('replaces existing migration block when present', () => {
      const content =
        'pre\n<!-- BLAKEUI-MIGRATION-AGENTS-MD-START -->\nold\n<!-- BLAKEUI-MIGRATION-AGENTS-MD-END -->\npost';
      const out = injectIntoClaudeMd(content, undefined, undefined, 'new-migration');

      expect(out).toContain('pre');
      expect(out).toContain('post');
      expect(out).toContain('new-migration');
      expect(out).not.toContain('old');
    });

    it('injects react and migration when both provided', () => {
      const content = '';
      const out = injectIntoClaudeMd(content, 'react-index', undefined, 'migration-index');

      expect(out).toContain('<!-- BLAKEUI-REACT-AGENTS-MD-START -->');
      expect(out).toContain('react-index');
      expect(out).toContain('<!-- BLAKEUI-MIGRATION-AGENTS-MD-START -->');
      expect(out).toContain('migration-index');
    });

    it('leaves content unchanged when all index contents are undefined', () => {
      const content = '# Only this';
      const out = injectIntoClaudeMd(content, undefined, undefined, undefined);

      expect(out).toBe('# Only this');
    });
  });

  describe('ensureGitignoreEntry', () => {
    let tmpDir: string;

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, {recursive: true});
      }
    });

    it('adds .blakeui-docs/ to new .gitignore and returns updated', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      const result = ensureGitignoreEntry(tmpDir);

      expect(result.updated).toBe(true);
      expect(result.alreadyPresent).toBe(false);
      expect(result.path).toBe(path.join(tmpDir, '.gitignore'));
      expect(fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')).toContain('.blakeui-docs/');
    });

    it('does not duplicate when entry already present', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.blakeui-docs/\n', 'utf-8');
      const result = ensureGitignoreEntry(tmpDir);

      expect(result.updated).toBe(false);
      expect(result.alreadyPresent).toBe(true);
      expect(fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8')).toBe('.blakeui-docs/\n');
    });

    it('recognizes .blakeui-docs with trailing path as present', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(path.join(tmpDir, '.gitignore'), '.blakeui-docs\n', 'utf-8');
      const result = ensureGitignoreEntry(tmpDir);

      expect(result.alreadyPresent).toBe(true);
      expect(result.updated).toBe(false);
    });
  });

  describe('getBlakeuiVersions', () => {
    let tmpDir: string;

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, {recursive: true});
      }
    });

    it('returns react version from dependencies', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({dependencies: {'@blakeui/react': '^2.0.0'}}),
        'utf-8'
      );
      const result = getBlakeuiVersions(tmpDir);

      expect(result.react).toBe('2.0.0');
      expect(result.error).toBeUndefined();
    });

    it('returns react version from devDependencies', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({devDependencies: {'@blakeui/react': '3.0.0'}}),
        'utf-8'
      );
      const result = getBlakeuiVersions(tmpDir);

      expect(result.react).toBe('3.0.0');
    });

    it('returns error when no package.json', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      const result = getBlakeuiVersions(tmpDir);

      expect(result.error).toContain('No package.json');
    });

    it('returns error when no BlakeUI packages in simple project', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(
        path.join(tmpDir, 'package.json'),
        JSON.stringify({dependencies: {react: '18.0.0'}}),
        'utf-8'
      );
      const result = getBlakeuiVersions(tmpDir);

      expect(result.error).toContain('not installed');
    });
  });

  describe('collectDocFiles', () => {
    let tmpDir: string;

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, {recursive: true});
      }
    });

    it('returns mdx and md files and excludes index files', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(path.join(tmpDir, 'page.mdx'), '', 'utf-8');
      fs.writeFileSync(path.join(tmpDir, 'index.mdx'), '', 'utf-8');
      fs.writeFileSync(path.join(tmpDir, 'other.md'), '', 'utf-8');
      fs.mkdirSync(path.join(tmpDir, 'sub'), {recursive: true});
      fs.writeFileSync(path.join(tmpDir, 'sub', 'nested.mdx'), '', 'utf-8');
      fs.writeFileSync(path.join(tmpDir, 'sub', 'index.md'), '', 'utf-8');

      const files = collectDocFiles(tmpDir);

      const paths = files.map((f) => f.relativePath).sort();

      expect(paths).toContain('page.mdx');
      expect(paths).toContain('other.md');
      expect(paths).toContain('sub/nested.mdx');
      expect(paths).not.toContain('index.mdx');
      expect(paths).not.toContain('sub/index.md');
    });
  });

  describe('collectMigrationDocFiles', () => {
    let tmpDir: string;

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, {recursive: true});
      }
    });

    it('returns all mdx and md files including index', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(path.join(tmpDir, 'index.mdx'), '', 'utf-8');
      fs.writeFileSync(path.join(tmpDir, 'hooks.mdx'), '', 'utf-8');

      const files = collectMigrationDocFiles(tmpDir);

      const paths = files.map((f) => f.relativePath).sort();

      expect(paths).toContain('index.mdx');
      expect(paths).toContain('hooks.mdx');
    });
  });

  describe('collectDemoFiles', () => {
    let tmpDir: string;

    afterEach(() => {
      if (tmpDir && fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, {recursive: true});
      }
    });

    it('returns tsx files excluding path ending with /index.tsx', () => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blakeui-agents-md-test-'));
      fs.writeFileSync(path.join(tmpDir, 'button.tsx'), '', 'utf-8');
      fs.mkdirSync(path.join(tmpDir, 'sub'), {recursive: true});
      fs.writeFileSync(path.join(tmpDir, 'sub', 'index.tsx'), '', 'utf-8');

      const files = collectDemoFiles(tmpDir);

      const paths = files.map((f) => f.relativePath).sort();

      expect(paths).toContain('button.tsx');
      expect(paths).not.toContain('sub/index.tsx');
    });

    it('returns empty array when dir does not exist', () => {
      tmpDir = path.join(os.tmpdir(), 'blakeui-agents-md-nonexistent-' + Date.now());
      expect(collectDemoFiles(tmpDir)).toEqual([]);
    });
  });
});
