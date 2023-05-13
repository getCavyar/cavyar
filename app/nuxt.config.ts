export default defineNuxtConfig({
  ssr: false,
  modules: [
    "@nuxtjs/color-mode",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
  ],
  css: ["@/assets/css/main.pcss"],
  runtimeConfig: {
    // Private keys are only available on the server
    mongoPW: process.env.MONGO_PW,
  },
  tailwindcss: {
    configPath: "./tailwind.config.js",
  },
  pinia: {
    autoImports: ["defineStore", "definePiniaStore"],
  },
  vite: {
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
    },
    optimizeDeps: {
      include: [
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
