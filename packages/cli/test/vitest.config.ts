import {fileURLToPath} from 'node:url';

import {defineConfig} from 'vitest/config';

const resolvePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@helpers': resolvePath('../src/helpers'),
      build: resolvePath('../plugins'),
      src: resolvePath('../src')
    }
  }
});
