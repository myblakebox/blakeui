import {defineWorkersProject} from "@cloudflare/vitest-pool-workers/config";
import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      // The HTTP API runs in the Workers runtime, against a real wrangler config.
      defineWorkersProject({
        test: {
          name: "api",
          globals: true,
          include: ["src/api/**/*.test.ts"],
          poolOptions: {
            workers: {
              wrangler: {
                configPath: "./wrangler.toml",
                environment: "test",
              },
            },
          },
        },
      }),
      // Everything else runs in plain Node, so it can read the repository from
      // disk — the completeness parity and MDX assertions need the source files,
      // not the network.
      {
        test: {
          name: "node",
          globals: true,
          environment: "node",
          include: ["src/mcp/**/*.test.ts", "src/shared/**/*.test.ts"],
        },
      },
    ],
  },
});
