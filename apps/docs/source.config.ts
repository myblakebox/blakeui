import {rehypeCodeDefaultOptions} from "fumadocs-core/mdx-plugins";
import {defineConfig, defineDocs} from "fumadocs-mdx/config";

import {shikiAaTransformer} from "./src/lib/shiki-aa";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    providerImportSource: "@/mdx-components",
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      // See src/lib/shiki-aa.ts — github-light's keyword red and JSX-tag green
      // miss AA, and this must be applied to every highlighting path, not just
      // this one.
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), shikiAaTransformer],
      // Preserve meta strings in the output
      // meta: true,
    },
    rehypePlugins: [],
    remarkNpmOptions: {
      persist: {
        id: "package-manager",
      },
    },
    remarkPlugins: [],
  },
});
