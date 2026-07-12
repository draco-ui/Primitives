import "style-dictionary-utils";

import postcss from "postcss";
import Color from "colorjs.io";
import prettier from "prettier";
import { formattedVariables } from "style-dictionary/utils";

import type { Root } from 'postcss';

export default {
  usesDtcg: true,
  source: ["src/**/*.json"],
  log: {
    errors: {
      brokenReferences: "console",
    },
  },
  hooks: {
    transforms: {
      "value/css-var": {
        type: "value",
        transitive: true,
        transform: (token: any): string => `var(--draco-${token.path.join("-")})`,
      },
    },
    formats: {
      "css/modes": async ({ dictionary }): Promise<string> => {
        const sheet: Root = postcss.root();
        
        const darkDictionary = {
          ...dictionary,
          allTokens: dictionary.allTokens.flatMap((target: any): any[] => {
            const dark: any = target.$extensions?.mode?.dark;
            
            if (dark === undefined) {
              return [];
            }
            
            const value: any = typeof dark === "object"
              ? new Color(dark.colorSpace, dark.components, dark.alpha).toString({ format: "hex" })
              : dark;

            return [{ 
              ...target, 
              value,
              $value: value
            }];
          }),
        };
        
        const vars = (dict: any): string => formattedVariables({
          format: "css",
          usesDtcg: true,
          dictionary: dict,
          outputReferences: true,
          formatting: {
            indentation: "  ",
            commentStyle: "long",
            commentPosition: "above",
          },
        });

        sheet.append(postcss.rule({ 
          selector: ":root" 
        }).append(vars(dictionary)));

        sheet.append(
          postcss
            .atRule({ 
              name: "media", 
              params: "(prefers-color-scheme: dark)" 
            })
            .append(postcss.rule({ 
              selector: ":root" 
            })
            .append(vars(darkDictionary))),
        );

        return prettier.format(sheet.toString(), {
          parser: "css"
        });
      },
    },
  },
  platforms: {
    css: {
      prefix: "draco",
      buildPath: "dist/css/",
      transformGroup: "css/extended",
      transforms: [
        "size/pxToRem"
      ], 
      files: [
        {
          format: "css/modes",
          destination: "tokens.css"
        }
      ],
    },
    scss: {
      buildPath: "dist/scss/",
      transforms: ["name/kebab", "value/css-var"],
      files: [
        {
          format: "scss/map-deep",
          destination: "_tokens.scss"
        }
      ],
    },
    js: {
      buildPath: "dist/js/",
      transforms: ["name/kebab", "value/css-var"],
      files: [
        {
          format: "javascript/esm",
          destination: "tokens.js",
          options: { 
            minify: true 
          }
        }
      ],
    },
    compose: {
      buildPath: "dist/compose/",
      transforms: [
        "attribute/cti",
        "name/camel",
        "color/composeColor",
        "size/pxToRem",
        "size/compose/remToDp",
      ],
      files: [
        {
          format: "compose/object",
          destination: "Tokens.kt",
          options: {
            className: "DracoTokens",
            packageName: "org.dracoui.tokens",
          },
        },
      ],
    }
  },
};
