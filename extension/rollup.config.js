import fs from "fs";
import path from "path";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-import-css";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) {
      server.kill(0);
    }
  }

  return {
    writeBundle() {
      if (server) {
        return;
      }
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default fs
  .readdirSync(path.join(__dirname, "webviews", "pages"))
  .map((input) => {
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
          // preprocess: sveltePreprocess({ sourceMap: !production }),
          // enable run-time checks when not in production
          compilerOptions: {
            dev: !production,
          },
          preprocess: sveltePreprocess(),
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: name + ".css" }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
          browser: true,
          dedupe: ["svelte"],
        }),
        commonjs(),
        typescript({
          tsconfig: "webviews/tsconfig.json",
          sourceMap: !production,
          inlineSources: !production,
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),
      ],
      watch: {
        clearScreen: false,
      },
    };
  });
