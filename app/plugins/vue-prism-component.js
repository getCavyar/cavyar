import Prism from "vue-prism-component";

import "prismjs/themes/prism-okaidia.css"; // Theme

import "prismjs/components/prism-rust.js"; // Language
import "prismjs/components/prism-typescript.js"; // Language
import "prismjs/components/prism-python.js"; // Language

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.component("Prism", Prism);
});
