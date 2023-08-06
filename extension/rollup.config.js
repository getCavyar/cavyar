import fs from "fs";
import path from "path";
import css from "rollup-plugin-import-css";
import sveltePreprocess from "svelte-preprocess";

import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

const production = !process.env.ROLLUP_WATCH;

export default [
  ...fs.readdirSync(path.join(__dirname, "webviews", "pages")).map((input) => {
    const name = input.split(".")[0];
    return {
      input: "webviews/pages/" + input,
      output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "out/compiled/" + name + ".js",
        inlineDynamicImports: true,
      },
      plugins: [
        svelte({
          preprocess: sveltePreprocess({
            typescript: {
              tsconfigFile: "./webviews/tsconfig.json", // Adjust the path to your tsconfig.json if needed
            },
          }),
          compilerOptions: {
            dev: !production,
          },
        }),
        resolve({
          browser: true,
          dedupe: ["svelte"],
        }),
        commonjs(),
        typescript({
          tsconfig: "./webviews/tsconfig.json",
          // sourceMap: !production,
          // inlineSources: !production,
        }),

        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: name + ".css" }),

        production && terser(),

        copy({
          targets: [
            {
              src: "media/**/*",
              dest: "out/compiled",
            },
          ],
        }),
      ],
      watch: {
        clearScreen: false,
      },
    };
  }),
];
