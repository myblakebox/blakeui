import baseReactConfig from "@blakeui/standard/eslint/react.mjs";
import {defineConfig} from "eslint/config";

const config = defineConfig([
  ...baseReactConfig,
  {
    ignores: ["storybook-static/**", "storybook-static"],
  },
]);

export default config;
