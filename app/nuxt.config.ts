import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import inject from "@rollup/plugin-inject";
// import { dirname, join } from "path";
// import { fileURLToPath } from "url";

export default defineNuxtConfig({
  ssr: true,
  // security: {
  // basicAuth: {
  //   exclude: ["/api"],
  //   name: "early",
  //   pass: "123",
  //   enabled: true,
  //   message: "test",
  // },
  // },
  // rateLimiter: {
  //   tokensPerInterval: 100,
  //   interval: "minute",
  //   fireImmediately: false,
  //   throwError: true, // optional
  // },
  // corsHandler: {
  //   enabled: true,
  //   origin: "*", // Requests from any origin are allowed
  //   methods: "*", // All methods are allowed
  // },
  // },
  devtools: true,
  experimental: {
    renderJsonPayloads: false,
  },
  routeRules: {
    "/create": { ssr: false },
    "/snippets/:id": { ssr: true },
  },
  modules: [
    "@sidebase/nuxt-auth",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "nuxt-monaco-editor",
    "floating-vue/nuxt",
    "@nuxt/image",
    // "@nuxtjs/fontaine",
    // "nuxt-security",
  ],
  css: ["@/assets/css/main.pcss"],
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },
  image: {},
  // alias: {
  //   "@unhead/vue": require.resolve(
  //     join(
  //       dirname(fileURLToPath(import.meta.url)),
  //       "./node_modules/@unhead/vue",
  //     ),
  //   ),
  // },
  monacoEditor: {
    // These are default values:
    // dest: "_monaco",
    locale: "en",
    componentName: {
      codeEditor: "MonacoEditor",
      diffEditor: "MonacoDiffEditor",
    },
  },

  runtimeConfig: {
    // Secret Variables: only available on the server
    mongoPW: process.env.MONGO_PW,
    authSecret: process.env.AUTH_SECRET,
    githubClientSecret: process.env.GH_CLIENT_SECRET,
    privateRPC: process.env.PRIVATE_RPC,
    // Public Variables
    public: {
      baseUrl: process.env.BASE_URL,
      githubClientId: process.env.GITHUB_CLIENT_ID,
      auth: {
        computed: {
          origin: process.env.BASE_URL,
        },
      },
      nextauthUrl: process.env.BASE_URL,
    },
  },
  tailwindcss: {
    configPath: "./tailwind.config.js",
  },
  auth: {
    provider: {
      type: "authjs",
    },
  },
  pinia: {
    autoImports: ["defineStore", "definePiniaStore"],
  },
  vite: {
    plugins: [
      NodeGlobalsPolyfillPlugin({
        buffer: true,
        process: true,
      }),
      NodeModulesPolyfillPlugin({}),
    ],
    server: {
      hmr: {
        protocol: "ws",
        host: "localhost",
      },
    },
    esbuild: {
      target: "esnext",
    },
    build: {
      target: "esnext",
      rollupOptions: {
        plugins: [
          inject({
            Buffer: ["buffer", "Buffer"],
          }),
        ],
      },
    },
    optimizeDeps: {
      include: [
        // uncomment in case anchor is used one day to avoid errors
        // "@project-serum/anchor",
        "@solana/web3.js",
        "buffer",
      ],
      esbuildOptions: {
        target: "esnext",
      },
    },
    define: {
      "process.env.BROWSER": true,
      "process.env.BASE_URL": JSON.stringify(process.env.BASE_URL),
    },
  },
});
