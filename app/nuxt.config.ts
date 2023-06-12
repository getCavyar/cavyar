import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import NodeModulesPolyfillPlugin from "@esbuild-plugins/node-modules-polyfill";
import inject from "@rollup/plugin-inject";

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
  experimental: {
    renderJsonPayloads: false,
  },
  routeRules: {
    "/create": { ssr: false },
  },
  modules: [
    "@sidebase/nuxt-auth",
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    // "nuxt-security",
  ],
  css: ["@/assets/css/main.pcss"],
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },

  runtimeConfig: {
    // Secret Variables: only available on the server
    mongoPW: process.env.MONGO_PW,
    authSecret: process.env.AUTH_SECRET,
    // Public Variables
    public: {
      auth: {
        computed: {
          origin: process.env.AUTH_ORIGIN,
        },
      },
      nextauthUrl: process.env.NEXTAUTH_URL,
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
      NodeModulesPolyfillPlugin(),
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
    },
  },
});
