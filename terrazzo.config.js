import { kebabCase } from "scule";
import { globSync } from "node:fs";
import js from "@terrazzo/plugin-js";
import css from "@terrazzo/plugin-css";
import sass from "@terrazzo/plugin-sass";
import { defineConfig } from "@terrazzo/cli";
import tailwind from "@terrazzo/plugin-tailwind";

export default defineConfig({
  tokens: globSync([
    "./src/*.json",
    "./src/**/*.json",
  ]),
  outDir: "./dist",
  plugins: [
    css({
      filename: "css/tokens.css",
      legacyHex: true,
      modeSelectors: [
        {
          mode: "light",
          selectors: [
            `[data-color-mode="light"]`,
            `[data-color-mode="auto"][data-light-theme="light"]`,
          ],
        },
        {
          mode: "dark",
          selectors: [
            `[data-color-mode="dark"]`,
            `[data-color-mode="auto"][data-dark-theme="dark"]`,
            `[data-color-mode="auto"][data-dark-theme="dark"] ::backdrop`,
          ],
        },
      ],
      variableName: (token) => kebabCase(`--draco-${token.id}`),
    }),
    sass({
      filename: "scss/index.scss",
    }),
    js({ 
      js: "js/tokens.js", 
      ts: "js/tokens.d.ts" 
    }),
  ],
  lint: {
    rules: {
      "core/valid-dimension": [
        "error", { legacyFormat: true }
      ],
      "core/valid-color": [
        "error", { legacyFormat: true }
      ],
    },
  },
});
