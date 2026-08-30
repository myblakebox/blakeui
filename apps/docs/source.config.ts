import {rehypeCodeDefaultOptions} from "fumadocs-core/mdx-plugins";
import {defineConfig, defineDocs, frontmatterSchema} from "fumadocs-mdx/config";
import {z} from "zod";

import {shikiAaTransformer} from "./src/lib/shiki-aa";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // `frontmatterSchema` is a plain `z.object`, so Zod strips every key it does
    // not declare — `completeness` never reaches `page.data` unless it is named
    // here. The verdict itself is owned by the MCP server
    // (`apps/react-mcp/src/shared/behavior/contracts.ts`); this only lets the
    // docs site read what each page declares.
    schema: frontmatterSchema.extend({
      completeness: z.enum(["behavior-required", "styles-sufficient"]).optional(),
    }),
  },
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
